import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import Login from '../src/pages/Login';
import Register from '../src/pages/Register';
import Navbar from '../src/components/Navbar';
import * as apiModule from '../src/services/api';

describe('Phase 2: Authentication Frontend Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // T-AUTH-UI-01: Login Form Validation
  it('T-AUTH-UI-01: Displays inline validation errors when submitted with empty fields', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Email address is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password is required/i)).toBeInTheDocument();
  });

  // T-AUTH-UI-02: Successful Login Submission
  it('T-AUTH-UI-02: Submitting valid login triggers API call and saves token to storage', async () => {
    const postSpy = vi.spyOn(apiModule.api, 'post').mockResolvedValueOnce({
      token: 'mock-valid-jwt-token',
      user: { id: 'u1', name: 'Test User', email: 'test@example.com' },
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' },
    });

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(localStorage.getItem('token')).toBe('mock-valid-jwt-token');
    });
  });

  // T-AUTH-UI-03: Server Error Alert Display
  it('T-AUTH-UI-03: Server error messages display in an alert banner', async () => {
    vi.spyOn(apiModule.api, 'post').mockRejectedValueOnce(
      new Error('Invalid email or password')
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'wrongpass' },
    });

    const submitBtn = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Invalid email or password/i);
  });

  // T-AUTH-UI-04: Navbar authenticated state & Logout
  it('T-AUTH-UI-04: Authenticated user sees profile name and logout button triggers logout', async () => {
    const handleLogout = vi.fn();
    const mockUser = { name: 'Alice Walker', email: 'alice@example.com' };

    render(
      <MemoryRouter>
        <Navbar user={mockUser} cartCount={0} onLogout={handleLogout} />
      </MemoryRouter>
    );

    expect(screen.getByText('Alice Walker')).toBeInTheDocument();
    const logoutBtn = screen.getByTitle('Log out');
    expect(logoutBtn).toBeInTheDocument();

    fireEvent.click(logoutBtn);
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });
});

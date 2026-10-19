/**
 * Validation and Transformation Middleware for Auth requests
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(req, res, next) {
  const { name, email, password } = req.body || {};
  const errors = [];

  // Transformations
  const transformedName = typeof name === 'string' ? name.trim() : '';
  const transformedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const transformedPassword = typeof password === 'string' ? password : '';

  // Validations
  if (!transformedName || transformedName.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  if (!transformedEmail || !EMAIL_REGEX.test(transformedEmail)) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!transformedPassword || transformedPassword.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid registration parameters',
        details: errors,
      },
    });
  }

  // Assign cleaned values back to req.body
  req.body.name = transformedName;
  req.body.email = transformedEmail;
  req.body.password = transformedPassword;

  next();
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body || {};
  const errors = [];

  const transformedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const transformedPassword = typeof password === 'string' ? password : '';

  if (!transformedEmail || !EMAIL_REGEX.test(transformedEmail)) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  if (!transformedPassword) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid login parameters',
        details: errors,
      },
    });
  }

  req.body.email = transformedEmail;
  req.body.password = transformedPassword;

  next();
}

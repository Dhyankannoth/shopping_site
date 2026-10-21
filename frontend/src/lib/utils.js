/**
 * Utility function to combine and clean class names
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

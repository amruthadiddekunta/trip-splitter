/**
 * Money utilities for Trip Splitter.
 * All monetary amounts in state and storage are stored as integer paise.
 * ₹1 = 100 paise. ₹1,250.50 = 125050 paise.
 */

/**
 * Formats a paise amount into Indian Rupee currency format (e.g., ₹1,00,000.00).
 */
export function formatINR(paise: number): string {
  const rupees = Math.abs(paise) / 100;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);

  return paise < 0 ? `-${formatted}` : formatted;
}

/**
 * Formats a rupees amount (floating point or integer) into Indian Rupee currency format.
 */
export function formatRupeesINR(rupees: number): string {
  const paise = Math.round(rupees * 100);
  return formatINR(paise);
}

/**
 * Converts a rupees string input (e.g. "1250.50" or "100") into integer paise.
 * Returns null if input is not a valid number or has more than 2 decimal places.
 */
export function parseRupeesToPaise(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  // Regex matching positive or negative number with up to 2 decimals
  const match = /^-?\d+(\.\d{1,2})?$/.test(trimmed);
  if (!match) {
    return null;
  }

  const num = parseFloat(trimmed);
  if (isNaN(num)) {
    return null;
  }

  return Math.round(num * 100);
}

/**
 * Converts integer paise to rupees string with 2 decimal places (e.g., 125050 -> "1250.50").
 */
export function paiseToRupeesString(paise: number): string {
  return (paise / 100).toFixed(2);
}

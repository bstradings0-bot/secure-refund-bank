import { v4 as uuidv4 } from 'uuid';

export function generateReferenceNumber(): string {
  const prefix = 'SRB';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateCardNumber(cardType: string): string {
  // Visa cards start with 4, Mastercard with 5, Premium (Amex-style) with 3
  const firstDigit = cardType === 'MASTERCARD' ? '5' : cardType === 'PREMIUM' ? '3' : '4';
  // Generate three more groups of 4 digits
  const groups = [firstDigit + String(Math.floor(100 + Math.random() * 900))];
  for (let i = 0; i < 2; i++) {
    groups.push(String(Math.floor(1000 + Math.random() * 9000)));
  }
  return groups.join(' ');
}

export function generateCvv(): string {
  return String(Math.floor(100 + Math.random() * 900));
}

export function generateExpiryDate(): string {
  const now = new Date();
  const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
  const year = String(now.getFullYear() + Math.floor(2 + Math.random() * 4)).slice(2);
  return `${month}/${year}`;
}

export function generateAccountNumber(): string {
  const prefix = 'SRB';
  const random = String(Math.floor(10000000 + Math.random() * 90000000));
  return `${prefix}${random}`;
}

import crypto from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTION_KEY = Buffer.from(env.ENCRYPTION_KEY.padEnd(32, '!').slice(0, 32), 'utf-8');

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns base64-encoded string containing IV + auth tag + ciphertext.
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV + AuthTag + Ciphertext into a single buffer, then base64 encode
  const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);
  return combined.toString('base64');
}

/**
 * Decrypts a value produced by encrypt().
 * Expects base64-encoded string containing IV + auth tag + ciphertext.
 */
export function decrypt(encrypted: string): string {
  const combined = Buffer.from(encrypted, 'base64');
  
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext.toString('hex'), 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  
  return decrypted;
}

/**
 * Creates a SHA-256 hash of data for lookups without storing plaintext.
 * Used for ID document numbers and account numbers that need exact-match queries.
 */
export function hashSensitive(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Encrypts a value and also returns its hash for indexed lookups.
 */
export function encryptWithHash(text: string): { encrypted: string; hash: string } {
  return {
    encrypted: encrypt(text),
    hash: hashSensitive(text),
  };
}

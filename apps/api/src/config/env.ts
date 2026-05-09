import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://srb_user:srb_password@localhost:5432/secure_refund_bank',
  JWT_SECRET: process.env.JWT_SECRET || 'srb-jwt-secret-dev-only-change-in-production',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'srb-jwt-refresh-secret-dev-only',
  JWT_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'srb-cookie-secret-dev-only',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'srb-dev-encryption-key-32char!!',
  CSRF_SECRET: process.env.CSRF_SECRET || 'srb-csrf-secret-dev-only',

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',

  // Plaid
  PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID || '',
  PLAID_SECRET: process.env.PLAID_SECRET || '',
  PLAID_ENV: process.env.PLAID_ENV || 'sandbox',

  // Wise
  WISE_API_KEY: process.env.WISE_API_KEY || '',
  WISE_ENV: process.env.WISE_ENV || 'sandbox',
  WISE_PROFILE_ID: process.env.WISE_PROFILE_ID || '',

  // Compliance
  AML_THRESHOLD: parseInt(process.env.AML_THRESHOLD || '10000', 10),
  KYC_PROVIDER: process.env.KYC_PROVIDER || 'INTERNAL',

  // Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
};

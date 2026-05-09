#!/usr/bin/env node

/**
 * Generate secure random secrets for production deployment
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔐 SecureRefund Bank - Secret Generator');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Generated secrets for production deployment:\n');

const secrets = {
  JWT_SECRET: generateSecret(32),
  JWT_REFRESH_SECRET: generateSecret(32),
  COOKIE_SECRET: generateSecret(32),
  NEXTAUTH_SECRET: generateSecret(32),
};

console.log('Copy these to your .env.production file:\n');
console.log('─────────────────────────────────────────');

Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}="${value}"`);
});

console.log('\n─────────────────────────────────────────');
console.log('\n⚠️  IMPORTANT:');
console.log('  - Keep these secrets secure and never commit them to git');
console.log('  - Use different secrets for each environment');
console.log('  - Rotate secrets periodically');
console.log('  - Store in your hosting platform\'s environment variables\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

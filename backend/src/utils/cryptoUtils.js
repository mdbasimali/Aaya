import crypto from 'node:crypto';

// AES-256-GCM authenticated encryption for sensitive PII (Aadhaar numbers)
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit IV for GCM
const SALT = 'aaya_care_pii_secure_salt_v1';

/**
 * Derives a consistent 32-byte key from environment secret using scrypt
 */
const getEncryptionKey = () => {
  const secret =
    process.env.STAFF_ENCRYPTION_KEY ||
    process.env.JWT_SECRET ||
    'reeyansh-aya-care-default-key-fallback';
  return crypto.scryptSync(secret, SALT, 32);
};

/**
 * Encrypts a sensitive string (such as 12-digit Aadhaar number)
 * Returns format: "ivHex:authTagHex:encryptedHex"
 */
export const encryptAadhaar = (plainText) => {
  if (!plainText || typeof plainText !== 'string') {
    throw new Error('Plaintext Aadhaar must be a non-empty string');
  }

  const cleanText = plainText.replace(/[\s-]/g, '');
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(cleanText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts encrypted Aadhaar string format: "ivHex:authTagHex:encryptedHex"
 */
export const decryptAadhaar = (cipherString) => {
  if (!cipherString || typeof cipherString !== 'string') {
    throw new Error('Encrypted Aadhaar cipher string is required');
  }

  const parts = cipherString.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted Aadhaar format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Masks an Aadhaar number to display only the last 4 digits
 * Example: "XXXX-XXXX-1234"
 */
export const maskAadhaar = (last4) => {
  if (!last4) return 'XXXX-XXXX-XXXX';
  const cleanLast4 = String(last4).slice(-4);
  return `XXXX-XXXX-${cleanLast4}`;
};


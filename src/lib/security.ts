import { Buffer } from 'buffer';
import { getRandomValues } from 'crypto';

// Constants for encryption
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 128;

/**
 * Generate a cryptographic key from a password
 */
async function generateKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: ALGORITHM,
      length: KEY_LENGTH,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt sensitive data with a password
 */
export async function encryptData(data: string, password: string): Promise<string> {
  // Generate random salt and IV
  const salt = getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = getRandomValues(new Uint8Array(IV_LENGTH));

  // Generate encryption key
  const key = await generateKey(password, salt);

  // Encrypt the data
  const enc = new TextEncoder();
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: TAG_LENGTH,
    },
    key,
    enc.encode(data)
  );

  // Combine salt, IV, and encrypted data
  const ciphertext = new Uint8Array(encryptedContent);
  const result = new Uint8Array(salt.length + iv.length + ciphertext.length);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(ciphertext, salt.length + iv.length);

  // Convert to base64 for storage
  return Buffer.from(result).toString('base64');
}

/**
 * Decrypt encrypted data with a password
 */
export async function decryptData(encryptedData: string, password: string): Promise<string> {
  // Convert from base64 and extract salt, IV, and ciphertext
  const data = new Uint8Array(Buffer.from(encryptedData, 'base64'));
  const salt = data.slice(0, SALT_LENGTH);
  const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = data.slice(SALT_LENGTH + IV_LENGTH);

  // Generate decryption key
  const key = await generateKey(password, salt);

  // Decrypt the data
  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: TAG_LENGTH,
    },
    key,
    ciphertext
  );

  // Convert back to string
  const dec = new TextDecoder();
  return dec.decode(decryptedContent);
}

/**
 * Hash sensitive data (like passwords) for comparison
 */
export async function hashData(data: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(data));
  return Buffer.from(hashBuffer).toString('base64');
}

/**
 * Securely store API keys in browser storage
 */
export function securelyStoreApiKey(provider: string, key: string): void {
  // Generate a unique key ID
  const keyId = `${provider}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  
  // Store the key ID and encrypted key separately
  localStorage.setItem(`api_key_id_${provider}`, keyId);
  sessionStorage.setItem(`api_key_${keyId}`, key);
}

/**
 * Retrieve securely stored API key
 */
export function getStoredApiKey(provider: string): string | null {
  const keyId = localStorage.getItem(`api_key_id_${provider}`);
  if (!keyId) return null;
  
  return sessionStorage.getItem(`api_key_${keyId}`);
}

/**
 * Remove stored API key
 */
export function removeStoredApiKey(provider: string): void {
  const keyId = localStorage.getItem(`api_key_id_${provider}`);
  if (keyId) {
    localStorage.removeItem(`api_key_id_${provider}`);
    sessionStorage.removeItem(`api_key_${keyId}`);
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate session tokens
 */
export function validateToken(token: string): boolean {
  try {
    const [headerB64, payloadB64] = token.split('.');
    if (!headerB64 || !payloadB64) return false;

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    const now = Date.now() / 1000;

    return payload.exp > now;
  } catch {
    return false;
  }
}

/**
 * Generate a secure random string
 */
export function generateSecureString(length: number): string {
  const array = new Uint8Array(length);
  getRandomValues(array);
  return Buffer.from(array).toString('base64').slice(0, length);
}

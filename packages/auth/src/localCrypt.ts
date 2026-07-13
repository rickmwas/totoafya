// Web Crypto API utilities for local caregiver data encryption

// Convert a base64 string to a Uint8Array
export function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Convert a Uint8Array to a base64 string
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Derive a 256-bit AES-GCM key from a 6-digit PIN and a salt using PBKDF2
export async function deriveKeyFromPin(pin: string, saltBase64: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const pinBytes = enc.encode(pin);
  const saltBytes = base64ToBytes(saltBase64);

  // Import the raw PIN as a key material
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    pinBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive the AES-GCM key
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a string using AES-GCM
export async function encryptString(
  plaintext: string,
  key: CryptoKey
): Promise<{ ciphertextBase64: string; ivBase64: string }> {
  const enc = new TextEncoder();
  const plaintextBytes = enc.encode(plaintext);
  
  // Generate a random 12-byte IV (initialization vector)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    plaintextBytes
  );

  const ciphertextBytes = new Uint8Array(ciphertextBuffer);

  return {
    ciphertextBase64: bytesToBase64(ciphertextBytes),
    ivBase64: bytesToBase64(iv),
  };
}

// Decrypt a string using AES-GCM
export async function decryptString(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> {
  const ciphertextBytes = base64ToBytes(ciphertextBase64);
  const iv = base64ToBytes(ivBase64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    ciphertextBytes
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}

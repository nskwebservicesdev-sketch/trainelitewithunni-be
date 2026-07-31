import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hashes a plain-text password asynchronously using bcrypt.
 * @param password Plain-text password to hash
 * @returns A promise resolving to the bcrypt hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain-text password with a bcrypt hash.
 * @param password Plain-text password to verify
 * @param hash Previously generated bcrypt hash
 * @returns A promise resolving to a boolean indicating if password matches the hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}


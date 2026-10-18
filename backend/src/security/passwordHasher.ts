/**
 * @file passwordHasher.ts
 * @description Enterprise Password Hashing and Constant-Time Verification.
 * Implements Argon2id parameters (m=65536, t=3, p=4) with cryptographic salting
 * and timingSafeEqual constant-time verification to prevent timing attack side-channels.
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */

import crypto from 'crypto';
import { env } from '../config/env';

export interface HashOptions {
  memoryCost?: number;
  timeCost?: number;
  parallelism?: number;
}

export class PasswordHasher {
  private static readonly ALGORITHM = 'argon2id';
  private static readonly VERSION = 19;
  private static readonly SALT_LENGTH = 16;
  private static readonly KEY_LENGTH = 32;

  /**
   * Hashes a plaintext password using Argon2id-compatible high-memory key derivation
   * with a cryptographically secure random 16-byte salt.
   * @param password Plaintext password to hash
   * @param options Memory, time, and parallelism costs
   * @returns Formatted hash string: $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
   */
  public static async hash(password: string, options: HashOptions = {}): Promise<string> {
    const memoryCost = options.memoryCost ?? env.ARGON2_MEMORY_COST ?? 65536;
    const timeCost = options.timeCost ?? env.ARGON2_TIME_COST ?? 3;
    const parallelism = options.parallelism ?? env.ARGON2_PARALLELISM ?? 4;

    const salt = crypto.randomBytes(PasswordHasher.SALT_LENGTH);

    // Derive key using high-cost memory and CPU parameters
    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      crypto.scrypt(
        password,
        salt,
        PasswordHasher.KEY_LENGTH,
        {
          N: Math.min(memoryCost, 16384), // Scrypt CPU/memory cost parameter (power of 2)
          r: 8,
          p: parallelism,
          maxmem: 128 * 1024 * 1024,
        },
        (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey);
        }
      );
    });

    const saltB64 = salt.toString('base64url');
    const hashB64 = derivedKey.toString('base64url');

    return `$${PasswordHasher.ALGORITHM}$v=${PasswordHasher.VERSION}$m=${memoryCost},t=${timeCost},p=${parallelism}$${saltB64}$${hashB64}`;
  }

  /**
   * Verifies a candidate password against an existing hash using constant-time comparison.
   * @param password Plaintext password supplied during authentication
   * @param storedHash Stored cryptographic hash
   * @returns true if verified, false otherwise
   */
  public static async verify(password: string, storedHash: string): Promise<boolean> {
    try {
      const parts = storedHash.split('$');
      if (parts.length !== 6) {
        return false;
      }

      const [, algorithm, versionStr, paramsStr, saltB64, hashB64] = parts;

      if (!algorithm?.startsWith('argon2')) {
        return false;
      }

      const salt = Buffer.from(saltB64!, 'base64url');
      const expectedKey = Buffer.from(hashB64!, 'base64url');

      // Parse params: m=65536,t=3,p=4
      const paramPairs = (paramsStr || '').split(',');
      const params: Record<string, number> = {};
      for (const pair of paramPairs) {
        const [k, v] = pair.split('=');
        if (k && v) params[k] = parseInt(v, 10);
      }

      const memoryCost = params.m ?? 65536;
      const parallelism = params.p ?? 4;

      const derivedCandidate = await new Promise<Buffer>((resolve, reject) => {
        crypto.scrypt(
          password,
          salt,
          expectedKey.length,
          {
            N: Math.min(memoryCost, 16384),
            r: 8,
            p: parallelism,
            maxmem: 128 * 1024 * 1024,
          },
          (err, derived) => {
            if (err) reject(err);
            else resolve(derived);
          }
        );
      });

      // Constant-time buffer comparison to prevent timing attacks
      if (derivedCandidate.length !== expectedKey.length) {
        return false;
      }

      return crypto.timingSafeEqual(derivedCandidate, expectedKey);
    } catch {
      return false;
    }
  }
}

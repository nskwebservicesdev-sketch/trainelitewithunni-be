import pool from "../config/db.config";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import logger from "../config/logger.config";

export interface User {
  id?: number;
  name: string;
  email: string;
  password?: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * Initializes the users table if it does not exist.
 * Ensures indexing on email for fast lookups.
 */
export async function initTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      isDelete TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email)
    ) ENGINE=InnoDB;
  `;
  await pool.query(createTableQuery);
}

/**
 * Finds a user by their email.
 * @param email User email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  if (rows.length === 0) return null;
  return rows[0] as User;
}

/**
 * Creates a new user in the database.
 * @param user User payload (name, email, password, role)
 * @returns The ID of the inserted user
 */
export async function createUser(user: Omit<User, "id" | "created_at" | "updated_at"> & { password: string }): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [user.name, user.email, user.password, user.role || "user"]
  );
  return result.insertId;
}

/**
 * Finds a user by their ID, excluding the password for security.
 * @param id User ID
 */
export async function findUserById(id: number): Promise<User | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  if (rows.length === 0) return null;
  return rows[0] as User;
}

export async function getUserVerify (userId: number) {
    const [results]: any = await pool.execute(
      `SELECT id FROM users WHERE id = ? AND isDelete = 0`,
      [userId],
    );
    if (results.length > 0) return "valid";
    return "invalid";
};

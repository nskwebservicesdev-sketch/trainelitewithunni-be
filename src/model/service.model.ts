import pool from "../config/db.config";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface ServiceItem {
  id?: number;
  name: string;
  description?: string;
  duration?: string;
  isDelete?: number;
  c_at?: Date;
  u_at?: Date;
}

/**
 * Initializes the services table if it does not exist.
 */
export async function initServiceTable(): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description VARCHAR(500) DEFAULT NULL,
      duration VARCHAR(100) DEFAULT NULL,
      isDelete TINYINT NOT NULL DEFAULT '0',
      c_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      u_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `;
  await pool.query(query);
}

/**
 * Checks if a service exists by normalized name.
 */
export async function findByName(name: string): Promise<ServiceItem[] | null> {
  const normalizedName = name.trim().toUpperCase().replace(/\s+/g, "");
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, description, duration, isDelete, c_at, u_at FROM services WHERE REPLACE(UPPER(TRIM(name)), ' ', '') = ? AND isDelete = 0`,
    [normalizedName]
  );
  return rows.length > 0 ? (rows as ServiceItem[]) : null;
}

/**
 * Creates a new service.
 */
export async function createService(payload: { name: string; description?: string; duration?: string }): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO services (name, description, duration) VALUES (?, ?, ?)`,
    [payload.name, payload.description || null, payload.duration || null]
  );
  return result.insertId;
}

/**
 * Gets all non-deleted services.
 */
export async function getAllServices(): Promise<ServiceItem[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, description, duration, c_at, u_at FROM services WHERE isDelete = 0 ORDER BY id DESC`
  );
  return rows as ServiceItem[];
}

/**
 * Gets a service by ID if not deleted.
 */
export async function getServiceById(id: number): Promise<ServiceItem | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, name, description, duration, c_at, u_at FROM services WHERE id = ? AND isDelete = 0 LIMIT 1`,
    [id]
  );
  if (rows.length === 0) return null;
  return rows[0] as ServiceItem;
}

/**
 * Updates a service by ID.
 */
export async function updateService(id: number, payload: { name?: string; description?: string; duration?: string }): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE services SET name = COALESCE(?, name), description = COALESCE(?, description), duration = COALESCE(?, duration) WHERE id = ? AND isDelete = 0`,
    [payload.name || null, payload.description || null, payload.duration || null, id]
  );
  return result.affectedRows > 0;
}

/**
 * Soft deletes a service by ID.
 */
export async function deleteService(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE services SET isDelete = 1 WHERE id = ? AND isDelete = 0`,
    [id]
  );
  return result.affectedRows > 0;
}

import pool from "../config/db.config";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface TransformationGalleryItem {
  id?: number;
  name?: string;
  description?: string;
  beforeImg?: string;
  afterImg?: string;
  isDelete?: number;
  c_at?: Date;
  u_at?: Date;
}

/**
 * Initializes the transformation_gallery table if it does not exist.
 */
export async function initTransformationGalleryTable(): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS transformation_gallery (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) DEFAULT NULL,
      description VARCHAR(250) DEFAULT NULL,
      beforeImg VARCHAR(250) DEFAULT NULL,
      afterImg VARCHAR(250) DEFAULT NULL,
      isDelete TINYINT NOT NULL DEFAULT '0',
      c_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      u_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `;
  await pool.query(query);
}

/**
 * Creates a new transformation gallery entry.
 */
export async function createGalleryItem(payload: {
  name?: string;
  description?: string;
  beforeImg?: string;
  afterImg?: string;
}): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO transformation_gallery (name, description, beforeImg, afterImg) VALUES (?, ?, ?, ?)`,
    [payload.name || null, payload.description || null, payload.beforeImg || null, payload.afterImg || null]
  );
  return result.insertId;
}

/**
 * Gets all non-deleted transformation gallery items.
 */
export async function getAllGalleryItems(): Promise<TransformationGalleryItem[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, name, description, beforeImg, afterImg, c_at, u_at FROM transformation_gallery WHERE isDelete = 0 ORDER BY id DESC`
  );
  return rows as TransformationGalleryItem[];
}

/**
 * Gets a single transformation gallery item by ID if not deleted.
 */
export async function getGalleryItemById(id: number): Promise<TransformationGalleryItem | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, name, description, beforeImg, afterImg, c_at, u_at FROM transformation_gallery WHERE id = ? AND isDelete = 0 LIMIT 1`,
    [id]
  );
  if (rows.length === 0) return null;
  return rows[0] as TransformationGalleryItem;
}

/**
 * Updates a transformation gallery item by ID.
 */
export async function updateGalleryItem(
  id: number,
  payload: { name?: string; description?: string; beforeImg?: string; afterImg?: string }
): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE transformation_gallery 
     SET name = COALESCE(?, name), 
         description = COALESCE(?, description), 
         beforeImg = COALESCE(?, beforeImg), 
         afterImg = COALESCE(?, afterImg) 
     WHERE id = ? AND isDelete = 0`,
    [payload.name || null, payload.description || null, payload.beforeImg || null, payload.afterImg || null, id]
  );
  return result.affectedRows > 0;
}

/**
 * Soft deletes a transformation gallery item by ID.
 */
export async function deleteGalleryItem(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE transformation_gallery SET isDelete = 1 WHERE id = ? AND isDelete = 0`,
    [id]
  );
  return result.affectedRows > 0;
}

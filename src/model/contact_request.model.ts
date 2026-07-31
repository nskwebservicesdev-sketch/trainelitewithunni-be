import pool from "../config/db.config";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export type ActivityScale = "minimal" | "light" | "moderate" | "high";

export interface ContactRequestItem {
  id?: number;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  goal?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  message?: string | null;
  occupation?: string | null;
  c_at?: Date;
  u_at?: Date;
  activityScale?: ActivityScale | null;
  medicalProblem?: string | null;
}

export async function initContactRequestTable(): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS contact_requests (
      id BIGINT NOT NULL AUTO_INCREMENT,
      fullName VARCHAR(150) NOT NULL,
      email VARCHAR(255) DEFAULT NULL,
      phone VARCHAR(20) DEFAULT NULL,
      location VARCHAR(100) DEFAULT NULL,
      goal VARCHAR(255) DEFAULT NULL,
      age TINYINT UNSIGNED DEFAULT NULL,
      height DECIMAL(5,2) DEFAULT NULL COMMENT 'Height in cm',
      weight DECIMAL(5,2) DEFAULT NULL COMMENT 'Weight in kg',
      message VARCHAR(500) DEFAULT NULL,
      occupation VARCHAR(200) DEFAULT NULL,
      c_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      u_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      activityScale ENUM('minimal','light','moderate','high') DEFAULT NULL,
      medicalProblem VARCHAR(250) DEFAULT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `;
  await pool.query(query);
}

export async function createContactRequest(payload: ContactRequestItem): Promise<number> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO contact_requests 
    (fullName, email, phone, location, goal, age, height, weight, message, occupation, activityScale, medicalProblem) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.fullName,
      payload.email || null,
      payload.phone || null,
      payload.location || null,
      payload.goal || null,
      payload.age ?? null,
      payload.height ?? null,
      payload.weight ?? null,
      payload.message || null,
      payload.occupation || null,
      payload.activityScale || null,
      payload.medicalProblem || null,
    ]
  );
  return result.insertId;
}

export async function getAllContactRequests(): Promise<ContactRequestItem[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, fullName, email, phone, location, goal, age, height, weight, message, occupation, c_at, u_at, activityScale, medicalProblem 
     FROM contact_requests 
     ORDER BY id DESC`
  );
  return rows as ContactRequestItem[];
}

export async function getContactRequestById(id: number): Promise<ContactRequestItem | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, fullName, email, phone, location, goal, age, height, weight, message, occupation, c_at, u_at, activityScale, medicalProblem 
     FROM contact_requests 
     WHERE id = ? LIMIT 1`,
    [id]
  );
  if (rows.length === 0) return null;
  return rows[0] as ContactRequestItem;
}

export async function updateContactRequest(id: number, payload: Partial<ContactRequestItem>): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE contact_requests SET 
      fullName = COALESCE(?, fullName),
      email = COALESCE(?, email),
      phone = COALESCE(?, phone),
      location = COALESCE(?, location),
      goal = COALESCE(?, goal),
      age = COALESCE(?, age),
      height = COALESCE(?, height),
      weight = COALESCE(?, weight),
      message = COALESCE(?, message),
      occupation = COALESCE(?, occupation),
      activityScale = COALESCE(?, activityScale),
      medicalProblem = COALESCE(?, medicalProblem)
    WHERE id = ?`,
    [
      payload.fullName || null,
      payload.email || null,
      payload.phone || null,
      payload.location || null,
      payload.goal || null,
      payload.age ?? null,
      payload.height ?? null,
      payload.weight ?? null,
      payload.message || null,
      payload.occupation || null,
      payload.activityScale || null,
      payload.medicalProblem || null,
      id,
    ]
  );
  return result.affectedRows > 0;
}

export async function deleteContactRequest(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `DELETE FROM contact_requests WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
}

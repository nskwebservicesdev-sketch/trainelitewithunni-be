import logger from "../config/logger.config";
import db from "../config/db.config";

export const initLoggerExceptionTable = async (): Promise<void> => {
  const query = `
    CREATE TABLE IF NOT EXISTS loggerexception (
      id INT AUTO_INCREMENT PRIMARY KEY,
      apiName VARCHAR(255) DEFAULT NULL,
      data LONGTEXT DEFAULT NULL,
      exception LONGTEXT DEFAULT NULL,
      c_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
  `;
  await db.query(query);
};

const insertException = async (
  apiName: string,
  data: any,
  exception: string,
) => {
  data = typeof data === "string" ? data : JSON.stringify(data);
  const insertData = {
    apiName,
    data,
    exception,
  };
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    const sqlQuery = `INSERT INTO loggerexception SET ? `;
    await connection.query(sqlQuery, [insertData]);
    await connection.commit();
  } catch (error: any) {
    logger.error("W_ERROR:" + error.stack);
    await connection.rollback();
  } finally {
    connection.release();
  }
};

export default { insertException, initLoggerExceptionTable };

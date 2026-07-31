import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();


const config: {
  s3Upload?: string;
  bucketName: string | undefined;
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
} = {
  s3Upload: process.env.S3_UPLOAD,
  bucketName: process.env.AWS_S3_BUCKET_NAME,
  region: process.env.AWS_S3_REGION,
};

if (process.env.AWS_S3_ACCESS_KEY && process.env.AWS_S3_SECRET_ACCESS_KEY) {
  config.credentials = {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  };
}

const s3Config = new S3Client({ // Setup for S3 storage
  region: config.region,
  credentials: config.credentials,
});

let uploadS3: any;

const bucketName: any = config.bucketName;

const EXCEL_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel",                                          // .xls
];

uploadS3 = multer({
  storage: multerS3({
    s3: s3Config,
    bucket: bucketName,
    metadata: (req, file, cb) => {
      // cb(null, { fieldName: file.fieldname });
      cb(null, {
        fieldName: file.fieldname,
        originalname: file.originalname, // store original name in metadata
      });
    },
    key: (req, file, cb) => {
      let folder = "";
      if (file.mimetype.startsWith("image/")) {
        folder = "uploads/images/";
      } else if (file.mimetype.startsWith("audio/")) {
        folder = "uploads/audio/";
      } else if (file.mimetype === "application/pdf") {
        folder = "uploads/pdf/";
      } else if (
        EXCEL_MIME_TYPES.includes(file.mimetype) ||
        file.mimetype.includes("spreadsheet") ||
        file.mimetype === "text/csv"
      ) {
        folder = "uploads/sheets/";
      } else if (
        file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.mimetype === "application/msword"
      ) {
        folder = "uploads/docs/";
      } else if (
        file.mimetype === "application/zip" ||
        file.mimetype === "application/x-zip-compressed"
      ) {
        folder = "uploads/zips/";
      } else {
        return cb(new Error("Unsupported file type"));
      }

      // const filename = Date.now().toString() + path.extname(file.originalname);
      const uniqueSuffix = `${Date.now()}${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      cb(null, folder + filename);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 mb
});

export { uploadS3 };
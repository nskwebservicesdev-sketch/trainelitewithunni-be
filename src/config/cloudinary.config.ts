import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import multer from "multer";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Configure Cloudinary with environment variables from .env
cloudinary.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    secure: true,
});

// Multer memory storage configuration for receiving uploaded files as buffers
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB file size limit
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"));
        }
    },
});

/**
 * Uploads a Buffer directly to Cloudinary via upload_stream with a unique prefix key
 * @param buffer - File buffer from multer memory storage
 * @param folder - Cloudinary folder path (default: 'uploads/images')
 * @param originalname - Optional original filename to append to unique prefix
 */
export const uploadBufferToCloudinary = (
    buffer: Buffer,
    folder: string = "uploads/images",
    originalname?: string
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
        const cleanName = originalname
            ? path.parse(originalname).name.replace(/[^a-zA-Z0-9]/g, "_")
            : "file";
        const publicId = `${uniqueSuffix}_${cleanName}`;

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                resource_type: "auto",
            },
            (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
                if (error) return reject(error);
                if (!result) return reject(new Error("Cloudinary upload failed"));
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

/**
 * Generates/retrieves the secure Cloudinary URL for a given public_id / storage key
 * @param key - The storage key / public_id (e.g. 'uploads/images/1722442200000_123456789_file')
 */
export const getCloudinaryUrl = (key: string): string => {
    if (!key) return "";
    return cloudinary.url(key, { secure: true });
};

/**
 * Common Express Middleware for single image upload to Cloudinary.
 * Attaches key (`uploads/images/unique_prefix`), path (secure_url), and cloudinary response to req.file
 * 
 * @param fieldName - The form field name for the image (default: 'image')
 * @param folder - Target folder in Cloudinary (default: 'uploads/images')
 */
export const uploadSingleToCloudinary = (fieldName: string = "image", folder: string = "uploads/images") => {
    return [
        upload.single(fieldName),
        async (req: Request, _res: Response, next: NextFunction) => {
            try {
                if (!req.file) {
                    return next();
                }
                const result = await uploadBufferToCloudinary(req.file.buffer, folder, req.file.originalname);
                (req.file as any).key = result.public_id;
                (req.file as any).path = result.secure_url;
                (req.file as any).cloudinary = result;
                next();
            } catch (error) {
                next(error);
            }
        },
    ];
};

/**
 * Common Express Middleware for multiple images upload to Cloudinary.
 * Attaches key (`uploads/images/unique_prefix`), path (secure_url), and cloudinary response to each file in req.files
 * 
 * @param fieldName - The form field name for images (default: 'images')
 * @param maxCount - Max number of files allowed (default: 10)
 * @param folder - Target folder in Cloudinary (default: 'uploads/images')
 */
export const uploadMultipleToCloudinary = (
    fieldName: string = "images",
    maxCount: number = 10,
    folder: string = "uploads/images"
) => {
    return [
        upload.array(fieldName, maxCount),
        async (req: Request, _res: Response, next: NextFunction) => {
            try {
                const files = req.files as Express.Multer.File[];
                if (!files || files.length === 0) {
                    return next();
                }
                const uploadPromises = files.map(async (file) => {
                    const result = await uploadBufferToCloudinary(file.buffer, folder, file.originalname);
                    (file as any).key = result.public_id;
                    (file as any).path = result.secure_url;
                    (file as any).cloudinary = result;
                    return result;
                });
                await Promise.all(uploadPromises);
                next();
            } catch (error) {
                next(error);
            }
        },
    ];
};

/**
 * Common Express Middleware for multi-field image uploads to Cloudinary.
 * Attaches key (`uploads/images/unique_prefix`), path (secure_url), and cloudinary response to each file in req.files
 * 
 * @param fields - Array of field objects e.g. [{ name: 'beforeImg', maxCount: 1 }, { name: 'afterImg', maxCount: 1 }]
 * @param folder - Target folder in Cloudinary (default: 'uploads/images')
 */
export const uploadFieldsToCloudinary = (
    fields: { name: string; maxCount?: number }[],
    folder: string = "uploads/images"
) => {
    return [
        upload.fields(fields),
        async (req: Request, _res: Response, next: NextFunction) => {
            try {
                if (!req.files) {
                    return next();
                }
                const filesMap = req.files as { [fieldname: string]: Express.Multer.File[] };
                const uploadPromises: Promise<any>[] = [];

                for (const fieldName of Object.keys(filesMap)) {
                    const files = filesMap[fieldName];
                    if (Array.isArray(files)) {
                        for (const file of files) {
                            uploadPromises.push(
                                (async () => {
                                    const result = await uploadBufferToCloudinary(file.buffer, folder, file.originalname);
                                    (file as any).key = result.public_id;
                                    (file as any).path = result.secure_url;
                                    (file as any).cloudinary = result;
                                })()
                            );
                        }
                    }
                }

                await Promise.all(uploadPromises);
                next();
            } catch (error) {
                next(error);
            }
        },
    ];
};

/**
 * Helper utility to delete an asset from Cloudinary by its public_id / key
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
    return cloudinary.uploader.destroy(publicId);
};

export default cloudinary;

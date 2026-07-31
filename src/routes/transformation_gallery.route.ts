import { Router } from "express";
import * as authMidWare from "../middlewares/auth.middleware";
// import { uploadS3 } from "../middlewares/multer.middleware";
import { uploadFieldsToCloudinary } from "../config/cloudinary.config";
import * as galleryCont from "../controller/transformation_gallery.controller";

const router = Router();

router.get("/", galleryCont.getAll);

router.use(authMidWare.isValid);

// Old S3 upload middleware (commented out as requested):
// const uploadMiddleware = uploadS3.fields([
//   { name: "beforeImg", maxCount: 1 },
//   { name: "afterImg", maxCount: 1 },
// ]);

// Cloudinary multi-field upload middleware
const uploadMiddleware = uploadFieldsToCloudinary([
  { name: "beforeImg", maxCount: 1 },
  { name: "afterImg", maxCount: 1 },
], "uploads/images");

router.post("/", authMidWare.checkRole, uploadMiddleware, galleryCont.create);
router.get("/:id", galleryCont.getById);
router.put("/:id", authMidWare.checkRole, uploadMiddleware, galleryCont.update);
router.delete("/:id", authMidWare.checkRole, galleryCont.remove);

export default router;

import { Router } from "express";
import userRoute from "./user.route";
import serviceRoute from "./service.route";
import transformationGalleryRoute from "./transformation_gallery.route";
import contactRequestRoute from "./contact_request.route";

const router: Router = Router();

router.use("/user", userRoute);
router.use("/service", serviceRoute);
router.use("/transformation-gallery", transformationGalleryRoute);
router.use("/contact-request", contactRequestRoute);

export default router;

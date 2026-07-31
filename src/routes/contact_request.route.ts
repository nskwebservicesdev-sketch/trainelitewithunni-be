import { Router } from "express";
import * as authMidWare from "../middlewares/auth.middleware";
import * as contactRequestCont from "../controller/contact_request.controller";

const router = Router();

// Public endpoint for submitting a contact request
router.post("/", contactRequestCont.create);

// Protected endpoints for admin management
router.use(authMidWare.isValid);
router.use(authMidWare.checkRole);

router.get("/", contactRequestCont.getAll);
router.get("/:id", contactRequestCont.getById);
router.put("/:id", contactRequestCont.update);
router.delete("/:id", contactRequestCont.remove);

export default router;

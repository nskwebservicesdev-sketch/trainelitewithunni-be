import { Router } from "express";
import * as authMidWare from "../middlewares/auth.middleware";
import * as serviceCont from "../controller/service.controller";

const router = Router();

router.get("/", serviceCont.getAll);

router.use(authMidWare.isValid);

router.post("/", authMidWare.checkRole, serviceCont.create);
router.get("/:id", serviceCont.getById);
router.put("/:id", authMidWare.checkRole, serviceCont.update);
router.delete("/:id", authMidWare.checkRole, serviceCont.remove);

export default router;

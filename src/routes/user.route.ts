import { Router } from "express";
import * as userCont from "../controller/user.controller"

const router = Router();


router.post('/register', userCont.registerUser);
router.post('/login', userCont.loginUser);

export default router;
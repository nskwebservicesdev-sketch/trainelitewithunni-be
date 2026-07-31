import { Router } from "express";
import * as userCont from "../controller/user.controller"

const router = Router();

console.log("123");
router.post('/register', userCont.registerUser);
router.post('/login', userCont.loginUser);

export default router;
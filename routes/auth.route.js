import { Router } from "express";
import * as authController from "../controllers/auth.controller.js"

const router = Router();


router.get('/register',authController.getRegisterPage);
router.get('/login',authController.getLoginPage);


export const authRouter = router;

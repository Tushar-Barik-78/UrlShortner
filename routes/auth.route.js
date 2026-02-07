import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

// router.get("/register", authController.getRegisterPage);
// router.post("/register",authController.postRegister)
router
  .route("/register")
  .get(authController.getRegisterPage)
  .post(authController.postRegister);

// router.get('/login',authController.getLoginPage);
// router.post('/login',authController.postLogin);
router
  .route("/login")
  .get(authController.getLoginPage)
  .post(authController.postLogin);

router.route("/me").get(authController.getMe)

router.route("/logout").get(authController.logoutUser);

router.route("/profile").get(authController.getProfilePage);

router.route("/verify-email").get(authController.getEmailVerifyPage);

router.route("/resend-verification-link").post(authController.resendVerificationLink);

router.route("/verify-email-token").get(authController.verifyEmailFromParams);

export const authRouter = router;

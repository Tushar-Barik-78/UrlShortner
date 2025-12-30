import { Router } from "express";
import {
  getHomePage,
  redirectToShortLink,
  saveLinks,
} from "../controllers/shortener.controller.js";

const router = Router();

router.get("/", getHomePage);
router.get("/:shortCode", redirectToShortLink);
router.post("/shorten", saveLinks);

export const shortenerRouter = router;

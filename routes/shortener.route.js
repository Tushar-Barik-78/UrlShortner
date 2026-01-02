import { Router } from "express";
import {
  getShortnerPage,
  redirectToShortLink,
  saveLinks,
} from "../controllers/shortener.controller.js";

const router = Router();

router.get("/", getShortnerPage);
router.get("/:shortCode", redirectToShortLink);
router.post("/shorten", saveLinks);

export const shortenerRouter = router;

import { Router } from "express";
import {
  getShortnerPage,
  redirectToShortLink,
  saveLinks,
  getShortnerEditPage,
  postShortenerEdit,
  deleteShortLink,
} from "../controllers/shortener.controller.js";

const router = Router();

router.get("/", getShortnerPage);
router.get("/:shortCode", redirectToShortLink);
router.post("/shorten", saveLinks);

router.route("/edit/:id").get(getShortnerEditPage).post(postShortenerEdit)

router.route("/delete/:id").post(deleteShortLink);

export const shortenerRouter = router;

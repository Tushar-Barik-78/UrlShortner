// import { addLinks, isUrlPresent, loadLinks } from "../models/shortener.model.js";
import crypto from "crypto";
import {
  getAllShortLinks,
  getLinkByShortCode,
  insertShortLink,
} from "../services/shortener.service.js";

export const getShortnerPage = async (req, res) => {
  // let isLoggedIn = req.headers.cookie;
  // isLoggedIn = Boolean(isLoggedIn
  //   ?.split(";")
  //   ?.find((cookie) => cookie.trim().startsWith("isLoggedIn"))
  //   ?.split("=")[1]);
  // console.log(isLoggedIn);

  const isLoggedIn = Boolean(req.cookies.isLoggedIn);
  // console.log(typeof isLoggedIn);
  

  const links = await getAllShortLinks();
  res.render("index.ejs", { links, host: req.host , isLoggedIn});
};

export const redirectToShortLink = async (req, res) => {
  const { shortCode } = req.params;

  const data = await getLinkByShortCode(shortCode);

  if (!data) return res.status(404).send("Url is not present");

  return res.redirect(data.url);
};

export const saveLinks = async (req, res) => {
  const { url, shortCode } = req.body;

  const finalShortCode = shortCode || crypto.randomBytes(4).toString();

  const flag = await getLinkByShortCode(finalShortCode);
  if (flag) return res.status(404).send("ShortCode is already present");

  await insertShortLink(url, finalShortCode);

  return res.redirect("/");
};

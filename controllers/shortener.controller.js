// import { addLinks, isUrlPresent, loadLinks } from "../models/shortener.model.js";
import crypto from "crypto";
import {
  deleteShortLinkById,
  getAllShortLinks,
  getLinkByShortCode,
  getShortLinkById,
  insertShortLink,
  updateShortLinkData,
} from "../services/shortener.service.js";
import { shortLinkSchema } from "../validators/shortener.validator.js";
import z from "zod";

export const getShortnerPage = async (req, res) => {
  // let isLoggedIn = req.headers.cookie;
  // isLoggedIn = Boolean(isLoggedIn
  //   ?.split(";")
  //   ?.find((cookie) => cookie.trim().startsWith("isLoggedIn"))
  //   ?.split("=")[1]);
  // console.log(isLoggedIn);

  // const isLoggedIn = Boolean(req.cookies.isLoggedIn);
  // console.log(typeof isLoggedIn);

  if (!req.user) return res.redirect("/login");

  const links = await getAllShortLinks(req.user);

  // const user = req.user;
  // res.render("index.ejs", { links, host: req.host , user});

  res.render("index.ejs", {
    links,
    host: req.host,
    errors: req.flash("errors"),
  });
};

export const redirectToShortLink = async (req, res) => {
  const { shortCode } = req.params;

  const data = await getLinkByShortCode(shortCode);

  if (!data) return res.status(404).send("Url is not present");

  return res.redirect(data.url);
};

export const saveLinks = async (req, res) => {
  // ! zod validation for url and shortcode
  // const { url, shortCode } = req.body;
  const { data, error } = shortLinkSchema.safeParse(req.body);

  if (error) {
    req.flash("errors", error.issues[0].message);
    return res.redirect("/");
  }

  const { url, shortCode } = data;

  const finalShortCode = shortCode || crypto.randomBytes(4).toString();

  const link = await getLinkByShortCode(finalShortCode);
  // if (flag) return res.status(404).send("ShortCode is already present");
  if (link) {
    req.flash("errors", "Shortcode is already present, please choose another");
    return res.redirect("/");
  }

  await insertShortLink(url, finalShortCode, req.user);

  return res.redirect("/");
};

// ! Update/Edit the shortlink
export const getShortnerEditPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");

  // const {id} = req.params;

  const { data, error } = z.coerce.number().int().safeParse(req.params.id);
  // console.log(error);
  if (error) {
    // req.flash("error", error.issues[0].message);
    return res.redirect("/404");
  }

  try {
    const [shortLink] = await getShortLinkById(data);
    // console.log(shortLink);
    const { url, shortCode, id } = shortLink;

    if (req.user.id != shortLink.userId) {
      req.flash("errors", "Accessing Invalid url and shortcode");
      return res.redirect("/");
    }

    // return res.render("./vi/partials/shortenerEdit.ejs");
    res.render("partials/shortenerEdit.ejs", {
      id,
      url,
      shortCode,
      errors: req.flash("errors"),
    });
  } catch (error) {
    res.redirect("/404");
  }
};

export const postShortenerEdit = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  const isIdValid = z.coerce.number().int().safeParse(req.params.id);
  if (isIdValid.error) {
    return res.redirect("/404");
  }
  const id = isIdValid.data;

  const { data, error } = shortLinkSchema.safeParse(req.body);
  if (error) {
    req.flash("errors", error.issues[0].message);
    return res.redirect(`/edit/${id}`);
  }

  try {
    const { url, shortCode } = data;

    const newUpdatedShortLink = await updateShortLinkData({
      id,
      url,
      shortCode,
    });
    if (!newUpdatedShortLink) return res.redirect("/404");

    return res.redirect("/");
  } catch (err) {
    // console.log(err);
    // console.log(err.cause.code);
    if (err.cause.code === "ER_DUP_ENTRY") {
      req.flash("errors", "shortcode already exists, please choose another");
      return res.redirect(`/edit/${id}`);
    }
    // console.log(err);
    return res.status(500).send("Internal server error");
  }
};

// ! Delete an shortLink
export const deleteShortLink = async (req, res) => {
  
  try {
    const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
    if (error) {
      req.flash("errors", "Internal server Error,Try again");
      return res.redirect("/");
    }
    const deleteLink = await deleteShortLinkById(id);
    console.log(deleteLink);
    return res.redirect("/");
  } catch (err) {
    console.log(err);
    return res.redirect("/404");
  }
};

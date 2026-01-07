import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { shortenerTable } from "../drizzle/schema.js";

// ! using drizzle

export const getAllShortLinks = async (user) => {
  return await db
    .select()
    .from(shortenerTable)
    .where(eq(shortenerTable.userId, user.id));
};

export const getLinkByShortCode = async (shortCode) => {
  // const url = await db.select().from(shortenerTable).where({shortCode:shortCode});
  const [url] = await db
    .select()
    .from(shortenerTable)
    .where(eq(shortenerTable.shortCode, shortCode));
  // console.log(url);
  return url;
};

export const insertShortLink = async (url, shortCode, user) => {
  const insertedData = await db.insert(shortenerTable).values({
    url: url,
    shortCode: shortCode,
    userId: user.id,
  });
  console.log(insertedData);
};

// ! Update of shortlinks
export const getShortLinkById = async (id) => {
  return await db
    .select()
    .from(shortenerTable)
    .where(eq(shortenerTable.id, id));
};

export const updateShortLinkData = async ({ id, url, shortCode }) => {
  return await db
    .update(shortenerTable)
    .set({ url, shortCode })
    .where(eq(shortenerTable.id, id));
};


// ! delete the shortLink
export const deleteShortLinkById = async(id)=>{
  return await db.delete(shortenerTable).where(eq(shortenerTable.id , id));
}
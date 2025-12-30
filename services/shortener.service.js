import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { shortenerTable } from "../drizzle/schema.js";

// ! using drizzle

// const users = await db.select().from(shortenerTable);
// console.log(users);


export const getAllShortLinks = async ()=>{
    return await db.select().from(shortenerTable);
}


export const getLinkByShortCode = async (shortCode) =>{
    // const url = await db.select().from(shortenerTable).where({shortCode:shortCode});
    const url = await db.select().from(shortenerTable).where(eq(shortenerTable.shortCode,shortCode));
    // console.log(url);
    return url[0];
    
}

export const insertShortLink = async (url,shortCode) =>{
    const insertedData = await db.insert(shortenerTable).values({
        url:url,
        shortCode:shortCode
    })
    console.log(insertedData);
    
}


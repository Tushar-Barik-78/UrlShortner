import {  eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { userTable } from "../drizzle/schema.js";
import bcrypt from "bcryptjs";
import argon2 from "argon2";

export const getUserByEmail = async (email) => {
  const [user] = await db.select().from(userTable).where(eq(userTable.email, email));
  return user;
};

export const createUser = async ({name, email, password}) => {
  return await db.insert(userTable).values({ name, email, password });
};

// export const verifyUser = async ({email,password})=>{

//     const [user] = await db.select().from(userTable).where(and(eq(userTable.email,email),eq(userTable.password,password)));
//     return user;
// }

// ! Hashing password
export const hashPassword = async(password)=>{
  // return await bcrypt.hash(password,10);  //! using bcrypt
  return await argon2.hash(password);     //! using argon2
}

export const comparePassword = async(password,hash)=>{
  // return await bcrypt.compare(password,hash);  //! using bcrypt
  return await argon2.verify(hash,password);    //! using argon2

}
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import fs from "fs/promises";
import {
  sessionsTable,
  userTable,
  verifyEmailTokensTable,
} from "../drizzle/schema.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constant.js";
import path from "path";
import mjml2html from "mjml";
import ejs from "ejs";
// import { Sendmail } from "../lib/nodeMailer.js";
import { Sendmail } from "../lib/send-email.js";

export const getUserByEmail = async (email) => {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));
  return user;
};

export const createUser = async ({ name, email, password }) => {
  return await db
    .insert(userTable)
    .values({ name, email, password })
    .$returningId();
};

// export const verifyUser = async ({email,password})=>{
//     const [user] = await db.select().from(userTable).where(and(eq(userTable.email,email),eq(userTable.password,password)));
//     return user;
// }

// ! Hashing password
export const hashPassword = async (password) => {
  // return await bcrypt.hash(password,10);  //! using bcrypt
  return await argon2.hash(password); //! using argon2
};

export const comparePassword = async (password, hash) => {
  // return await bcrypt.compare(password,hash);  //! using bcrypt
  return await argon2.verify(hash, password); //! using argon2
};

// ! JSON Web Token
export const generateToken = async ({ id, name, email }) => {
  return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

// export const verifyJWTToken = async (token) => {
//   return jwt.verify(token, process.env.JWT_SECRET);
// };

// ! Hybrid authentication

// * Create user session in the sessions table
export const createSession = async (userId, { ip, userAgent }) => {
  const [session] = await db
    .insert(sessionsTable)
    .values({ userId, ip, userAgent })
    .$returningId();

  return session;
};

// * Create access token
export const createAccessToken = ({ id, name, email, sessionId }) => {
  return jwt.sign({ id, name, email, sessionId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

// * Create refresh token
export const createRefreshToken = ({ sessionId }) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

//todo Create cookies for hybrid authentication from login or signup
export const createCookies = async ({ user, req, res, name, email }) => {
  const userId = user.id || user.insertId;

  const session = await createSession(userId, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = createAccessToken({
    id: userId,
    name: user.name || name,
    email: user.email || email,
    isEmailValid: user.isEmailValid || false,
    sessionId: session.id,
  });
  const refreshToken = createRefreshToken({
    sessionId: session.id,
  });

  const baseConfig = {
    httpOnly: true,
    secure: true,
  };

  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
};

// ! verify refresh token and again generate new tokens
// * Find session by ID
export const findSessionById = async (sessionId) => {
  const [sessionData] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));
  // console.log(sessionData);

  return sessionData;
};

// * Find user by ID
export const findUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId));
  // console.log(user);
  return user;
};

//todo Return a new access token, create new session token and user data
export const refreshTokens = async (refreshToken) => {
  try {
    const decodedToken = await verifyJWTToken(refreshToken);
    const currentDBSession = await findSessionById(decodedToken.sessionId);

    if (!currentDBSession || !currentDBSession.valid) {
      throw new Error("Invalid session");
    }

    const userId = currentDBSession.userId;
    const user = await findUserById(userId);
    if (!user) throw new Error("Invalid user");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      sessionId: currentDBSession.id,
    };
    const newAccessToken = createAccessToken(userInfo);
    const newRefreshToken = createRefreshToken({
      sessionId: currentDBSession.id,
    });

    return {
      newAccessToken,
      newRefreshToken,
      user: userInfo,
    };
  } catch (error) {
    console.log(error.message);
  }
};

// * Verify JWT Token
export const verifyJWTToken = async (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// * Clear user session on logout
export const clearUserSession = async (sessionId) => {
  // console.log(sessionId);
  // console.log(typeof sessionId);

  const [deletedSession] = await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));
  console.log(deletedSession);
};

// ! Email verification
export const generateRandomToken = (digit = 8) => {
  const min = 10 ** (digit - 1); // 10000000
  const max = 10 ** digit; //100000000

  return crypto.randomInt(min, max).toString();
};

export const insertVerifyEmailToken = async ({ userId, token }) => {
  await db.transaction(async (tx) => {
    try {
      //* delete all the expired tokens
      await tx
        .delete(verifyEmailTokensTable)
        .where(lt(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`));

      //* delete all the previous token of same user
      await tx
        .delete(verifyEmailTokensTable)
        .where(eq(verifyEmailTokensTable.userId, userId));

      //* insert new token to the database
      await tx.insert(verifyEmailTokensTable).values({ userId, token });
    } catch (error) {
      console.log(error);
    }
  });
};

// createVerifyEmailLink
export const createVerifyEmailLink = async ({ email, token }) => {
  // const uriEncodedEmail = encodeURIComponent(email);
  // return `${process.env.FRONTEND_URL}/verify-email-token?token=${token}&email=${uriEncodedEmail}`;

  const url = new URL(`${process.env.FRONTEND_URL}/verify-email-token`);
  url.searchParams.append("token", token);
  url.searchParams.append("email", email);

  // console.log(url);

  return url.toString();
};

export const sendNewVerifyEmailLink = async ({ userId, email }) => {
  const randomToken = generateRandomToken();
  // console.log(user, randomToken);

  await insertVerifyEmailToken({ userId: userId, token: randomToken });

  const verifyEmailLink = await createVerifyEmailLink({
    email: email,
    token: randomToken,
  });

  //* 1. get the file data of mjml
  const mjmlTemplate = await fs.readFile(
    path.join(import.meta.dirname, "..", "emails", "verify-email.mjml"),
    "utf-8"
  );
  // console.log(mjmlTemplate);

  //* to replace the placeholder with the actual values
  const filledTemplate = ejs.render(mjmlTemplate, {
    code: randomToken,
    link: verifyEmailLink,
  });
  // console.log(filledTemplate);
  

  // * To convert mjml to html
  const htmlOutput = mjml2html(filledTemplate).html;
  // console.log(htmlOutput);
  

  Sendmail({
    to: email,
    subject: "Verify your email",
    // html: `
    //     <h1>Click the link below to verify your email</h1>
    //     <p>You can use this 8-digit code: <code>${randomToken}</code></p>
    //     <a href="${verifyEmailLink}">Verify email</a>
    //   `,
    html: htmlOutput,
  }).catch(console.error);
};

// ! Finally Verify the email By clicking the link
// export const findVerificationEmailToken = async ({ email, token }) => {
//   // console.log(email,token);

//   const tokenData = await db
//     .select({
//       userId: verifyEmailTokensTable.userId,
//       token: verifyEmailTokensTable.token,
//       expiresAt: verifyEmailTokensTable.expiresAt,
//     })
//     .from(verifyEmailTokensTable)
//     .where(
//       and(
//         eq(verifyEmailTokensTable.token, token),
//         gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`),
//       ),
//     );
//   // console.log(tokenData);

//   if (!tokenData.length) {
//     return null;
//   }

//   const { userId } = tokenData[0];

//   const userData = await db
//     .select({
//       userId: userTable.id,
//       email: userTable.email,
//     })
//     .from(userTable)
//     .where(eq(userTable.id, userId));

//   if (!userData.length) {
//     return null;
//   }

//   return {
//     userId: userId,
//     email: userData[0].email,
//     token: token,
//     expiresAt: tokenData[0].expiresAt,
//   };
// };
export const findVerificationEmailToken = async ({ email, token }) => {
  // console.log(email,token);

  return await db
    .select({
      userID: userTable.id,
      email: userTable.email,
      token: verifyEmailTokensTable.token,
      expiresAt: verifyEmailTokensTable.expiresAt,
    })
    .from(verifyEmailTokensTable)
    .where(
      and(
        eq(verifyEmailTokensTable.token, token),
        eq(userTable.email, email),
        gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`),
      ),
    )
    .innerJoin(userTable, eq(verifyEmailTokensTable.userId, userTable.id));
};

export const verifyUserEmailAndUpdate = async (email) => {
  return await db
    .update(userTable)
    .set({ isEmailValid: true })
    .where(eq(userTable.email, email));
};

export const clearVerifyEmailTokens = async (email) => {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));

  return await db
    .delete(verifyEmailTokensTable)
    .where(eq(verifyEmailTokensTable.userId, user.id));
};

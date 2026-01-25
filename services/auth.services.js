import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { sessionsTable, userTable } from "../drizzle/schema.js";
import bcrypt from "bcryptjs";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constant.js";

export const getUserByEmail = async (email) => {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));
  return user;
};

export const createUser = async ({ name, email, password }) => {
  return await db.insert(userTable).values({ name, email, password });
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
export const createSession = async (userId, { ip, userAgent }) => {
  const [session] = await db
    .insert(sessionsTable)
    .values({ userId, ip, userAgent })
    .$returningId();

  return session;
};

export const createAccessToken = ({ id, name, email, sessionId }) => {
  return jwt.sign({ id, name, email, sessionId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

export const createRefreshToken = ({ sessionId }) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

export const findSessionById = async (sessionId) => {
  const [sessionData] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));
  // console.log(sessionData);

  return sessionData;
};

export const findUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId));
  // console.log(user);
  return user;
};

// ! Return a new access token, new session token and user data
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

export const verifyJWTToken = async (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const clearUserSession = async (sessionId) => {
  // console.log(sessionId);
  // console.log(typeof sessionId);

  const [deletedSession] = await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
  console.log(deletedSession);
  
};

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

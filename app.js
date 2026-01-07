import express from "express";
import { shortenerRouter } from "./routes/shortener.route.js";
import { authRouter } from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import { verifyAuthentication } from "./middlewares/verify_auth.middleware.js";

const app = express();

// * To set template engine
app.set("view engine", "ejs");

// * add static file (style, image, static docs)
app.use(express.static("public"));

// * use middleware for post method
app.use(express.urlencoded({ extended: true }));

// * use cookie-parser as a middleware
app.use(cookieParser());

// * create a session to flash error msg
app.use(session({secret:"my-secret", resave: true, saveUninitialized:false}));
app.use(flash());

// * use verify Token
app.use(verifyAuthentication);
app.use((req, res, next) => {
  res.locals.user = req.user;
  return next();
});

// * all router file write here
app.use(authRouter);
app.use(shortenerRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
});

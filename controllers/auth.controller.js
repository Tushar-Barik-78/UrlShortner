import {
  clearUserSession,
  comparePassword,
  createCookies,
  createUser,
  getUserByEmail,
  hashPassword,
} from "../services/auth.services.js";
import {
  loginUserSchema,
  registerUserSchema,
} from "../validators/auth.validator.js";

export const getRegisterPage = (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("../views/auth/register", { errors: req.flash("errors") });
};

export const getLoginPage = (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("auth/login", { errors: req.flash("errors") });
};

export const postRegister = async (req, res) => {
  if (req.user) return res.redirect("/");

  // console.log(req.body);
  // ! Zod validation
  // const {name,email,password} = await req.body;
  const { data, error } = registerUserSchema.safeParse(req.body);

  if (error) {
    console.log(error.issues[0]);
    req.flash("errors", error.issues[0].message);
    return res.redirect("/register");
  }

  const { name, email, password } = data;
  // console.log(data);

  // ! check email from database
  const userExists = await getUserByEmail(email);
  // console.log(userExists);

  // if(userExists) return res.status(404).send("user already present")
  if (userExists) {
    req.flash("errors", "User already exists");
    return res.redirect("/register");
  }

  // ! Password Hashing
  const hashedPassword = await hashPassword(password);

  const [newUser] = await createUser({ name, email, password: hashedPassword });
  console.log(newUser);
  
  await createCookies({
    user: newUser,
    req,
    res,
    name,
    email,
  });

  res.redirect("/");
};

export const postLogin = async (req, res) => {
  if (req.user) return res.redirect("/");

  // ! zod validation
  // const {email,password} = await req.body;
  const { data, error } = loginUserSchema.safeParse(req.body);

  if (error) {
    req.flash("errors", error.issues[0].message);
    return res.redirect("/login");
  }
  const { email, password } = data;

  const user = await getUserByEmail(email);
  // console.log(user);
  if (!user) {
    req.flash("errors", "Invalid Email or Password");
    return res.redirect("/login");
  }

  // ! compare hashed password
  const isPasswordValid = await comparePassword(password, user.password);
  // console.log(isPasswordValid);

  // if(password != user.password) return res.redirect('/login');
  // ! flash message
  if (!isPasswordValid) {
    req.flash("errors", "Invalid Email or Password");
    return res.redirect("/login");
  }

  // res.setHeader("Set-Cookie","isLoggedIn=true; path=/;")
  // res.cookie('isLoggedIn',true);
  // ! JWT token
  //   const token = await generateToken({
  //     id: user.id,
  //     name: user.name,
  //     email: user.email,
  //   });
  //   // console.log(token);
  //   res.cookie("access_token", token);

  // ! Hybrid authencation
  await createCookies({ user, req, res });

  res.redirect("/");
};

export const getMe = async (req, res) => {
  if (!req.user) return res.send("Not logged in");
  return res.send(`<h1>Hey ${req.user.name} - ${req.user.email}</h1>`);
};

export const logoutUser = async (req, res) => {  
  if (!req.user) return res.redirect("/login");
  
  await clearUserSession(req.user.sessionId);

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  return res.redirect("/login");
};

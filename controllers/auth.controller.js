import { comparePassword, createUser, getUserByEmail, hashPassword } from "../services/auth.services.js"

export const getRegisterPage = (req,res)=>{
    return res.render("../views/auth/register")
}


export const getLoginPage = (req,res)=>{
    return res.render("auth/login")
}


export const postRegister = async(req,res)=>{

    // console.log(req.body);
    const {name,email,password} = await req.body;
    const userExists = await getUserByEmail(email);
    // console.log(userExists);

    if(userExists) return res.status(404).send("user already present")
    
    // ! Password Hashing
    const hashedPassword = await hashPassword(password);

    const [newUser] = await createUser({name,email,password:hashedPassword});
    console.log(newUser);
    

    res.redirect('/login');
}

export const postLogin = async (req,res) =>{
    // res.setHeader("Set-Cookie","isLoggedIn=true; path=/;")
    res.cookie('isLoggedIn',true);

    const {email,password} = await req.body;
    const user = await getUserByEmail(email);
    // console.log(user);
    if(!user) res.redirect("/register");

    // ! compare hashed password
    const isPasswordValid = await comparePassword(password,user.password);
    // console.log(isPasswordValid);
    
    // if(password != user.password) return res.redirect('/login');
    if(!isPasswordValid) return res.redirect('/login');
    

    res.redirect("/");
}
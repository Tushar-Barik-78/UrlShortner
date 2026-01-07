import { verifyJWTToken } from "../services/auth.services.js";

export const verifyAuthentication = async(req,res,next) =>{
    const token = req.cookies.access_token;

    if(!token) {
        req.user = null;
        return next();
    }

    try{
        const decodedToken = await verifyJWTToken(token);
        req.user = decodedToken;
        // console.log(req.user);
        
    }catch(error){
        req.user = null;
    }

    return next();
}
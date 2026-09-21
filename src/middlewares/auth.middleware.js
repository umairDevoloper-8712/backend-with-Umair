import JWT from "jsonwebtoken"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {asyncHandler} from "../utils/asynchandler.js"





export const verifyJWT = asyncHandler(async (res, req, next) => {


   try {
     const token = await req.cookies?.accessToken || req.header("Authorization")?.replace("Barer", "")
 
 
     if (!token) {
 
         throw new ApiError(401 , "un Authorized Access")
 
     }
   const decodedToken = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
    const user = await User.findById(decodedToken?._id).select("-password , -accessToken")
 
    if (!user) {
 
     throw new ApiError(400, "Invaid access tokn")
     
    }
    req.user = user
    next()
   } catch (error) {

    throw new ApiError(401 ,error?.message  || "invalid access token");
    
    
   }

})
import jwt,{ JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../config";

const createToken =(payLoad: JwtPayload, secret:string, expiresIn: SignOptions)=>{

    const token = jwt.sign(payLoad,secret,{expiresIn}as SignOptions)

    return token

}

const verifyToken = (token:string, secret:string)=> {
    try {
        const decoded = jwt.verify(token, secret);
        return {
            success:true,
            data: decoded
        }
    } catch (error:any) {
        console.log("Error verifying token:", error);
       return {
        success: false,
        error: error.message
       }
    }
};

const generateTokens = (payload: JwtPayload) => {
  const accessToken = createToken(
    payload,
    config.jwt.accessTokenSecret,
    config.jwt.accessTokenExpiresIn as SignOptions
  );

  const refreshToken = createToken(
    payload,
    config.jwt.refreshTokenSecret,
    config.jwt.refreshTokenExpiresIn as SignOptions
  );

  return {
    accessToken,
    refreshToken,
  };
};

export const jwtUtils = {
    createToken,
    verifyToken,
    generateTokens
}
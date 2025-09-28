import jwt from "jsonwebtoken";
import {ENV} from "./env.js";

export const generateToken = (userId, res) => {
  const token = jwt.sign(
    { userId },
    ENV.SECRET_KEY,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    httpOnly: true, // prevent XSS
    sameSite: "strict", // prevent CSRF
    secure: ENV.NODE_ENV === "development" ? false : true
  });

  return token; 
};

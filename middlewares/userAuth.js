import { jwtDecode } from "jwt-decode";

export const validateUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid token format" });
    }

    const { exp } = jwtDecode(token); 
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    if (exp < currentTimeInSeconds) {
      return res.status(401).json({ message: "Token expired!" });
    } else {
      console.log("Token is valid");
      next(); // Call the next middleware or route handler
    }
  } catch (err) {
    console.error(`Error in validateUser middleware: ${err}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

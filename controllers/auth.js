import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.query;
    const user = await User.findOne({ email: email });
    if (
      email != user.dataValues.email ||
      password != user.dataValues.password
    ) {
      return res.status(401).json({
        message: "No User Found / incorrect password, please sign in",
      });
    }
    const jwtOptions = {};
    jwtOptions.expiresIn = 60 * 60;
    const token = jwt.sign({ email: email }, "shhhhh", jwtOptions);
    return res.status(200).json({ token });
    // return res.redirect("/api");
  } catch (err) {
    console.log(`Error ${err}`);
  }
};

export const signUp = async (req, res) => {
  try {
    const { email, password } = req.body;
    await User.create({ email, password });
    console.log(`User created sucessfully! with ${email} ${password} `);
    return res.redirect("/");
  } catch (err) {
    console.log(`Error while creatinng user ${err}`);
  }
};

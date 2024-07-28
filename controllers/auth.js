import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";
import { Sequelize } from "sequelize";

export const login = async (req, res) => {
  try {
    const { email, password } = req.query;
    const user = await User.findOne({ email: email });
    console.log("query ", req.query, user);
    if (
      email != user?.dataValues?.email ||
      password != user?.dataValues?.password
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
    console.log("req.body ", req.body);
    await User.create({ email, password });
    console.log(`User created successfully! with email: ${email}`);
    return res.redirect("/");
  } catch (err) {
    if (err instanceof Sequelize.UniqueConstraintError) {
      console.log(`Error: Email ${err.errors[0].value} is already in use.`);
      return res.status(400).json({message: `Error: Email ${err.errors[0].value} is already in use.`});
    } else {
      console.log(`Error while creating user: ${err.message}`);
    }
  }
};

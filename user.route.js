const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/user.model")
const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        bcrypt.hash(password, 10, async (err, hash) => {
            if (hash) {
                const user = new userModel({ username, email, password: hash });
                await user.save();
                res.send({ msg: "User registered successfully" })
            }
            else {
                res.send({ msg: "Something went wrong" })
            }
        });
    } catch (error) {
        res.send({ msg: "Something went wrong" })
    }
});

userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ msg: "User not found" });
        }
        else {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    const token = jwt.sign({ userID: user._id, email: user.email }, "coding");
                    res.status(200).send({ msg: "User login successfully", token, username: user.username });
                }
                else {
                    res.status(400).send({ msg: "Wrong credentials" });
                }
            })
        }
    } catch (error) {
        res.status(500).send({ msg: "Something went wrong", error: error.message });
    }
});


userRouter.post("/logout", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(400).send({ msg: "No token provided" });
        }
        // JWTs are stateless, so the client must delete the token on its side
        // (e.g. localStorage.removeItem("token"))
        res.status(200).send({ msg: "User logged out successfully" });
    } catch (error) {
        res.status(500).send({ msg: "Something went wrong", error: error.message });
    }
});

module.exports = { userRouter };
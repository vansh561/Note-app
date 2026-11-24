const express = require("express");
require("dotenv").config();

const {userRouter} = require("./routes/user.route");
const {noteRouter} = require("./routes/note.route")
const {connection} = require("./config/db");

const app = express();

app.use(express.json());

app.use("/user", userRouter);

app.use("/note", noteRouter);

app.get("/home", (req,res)=>{
    res.send({msg:"Welcome to Note Application"})
});

app.listen(process.env.PORT, async()=>{
    try {
        await connection;
        console.log("DB connected")
    } catch (error) {
        console.log(error)
    }
    console.log("server started")
});
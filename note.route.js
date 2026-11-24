const express = require("express");
const { auth } = require("../middleware/auth.middlewere")
const { noteModel } = require("../models/note.model")
const noteRouter = express.Router();

noteRouter.post("/create", auth, async (req, res) => {
    try {
        const { title, content } = req.body;
        const userID = req.userID;

        const note = new noteModel({ title, content, user: userID });
        await note.save();

        res.status(201).send({ msg: "Note created successfully", note });
    } catch (error) {
        res.status(500).send({ msg: "Something went wrong", error: error.message });
    }
})

noteRouter.get("/read", auth, async (req, res) => {
    try {
        const userID = req.userID;
        const notes = await noteModel.find({ user: userID });
        res.status(200).send({ notes });
    } catch (error) {
        res.status(500).send({ msg: "Something went wrong", error: error.message });
    }
});

noteRouter.get("/read/:id", auth, async (req, res) => {
    try {
        const {id} = req.params;
        const userID = req.userID;
        
        const note = await noteModel.findOne({ _id: id, user: userID });
        
        if (!note) {
            return res.status(404).send({ msg: "Note not found or unauthorized" });
        }
        res.status(200).send({ note });
    } catch (error) {
        res.status(500).send({ msg: "Something went wrong", error: error.message });
    }
});

noteRouter.patch("/update/:id", auth, async (req, res) => {
    try {
        const {id} = req.params;
        const userID = req.userID;

        const note = await noteModel.findById(id);
        if (!note) {
            return res.status(404).send({ msg: "Note not found" });
        }

        if (note.user.toString() !== userID) {
            return res.status(403).send({ msg: "Unauthorized: You can only update your own notes" });
        }

        const updatedNote = await noteModel.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).send({ msg: "Note updated successfully", updatedNote });
    } catch (error) {
        res.status(500).send({ msg: "Something went wrong", error: error.message });
    }
});

noteRouter.delete("/delete/:id", auth, async (req, res) => {
    try {
        const {id} = req.params;
        const userID = req.userID;

        const note = await noteModel.findById(id);
        if (!note) {
            return res.status(404).send({ msg: "Note not found" });
        }

        if (note.user.toString() !== userID) {
            return res.status(403).send({ msg: "Unauthorized: You can only delete your own notes" });
        }

        await noteModel.findByIdAndDelete(id);
        res.status(200).send({ msg: "Note deleted successfully" });
    } catch (error) {
        res.status(500).send({ msg: "Something went wrong", error: error.message });
    }
});

module.exports = { noteRouter };
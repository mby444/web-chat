import express from "express";
import { Chat, Username } from "../database/model.js";

const router = express.Router();

router.get("/username/:name", async (req, res) => {
    const { name } = req.params;
    const oldUsername = await Username.findOne({ name: { $regex: new RegExp(`^${name}$`), $options: "i" } });
    const options = {
        error: false,
        message: "Ok",
        data: oldUsername
    };
    res.json(options);
});

router.get("/chat/all", async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chats = await Chat.find({ dateMs: { $gte: today.getTime() } });
    const options = {
        error: false,
        message: "Ok",
        data: chats
    };
    res.json(options);
});

router.post("/username", async (req, res) => {
    const { name, loginDate=Date.now() } = req.body;
    const options = {
        error: false,
        message: "Ok"
    };
    try {
        await Username.deleteMany({ name });
        const newUsername = new Username({ name, loginDate });
        await newUsername.save();
        res.json(options);
    } catch (err) {
        options.error = true;
        options.message = err.message;
        res.json(options);
    }
});

router.post("/chat", async (req, res) => {
    const { username, message, dateMs=Date.now() } = req.body;
    const options = {
        error: false,
        message: "Ok"
    };
    const newChat = new Chat({ username, message, dateMs });
    await newChat.save();
    res.json(options);
});

router.delete("/username/expired", async (req, res) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await Username.deleteMany({ loginDate: { $lt: today.getTime() } });
    res.json({ message: "Ok" });
});

router.delete("/chat/expired", async (req, res) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await Chat.deleteMany({ dateMs: { $lt: today.getTime() } });
    res.json({ message: "Ok" });
});

export default router;
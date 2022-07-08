import express from "express";
import { Chat, Username } from "../database/model.js";

const router = express.Router();

router.get("/username/:name", async (req, res) => {
    const { name } = req.params;
    const oldUsername = await Username.findOne({ name });
    const options = {
        error: false,
        message: "Ok",
        data: oldUsername
    };
    res.json(options);
});

router.post("/username", async (req, res) => {
    const { name, lastOnline=Date.now() } = req.body;
    const options = {
        error: false,
        message: "Ok"
    };
    try {
        await Username.deleteMany({ name });
        const newUsername = new Username({ name, lastOnline });
        await newUsername.save();
        res.json(options);
    } catch (err) {
        options.error = true;
        options.message = err.message;
        res.json(options);
    }
});

export default router;
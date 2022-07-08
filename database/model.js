import mongoose from "mongoose";

const Chat = mongoose.model("chats", {
    username: {
        type: String
    },
    message: {
        type: String
    },
    dateMs: {
        type: Number
    }
});

const Username = mongoose.model("usernames", {
    name: {
        type: String
    },
    lastOnline: {
        type: Number
    }
});

export { Chat, Username };
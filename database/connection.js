import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const { MONGO_URI: mongoUri } = process.env;

mongoose.connect(mongoUri, (err) => {
    if (err) {
        return console.log(err);
    }
    console.log("Mongo DB connected");
});
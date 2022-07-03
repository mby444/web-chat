import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import indexRoute from "./routes/index.js";

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT;
const io = new Server(server);

app.set("view engine", "ejs");
app.set("views", "./views");
app.use("/", indexRoute);
app.use(express.static("./public"));

io.on("connection", (socket) => {
    socket.on("send-message", (message, callback) => {
        socket.broadcast.emit("receive-message", message);
        callback();
    });
});

server.listen(port, () => {
    console.log(`Server running at port ${port}...`);
});
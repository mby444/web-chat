import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import "./database/connection.js";
import indexRoute from "./routes/index.js";
import dataRoute from "./routes/data.js";
import notFoundRoute from "./middleware/not-found.js";
import { getAllSockets } from "./utils/socket.js";

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT;
const io = new Server(server);

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/", indexRoute);
app.use("/data", dataRoute);
app.use(express.static("./public"));
app.use("*", notFoundRoute);

io.on("connection", async (socket) => {
    const allSockets = await io.allSockets();

    io.emit("user-online", getAllSockets(allSockets));

    socket.on("send-message", (user, callback) => {
        socket.broadcast.emit("receive-message", user);
        callback();
    });

    socket.on("disconnect", async () => {
        const allSockets = await io.allSockets();
        io.emit("user-offline", getAllSockets(allSockets));
    });
});

server.listen(port, () => {
    console.log(`Server running at port ${port}...`);
});
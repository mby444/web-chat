const textInput = document.querySelector("#text");
const sendBtn = document.querySelector(".send-btn");
const socket = io();

socket.on("connect_error", () => {
    console.log("Socket error");
});

const getMessageElement = (message="", options={isAuthor: false}) => {
    const classNames1 = ["chat-subcontainer"];
    const classNames2 = ["chat", "p-2", "m-2", "rounded"];
    if (options.isAuthor) {
        classNames1.push("chat-subcontainer-author");
        classNames2.push("chat-author");
    }
    const element = `
    <div class="${classNames1.join(" ")}">
        <div class="${classNames2.join(" ")}">${message}</div>
    </div>
    `;
    return element;
};

const receiveMessage = (message) => {
    const chatContainer = document.querySelector(".chat-container");
    const element = getMessageElement(message, { isAuthor: false });
    const prevMessage = chatContainer.innerHTML;
    chatContainer.innerHTML = prevMessage + element;
};

const sendMessage = (message="") => {
    message = message.trim();
    if (!message) return;
    const chatContainer = document.querySelector(".chat-container");
    const element = getMessageElement(message, { isAuthor: true });
    const prevMessage = chatContainer.innerHTML;
    socket.emit("send-message", message, () => {
        chatContainer.innerHTML = prevMessage + element;
        textInput.value = "";
    });
};

socket.on("receive-message", (message) => {
    receiveMessage(message);
});

sendBtn.addEventListener("click", () => {
    const message = document.querySelector("#text").value;
    sendMessage(message);
});
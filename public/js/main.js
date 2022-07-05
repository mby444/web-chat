const textInput = document.querySelector("#text");
const sendBtn = document.querySelector(".send-btn");
const socket = io();

socket.on("connect_error", () => {
    console.log("Socket error");
});

const setUsername = (username) => {
    localStorage.setItem("mby444-webchat-username", username);
};

const getUsername = () => {
    let savedUsername = localStorage.getItem("mby444-webchat-username");
    if (savedUsername) {
        return savedUsername;
    }
    let userInput = prompt("Enter username");
    if (!userInput) return getUsername();
    setUsername(userInput);
    return userInput;
};

const getMessageElement = (user={}, options={isAuthor: false}) => {
    const classNames1 = ["chat-subcontainer"];
    const classNames2 = ["chat", "p-2", "m-2", "rounded"];
    if (options.isAuthor) {
        classNames1.push("chat-subcontainer-author");
        classNames2.push("chat-author");
    }
    const element = `
    <div class="${classNames1.join(" ")}">
        <div class="chat-username pb-1 pt-1">${options.isAuthor ? "" : user.name}</div>
        <div class="${classNames2.join(" ")}">${user.message}</div>
    </div>
    `;
    return element;
};

const receiveMessage = (user) => {
    const chatContainer = document.querySelector(".chat-container");
    const element = getMessageElement(user, { isAuthor: false });
    const prevMessage = chatContainer.innerHTML;
    chatContainer.innerHTML = prevMessage + element;
};

const sendMessage = (user={}) => {
    user.message = user.message.replace(/(\<script\>|\<\/script\>)/gim, "");
    if (!user.message) return;
    const chatContainer = document.querySelector(".chat-container");
    const element = getMessageElement(user, { isAuthor: true });
    const prevMessage = chatContainer.innerHTML;
    socket.emit("send-message", user, () => {
        chatContainer.innerHTML = prevMessage + element;
        textInput.value = "";
    });
};

socket.on("receive-message", (user) => {
    receiveMessage(user);
});

sendBtn.addEventListener("click", () => {
    const message = document.querySelector("#text").value;
    const user = { name: getUsername(), message: message.trim() };
    sendMessage(user);
});

window.addEventListener("load", () => {
    getUsername();
});
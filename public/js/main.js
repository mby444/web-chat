const textInput = document.querySelector("#text");
const sendBtn = document.querySelector(".send-btn");
const socket = io();

socket.on("connect_error", () => {
    console.log("Socket error");
});

const getUsername = async (username) => {
    const rawResponse = await fetch(`/data/username/${username}`);
    const response = await rawResponse.json();
    console.log(response);
    return response;
};

const setUsername = async (username) => {
    localStorage.setItem("mby444-webchat-username", username);
    const payload = JSON.stringify({ name: username });
    const rawResponse = await fetch("/data/username", {
        method: "POST",
        headers: {
            "Accept": "appliaction/json",
            "Content-Type": "application/json"
        },
        body: payload
    });
    const response = await rawResponse.json();
    console.log(response);
};

const generateUsername = async () => {
    let savedUsername = localStorage.getItem("mby444-webchat-username");
    if (savedUsername) {
        await setUsername(savedUsername);
        return savedUsername;
    }
    let userInput = prompt("Enter username");
    if (!userInput) return generateUsername();
    let oldUsername = await getUsername(userInput);
    if (oldUsername.data) {
        alert("Username already exists!");
        return generateUsername();
    }
    await setUsername(userInput);
    return userInput;
};

const thisIsAuthor = (user={}) => {
    const savedUsername = localStorage.getItem("mby444-webchat-username") || "";
    const isAuthor = user.name === savedUsername;
    return isAuthor;
};

const displayMessages = (users=[]) => {
    if (users.length === 0) return;
    const chatContainer = document.querySelector(".chat-container");
    const element = users.map((user) => {
        user.name = user.username;
        const options = {
            isAuthor: thisIsAuthor(user)
        };
        return getMessageElement(user, options);
    }).join("");
    const prevMessage = chatContainer.innerHTML;
    chatContainer.innerHTML = prevMessage + element;
};

const generateStoredChat = async () => {
    const rawResponse = await fetch("/data/chat/all");
    const response = await rawResponse.json();
    displayMessages(response.data);
};

const removeExpiredUsername = async () => {
    const rawResponse = await fetch("/data/username/expired", {
        method: "DELETE",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
    });
    const response = await rawResponse.json();
    console.log(response);
};

const removeExpiredChat = async () => {
    const rawResponse = await fetch("/data/chat/expired", {
        method: "DELETE",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    });
    const response = await rawResponse.json();
    console.log(response);
};

const getMessageElement = (user={}, options={isAuthor: false}) => {
    const classNames1 = ["chat-subcontainer"];
    const classNames2 = ["chat-message-container"];
    const classNames3 = ["chat", "p-2", "m-2", "rounded"];
    if (options.isAuthor) {
        classNames1.push("chat-subcontainer-author");
        classNames2.push("chat-message-container-author");
        classNames3.push("chat-author");
    }
    const element = `
    <div class="${classNames1.join(" ")}">
        <div class="chat-username pb-1 pt-1">${options.isAuthor ? "" : user.name}</div>
        <div class="${classNames2.join(" ")}">
            <div class="${classNames3.join(" ")}">${user.message}</div>
        </div>
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

const sendPostMessage = async (user) => {
    const payload = JSON.stringify({
        username: user.name,
        message: user.message,
        dateMs: user.dateMs
    });
    const rawResponse = await fetch("/data/chat", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: payload
    });
    const response = await rawResponse.json();
    console.log(response);
};

const sendMessage = (user={ message: ""}) => {
    user.message = user.message.replace(/(\<script\>|\<\/script\>)/gim, "");
    if (!user.message) return;
    const chatContainer = document.querySelector(".chat-container");
    const element = getMessageElement(user, { isAuthor: true });
    const prevMessage = chatContainer.innerHTML;
    sendPostMessage(user);
    socket.emit("send-message", user, () => {
        chatContainer.innerHTML = prevMessage + element;
        textInput.value = "";
    });
};

const setOnlineCount = (count) => {
    const onlineCount = document.querySelector(".online-count");
    onlineCount.textContent = count;
};

socket.on("user-online", (allSockets) => {
    setOnlineCount(allSockets.length);
});

socket.on("user-offline", (allSockets) => {
    setOnlineCount(allSockets.length);
});

socket.on("receive-message", (user) => {
    receiveMessage(user);
});

sendBtn.addEventListener("click", async () => {
    const message = document.querySelector("#text").value;
    const name = await generateUsername();
    const user = { name, message: message.trim() };
    sendMessage(user);
});

window.addEventListener("load", () => {
    removeExpiredUsername();
    removeExpiredChat();
    generateStoredChat();
    generateUsername();
});
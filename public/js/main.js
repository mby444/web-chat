const textInput = document.querySelector("#text");
const initialBtn = document.querySelector(".initial-btn");
const sendBtn = document.querySelector(".send-btn");
const socket = io();

const spinnerButton = `
    <span class="spinner-btn spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
    </span>
`;

socket.on("connect_error", () => {
    console.log("Socket error");
});

const displaySpinner = (selector="", tag="") => {
    const element = document.querySelector(selector);
    element.setAttribute("disabled", "disabled");
    element.innerHTML = tag;
};

const hideSpinner = (selector="", initialText="") => {
    const element = document.querySelector(selector);
    element.removeAttribute("disabled");
    element.innerHTML = initialText;
};

const willEnableTyping = async () => {
    const savedUsername = localStorage.getItem("mby444-webchat-username");
    if (!savedUsername) return false;
    const storedUsername = await getUsername(savedUsername);
    if (!storedUsername.data) return false;
    textInput.removeAttribute("disabled");
    textInput.placeholder = "Type here...";
    initialBtn.style.display = "none";
    sendBtn.style.display = "inline";
    return true;
};

const toggleSendBtn = (value) => {
    if (value.trim().length === 0) {
        sendBtn.setAttribute("disabled", "disabled");
        return;
    }
    sendBtn.removeAttribute("disabled");
};

const willDisableTyping = async () => {
    const savedUsername = localStorage.getItem("mby444-webchat-username");
    if (savedUsername) {
        const storedUsername = await getUsername(savedUsername);
        if (storedUsername.data) return false;
    }
    textInput.setAttribute("disabled", "disabled");
    textInput.placeholder = "Enter your username first";
    textInput.value = "";
    sendBtn.style.display = "none";
    initialBtn.style.display = "inline";
    localStorage.removeItem("mby444-webchat-username");
    return true;
};

const getUsername = async (username) => {
    const rawResponse = await fetch(`/data/username/${username}`);
    const response = await rawResponse.json();
    console.log(response);
    return response;
};

const setUsername = async (username) => {
    localStorage.setItem("mby444-webchat-username", username);
    localStorage.setItem("mby444-webchat-username-login-date", Date.now().toString());
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

const promptUsername = (title) => new Promise(async (resolve, reject) => {
    const result = await Swal.fire({
        title,
        input: "text",
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: "Submit",

        preConfirm(username) {
            try {
                resolve(username);
            } catch (err) {
                Swal.showValidationMessage(err.message);
                resolve("");
            }
        }
    });
    resolve("");
});

const generateUsername = async () => {
    let savedUsername = localStorage.getItem("mby444-webchat-username");
    if (savedUsername) {
        let storedUsername = await getUsername(savedUsername);
        if (storedUsername.data) {
            return savedUsername;
        }
    }
    // let userInput = prompt("Enter username")?.trim();
    let userInput = await promptUsername("Enter username");
    userInput = userInput.trim();
    if (!userInput) return "";
    let oldUsername = await getUsername(userInput);
    if (oldUsername.data) {
        await Swal.fire("Username already exists!", "", "error");
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
    const loginDate = localStorage.getItem("mby444-webchat-username-login-date") || 0;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (today.getTime() > parseInt(loginDate)) {
        localStorage.removeItem("mby444-webchat-username");
        localStorage.removeItem("mby444-webchat-username-login-date");
    }

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

const sendMessage = async (user={ message: ""}) => {
    user.message = user.message.replace(/(\<script\>|\<\/script\>)/gim, "");
    if (!user.message) return;
    if (await willDisableTyping()) return;
    if (!localStorage.getItem("mby444-webchat-username")) return;
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

textInput.addEventListener("input", (event) => {
    toggleSendBtn(event.target.value);
});

initialBtn.addEventListener("click", async () => {
    displaySpinner(".initial-btn", spinnerButton);
    await generateUsername();
    await willEnableTyping();
    hideSpinner(".initial-btn", "Click here");
});

sendBtn.addEventListener("click", async () => {
    displaySpinner(".send-btn", spinnerButton);
    const message = document.querySelector("#text").value;
    const name = await generateUsername();
    const user = { name, message: message.trim() };
    await sendMessage(user);
    hideSpinner(".send-btn", "Send");
    toggleSendBtn("");
});

window.addEventListener("load", () => {
    toggleSendBtn("");
    removeExpiredUsername();
    removeExpiredChat();
    generateStoredChat();
    willEnableTyping();
    willDisableTyping();
});
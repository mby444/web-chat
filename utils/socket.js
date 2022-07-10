const getAllSockets = (allSockets) => {
    const sockets = [];
    allSockets.forEach((v1, v2, set) => {
        sockets.push(v1);
    });
    return sockets;
};

export { getAllSockets };
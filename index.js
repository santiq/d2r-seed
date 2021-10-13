const startServer = require("./server/server");
const { watchGameState } = require("./server/state");

async function main() {
    const { socket } = await startServer();
    await watchGameState(socket);
}

main();
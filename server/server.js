const express = require('express');
const app = express();
const socket = require('socket.io');
const fs = require('fs');

const { getMap } = require("./map");
const { getGameState } = require("./state");

const port = process.env.PORT || 3002;

const startServer = () => {

    const server = app.listen(port, () => {
        console.log(`App running on http://localhost:${port}`);
    });

    const io = socket(server);

    io.on('connection', function(socket) {
        console.log(`Socket ${socket.id} connected`);
    });

    app.get("/api/map", async(req, res) => {
        try {
            const { mapId, seedId, difficultyId } = req.query;
            const map = await getMap(seedId, mapId, difficultyId);
            return res.json(map).status(200)
        } catch(e) {
            console.log(e);
            return res.json(e.message).status(500);
        }
    })

    app.get("/api/state", async(req, res) => {
        try {
            const state = await getGameState();
            return res.json(state).status(200)
        } catch(e) {
            console.log(e);
            return res.json(e.message).status(500);
        }
    })

    app.use(express.static('ui'))

    return { apiServer: server, socket: io };
}

module.exports = startServer;
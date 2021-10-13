const memoryjs = require('memoryjs');
const { isValidMapId } = require("./map");
const lvls = require("./data/lvl.json");
const difficulty = require("./data/difficulty.json");

async function getProcessInfo() {
    const processName = "D2R.exe";
    return new Promise((resolve, reject) => {
        memoryjs.openProcess(processName, (error, processObject) => {
            if(error) {
                return reject(error)
            }
            return resolve(processObject);
        });
    })
}

async function readMemoryBuffer (handle, address, size) {
    return new Promise((resolve, reject) => {
        memoryjs.readBuffer(handle, address, size, (error, value) => {
            if(error) {
                console.log("Error reading memory as buffer")
                return reject(error)
            }
            return resolve(value);
        });
    })
}

async function getDifficultyId(handle, modBaseAddr) {
    const difficultyAddress = modBaseAddr + 0x1EB0ECC;
    const _buffDifficulty = await readMemoryBuffer(handle, difficultyAddress, 8);
    const difficulty = Number(_buffDifficulty.readInt16LE(0));
    return difficulty;
}

async function getMapSeed(handle, startingAddress) {
    const buf = await readMemoryBuffer(handle, startingAddress, 8);

    const playerUnit = Number(buf.readBigUInt64LE(0));
    
    const pAct = playerUnit + 0x20;

    const _buff1 = await readMemoryBuffer(handle, pAct, 8);
    const actAddress = Number(_buff1.readBigUInt64LE(0));

    const mapSeedAddress = actAddress + 0x14;

    const _buff3 = await readMemoryBuffer(handle, mapSeedAddress, 8);

    return _buff3.readUInt32LE();
}


async function getCurrentMapId(handle, startingAddress) {
    const _buffPlayerUnit = await readMemoryBuffer(handle, startingAddress, 8);
    const pPlayerUnit = Number(_buffPlayerUnit.readBigUInt64LE(0));

    const pPathAddress = pPlayerUnit + 0x38;

    const _buffPath = await readMemoryBuffer(handle, pPathAddress, 8);

    const pPath = Number(_buffPath.readBigUInt64LE(0))

    const pRoom1 = pPath + 0x20;

    const _buffRoom1 = await readMemoryBuffer(handle, pRoom1, 8);

    const pRoom1Address = Number(_buffRoom1.readBigUInt64LE(0));

    const pRoom2 = pRoom1Address + 0x18;

    const _buffRoom2 = await readMemoryBuffer(handle, pRoom2, 8);

    const pRoom2Address = Number(_buffRoom2.readBigUInt64LE(0));
    
    const pLevel = pRoom2Address + 0x90;

    const _buffLevel = await readMemoryBuffer(handle, pLevel, 8);

    const pLevelAddress = Number(_buffLevel.readBigUInt64LE(0));
    
    const dwLevelNo = pLevelAddress + 0x1F8;

    const _buffLevelNo = await readMemoryBuffer(handle, dwLevelNo, 8);

    return _buffLevelNo.readUInt32LE();
}

async function getGameStateFromMemory() {
    // Get D2 Process info
    try {
        const processInfo = await getProcessInfo();

        const handle = processInfo.handle;
        const startingAddress = processInfo.modBaseAddr + 0x2055E40;
    
        const mapId = await getCurrentMapId(handle, startingAddress);
        const seedId = await getMapSeed(handle, startingAddress);
        const difficultyId = await getDifficultyId(handle, processInfo.modBaseAddr);    
        return { mapId, seedId, difficultyId }
    } catch(e) {
        console.log("Error in game state");
        console.log(e)
        return null;
    }

}

const state = {
    seedId: -1,
    mapId: -1,
    difficultyId: -1,
}

function getGameState() {
    return state;
}

async function watchGameState(socket) {
  const tickInterval = 2000 // milisecs
  console.log("watching game state");
  setInterval(async () => {
      const gameState = getGameState();
      if(gameState) {
        const { seedId, mapId, difficultyId } = await getGameStateFromMemory();
        // @TODO Implement a better change state detection
        if (state.seedId !== seedId || state.mapId !== mapId || state.difficultyId !== difficultyId) {
            console.log("Game state changed, emitting socket update");
            socket.emit("state_update", {
                seedId,
                mapId,
                map: lvls[mapId] || 'none',
                difficultyId,
                difficulty: difficulty[difficultyId] || "none",
                valid_map: isValidMapId(mapId),                
            })
        }
        state.seedId = seedId;
        state.mapId = mapId;
        state.difficultyId = difficultyId;
      }
  }, tickInterval)
}

module.exports = { 
    watchGameState,
    getGameState
};
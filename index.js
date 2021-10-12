const memoryjs = require('memoryjs');

async function getProcessInfo() {
    const processName = "D2R.exe";
    return new Promise((resolve, reject) => {
        memoryjs.openProcess(processName, (error, processObject) => {
            if(error) {
                process.stdout.write("Error getting process")
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
                process.stdout.write("Error reading memory as buffer")
                return reject(error)
            }
            return resolve(value);
        });
    })
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

async function main() {
    // Get D2 Process info
    const processInfo = await getProcessInfo();

    const handle = processInfo.handle;
    const startingAddress = processInfo.modBaseAddr + 0x2055E40;

    const mapId = await getCurrentMapId(handle, startingAddress);
    const seedId = await getMapSeed(handle, startingAddress);
    
    console.log("Map seed: " + seedId);
    console.log("Current level id: " + mapId);
}

const tickInterval = 1000 // milisecs

setInterval(main, tickInterval)

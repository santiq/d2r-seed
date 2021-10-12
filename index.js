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

async function main() {
    // Get D2 Process info
    const processInfo = await getProcessInfo();

    const handle = processInfo.handle;
    const startingAddress = processInfo.modBaseAddr + 0x2055E40;
    
    // Create a buffer and store data on it
    const buf = await readMemoryBuffer(handle, startingAddress, 8);


    const playerUnit = Number(buf.readBigUInt64LE(0));
    const pPlayer = playerUnit + 0x10;
    
    const pAct = playerUnit + 0x20;

    // Get the actual player memory address
    const newBuf = await readMemoryBuffer(handle, pPlayer, 8);

    const playerAddress = Number(newBuf.readBigUInt64LE(0));
    const playerNameBuff = await readMemoryBuffer(handle, playerAddress, 16);

    const playerName = playerNameBuff.toString();
    
    console.log("Player name: ", playerName)
    

    const _buff1 = await readMemoryBuffer(handle, pAct, 8);
    const actAddress = Number(_buff1.readBigUInt64LE(0));

    const mapSeedAddress = actAddress + 0x14;

    const pPathAddress = playerUnit + 0x38;

    const _buff2 = await readMemoryBuffer(handle, pPathAddress, 8);

    const path = Number(_buff2.readBigUInt64LE(0));

    const posXAddress = path + 0x02;
    const posYAddress = path + 0x06;

    const _buff3 = await readMemoryBuffer(handle, mapSeedAddress, 8);
    
    
    const actIdAddress = playerUnit + 0x18;
    const _buff6 = await readMemoryBuffer(handle, actIdAddress, 8); // 6 
    console.log("Act id address" + actIdAddress.toString(16));
    console.log("Act ID " + _buff6.readUInt32LE());

    const _buff4 = await readMemoryBuffer(handle, posXAddress, 8);
    console.log("X Pos ADDRESS : " + posXAddress.toString(16));

    const _buff5 = await readMemoryBuffer(handle, posYAddress, 8);
    
    const message = 'Map Seed: ' + _buff3.readUInt32LE() + ' - X Pos: ' + _buff4.readUInt16LE() + ' - Y Pos: ' + _buff5.readUInt16LE();
    console.log(message);

}

setInterval(main, 1000)

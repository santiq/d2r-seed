const lodash = require("lodash");
const axios = require("axios");

async function isValidMapId(mapId) {
    return mapId > -1 && mapId < 136;
}

/**
 * { 
 *  [seed]: { 
 *      [difficulty_id]: {
 *          [map_id]: {
 *              image: "url",
 *              pending: true,
 *              call_date: true,
 *          }
 *      },   
 *   } 
 * }
 *  */
const mapCache = {

}

async function getMap(seedId, mapId, difficultyId) {
    if(lodash.get(mapCache, `${seedId}_${difficultyId}_${mapId}.pending`)) {
        console.log("Awaiting for image");
    } else if (lodash.get(mapCache, `${seedId}_${difficultyId}_${mapId}.image`, null)) {
        console.log("Returning map from cache");
    } else {
        console.log("Calling api to get map");
        lodash.set(mapCache, `${seedId}_${difficultyId}_${mapId}`, { pending: true, call_date: new Date().getTime(), image: "" });
        const image = await axios.post("https://reaper.turbotwat.xyz/api/rpc/getMap", { 
            params: {
                areaId: parseInt(mapId),
                mapid: parseInt(seedId),
                difficulty: parseInt(difficultyId)
            }
        }).then(res => res.data?.result)
        lodash.set(mapCache, `${seedId}_${difficultyId}_${mapId}`, { pending: false, image });
    }
    return mapCache[`${seedId}_${difficultyId}_${mapId}`]
}

async function getMapCache() {
    return mapCache;
}

module.exports = {
    getMap,
    getMapCache,
    isValidMapId
}
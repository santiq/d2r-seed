const socketURL = "http://localhost:3002";
const socket = io(socketURL);

socket.on('state_update', function(data){
    console.log("Game state updated")
    console.log(data)
    changeMapImage(data)
});

function fetchMap(data) {
    const { mapId, seedId, difficultyId} = data;
    return fetch(`/api/map?seedId=${seedId}&mapId=${mapId}&difficultyId=${difficultyId}`).then(response => response.json())
}

async function changeMapImage(data) {
    const map = await fetchMap(data);
    if(map.pending) {
        console.log("image still loading, wait a few seconds");
        setTimeout(changeMapImage, 2000)
    } else {
        console.log("Setting image url: ", map)
        setImageElement(map.image)
    }
}

function setImageElement(url) {
    document.getElementById("map-image").src = url;
}
var remote = require('electron').remote

var connectedServerAddress = remote.getGlobal('sharedSettings').serverAddress
var toolTipText = document.getElementById("tooltiptext")

inputBox = document.getElementById("statusbaraddress")
inputBox.value = connectedServerAddress
inputBox.style.width = connectedServerAddress + 8;

function resetThis(object){
    object.value = connectedServerAddress
}

function selectAndCopy(object){
    object.select()
    document.execCommand("copy")

    toolTipText.style.visibility = "visible";
    toolTipText.style.opacity = 1;
    setTimeout(() => {
        toolTipText.style.opacity = 0;
    }, 1000);
}
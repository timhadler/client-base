// client popups
const clientButs = document.getElementsByName("clientCallButton");
for (let i = 0; i< clientButs.length; i++) {
    clientButs[i].addEventListener('click', function() { clientPopup(clientButs[i].id); });
};


// Functions
// Edit address popup
function clientPopup(i) {
    const popup = document.getElementById("clientPopup-" + i);

    popup.style.visibility = "visible";
    //popup.style.width = popup.parentNode.parentElement.clientWidth.toString() + "px";
}

function clientPopupClose(i) {
    document.getElementById("addressEditPopup-" + i).style.visibility = "hidden";
}
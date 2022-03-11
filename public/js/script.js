// Add buttons
document.getElementById("addAddressBut").addEventListener('click', function() { addAddressForm()});

//Edit buttons
//const editBut = document.getElementById("editAddressBut");
//editBut.addEventListener('click', function() { editAddressForm()});
document.getElementById("editClientButton").addEventListener('click', function() { editClientForm()});

// Functions
// function editAddressForm() {
//     document.getElementById("editFormPopup").style.display = "block";
// }

function addAddressForm() {
    document.getElementById("addFormPopup").style.display = "block";
}

function editClientForm() {
    document.getElementById("cliFormPopup").style.display = "block";
}
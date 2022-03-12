// Add buttons
document.getElementById("addAddressBut").addEventListener('click', function() { addAddressForm() });
document.getElementById("addressCloseAddFormButton").addEventListener('click', function() { addAddressCloseForm() });

/***********************************************************
 * Edit buttons
 ***********************************************************/
document.getElementById("editClientButton").addEventListener('click', function() { editClientForm() });
document.getElementById("clientCancelPopupButton").addEventListener('click', function() { editClientCloseForm() });

// rDate popup
const rDateEditButs = document.getElementsByName("rDateEditButton");
for (let i = 0; i< rDateEditButs.length; i++) {
    rDateEditButs[i].addEventListener('click', function() { editDateForm(rDateEditButs[i].id); });
};

const rDateCancelButs = document.getElementsByName("rDateCancelPopupButton");
for (let i = 0; i< rDateCancelButs.length; i++) {
    rDateCancelButs[i].addEventListener('click', function() { editDateCloseForm(rDateCancelButs[i].id); });
};

/***********************************************************
 * Functions
 ***********************************************************/
// Add address popup
function addAddressForm() {
    document.getElementById("addFormPopup").style.visibility = "visible";
}

function addAddressCloseForm() {
    document.getElementById("addFormPopup").style.visibility = "hidden";
}

// Edit client popup
function editClientForm() {
    document.getElementById("cliFormPopup").style.visibility = "visible";
}

function editClientCloseForm() {
    document.getElementById("cliFormPopup").style.visibility = "hidden";
}

// Edit date popup
function editDateForm(i) {
    //console.log(i);
    document.getElementById("rDatePopup-" + i).style.visibility = "visible";
}

function editDateCloseForm(i) {
    document.getElementById("rDatePopup-" + i).style.visibility = "hidden";
}
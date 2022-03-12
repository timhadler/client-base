/***********************************************************
 * Add buttons
 ***********************************************************/
// Address buttons
document.getElementById("addAddressBut").addEventListener('click', function() { addAddressForm() });
document.getElementById("addressCloseAddFormButton").addEventListener('click', function() { addAddressCloseForm() });

// Date buttons
document.getElementById("addDateBut").addEventListener('click', function() { addDateForm() });
document.getElementById("dateCloseAddForm").addEventListener('click', function() { addDateCloseForm() });

// Contact buttons
document.getElementById("addContactBut").addEventListener('click', function() { addContactForm() });
document.getElementById("contactCloseAddFormBut").addEventListener('click', function() { addContactCloseForm() });

/***********************************************************
 * Edit buttons
 ***********************************************************/
document.getElementById("editClientButton").addEventListener('click', function() { editClientForm() });
document.getElementById("clientCancelPopupButton").addEventListener('click', function() { editClientCloseForm() });

// rDate popups
const rDateEditButs = document.getElementsByName("rDateEditButton");
for (let i = 0; i< rDateEditButs.length; i++) {
    rDateEditButs[i].addEventListener('click', function() { editDateForm(rDateEditButs[i].id); });
};

const rDateCancelButs = document.getElementsByName("rDateCancelPopupButton");
for (let i = 0; i< rDateCancelButs.length; i++) {
    rDateCancelButs[i].addEventListener('click', function() { editDateCloseForm(rDateCancelButs[i].id); });
};

// contact popups
const contactEditButs = document.getElementsByName("contactEditButton");
for (let i = 0; i< contactEditButs.length; i++) {
    contactEditButs[i].addEventListener('click', function() { editContactForm(contactEditButs[i].id); });
};

const contactCancelButs = document.getElementsByName("contactCancelPopupButton");
for (let i = 0; i< contactCancelButs.length; i++) {
    contactCancelButs[i].addEventListener('click', function() { editContactCloseForm(contactCancelButs[i].id); });
};

/***********************************************************
 * Functions
 ***********************************************************/
// Add address popup
function addAddressForm() {
    document.getElementById("addAddressPopup").style.visibility = "visible";
}

function addAddressCloseForm() {
    document.getElementById("addAddressPopup").style.visibility = "hidden";
}

// Edit client popup
function editClientForm() {
    document.getElementById("cliFormPopup").style.visibility = "visible";
}

function editClientCloseForm() {
    document.getElementById("cliFormPopup").style.visibility = "hidden";
}

// Add date popup
function addDateForm(i) {
    document.getElementById("addCallPopup").style.visibility = "visible";
}

function addDateCloseForm(i) {
    document.getElementById("addCallPopup").style.visibility = "hidden";
}

// Edit date popup
function editDateForm(i) {
    document.getElementById("rDateEditPopup-" + i).style.visibility = "visible";
}

function editDateCloseForm(i) {
    document.getElementById("rDateEditPopup-" + i).style.visibility = "hidden";
}

// Add contact popup
function addContactForm(i) {
    document.getElementById("addContactPopup").style.visibility = "visible";
}

function addContactCloseForm(i) {
    document.getElementById("addContactPopup").style.visibility = "hidden";
}

// Edit contact popup
function editContactForm(i) {
    //console.log("here");
    document.getElementById("contactEditPopup-" + i).style.visibility = "visible";
}

function editContactCloseForm(i) {
    document.getElementById("contactEditPopup-" + i).style.visibility = "hidden";
}
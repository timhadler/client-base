/***********************************************************
 * Add buttons
 ***********************************************************/
// Address buttons
document.getElementById("addAddressBut").addEventListener('click', function() { addAddressForm() });
document.getElementById("addAddressCloseButton").addEventListener('click', function() { addAddressCloseForm() });

// Date buttons
document.getElementById("addDateBut").addEventListener('click', function() { addDateForm() });
document.getElementById("dateCloseAddForm").addEventListener('click', function() { addDateCloseForm() });

// Contact buttons
document.getElementById("addContactBut").addEventListener('click', function() { addContactForm() });
document.getElementById("addContactCloseButton").addEventListener('click', function() { addContactCloseForm() });

/***********************************************************
 * Edit buttons
 ***********************************************************/
document.getElementById("editClientButton").addEventListener('click', function() { editClientForm() });
document.getElementById("editClientCloseButton").addEventListener('click', function() { editClientCloseForm() });

document.getElementById("editCommentButton").addEventListener('click', function() { editCommentForm() });
document.getElementById("commentCancelPopupButton").addEventListener('click', function() { editCommentCloseForm() });

// address popups
const addressEditButs = document.getElementsByName("addressEditButton");
for (let i = 0; i< addressEditButs.length; i++) {
    addressEditButs[i].addEventListener('click', function() { editAddressForm(addressEditButs[i].id); });
};

const addressCancelButs = document.getElementsByName("addressCancelPopupButton");
for (let i = 0; i< addressCancelButs.length; i++) {
    addressCancelButs[i].addEventListener('click', function() { editAddressCloseForm(addressCancelButs[i].id); });
};

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
    const popup = document.getElementById("addAddressPopup");

    popup.style.visibility = "visible";
    document.getElementById("overlay").style.visibility = "visible";
}

function addAddressCloseForm() {
    document.getElementById("addAddressPopup").style.visibility = "hidden";
    document.getElementById("overlay").style.visibility = "hidden";
}

// Edit address popup
function editAddressForm(i) {
    const popup = document.getElementById("addressEditPopup-" + i);

    popup.style.visibility = "visible";
    popup.style.width = popup.parentNode.parentElement.clientWidth.toString() + "px";
}

function editAddressCloseForm(i) {
    document.getElementById("addressEditPopup-" + i).style.visibility = "hidden";
}

// Edit client popup
function editClientForm() {
    const popup = document.getElementById("cliFormPopup");

    popup.style.visibility = "visible";
    document.getElementById("overlay").style.visibility = "visible";
}

function editClientCloseForm() {
    document.getElementById("cliFormPopup").style.visibility = "hidden";
    document.getElementById("overlay").style.visibility = "hidden";
}

// Edit Comments popup
function editCommentForm() {
    const popup = document.getElementById("commentEditPopup");

    popup.style.visibility = "visible";
    popup.style.width = popup.parentNode.parentElement.clientWidth.toString() + "px";
}

function editCommentCloseForm() {
    document.getElementById("commentEditPopup").style.visibility = "hidden";
}

// Add date popup
function addDateForm(i) {
    const popup = document.getElementById("addCallPopup");

    popup.style.visibility = "visible";
    //popup.style.width = popup.parentNode.parentElement.clientWidth.toString() + "px";

    document.getElementById("overlay").style.visibility = "visible";
}

function addDateCloseForm(i) {
    document.getElementById("addCallPopup").style.visibility = "hidden";
    document.getElementById("overlay").style.visibility = "hidden";
}

// Edit date popup
function editDateForm(i) {
    const popup = document.getElementById("rDateEditPopup-" + i);

    popup.style.visibility = "visible";
    //popup.style.width = popup.parentNode.parentElement.clientWidth.toString() + "px";

    document.getElementById("overlay").style.visibility = "visible";
}

function editDateCloseForm(i) {
    document.getElementById("rDateEditPopup-" + i).style.visibility = "hidden";
    document.getElementById("overlay").style.visibility = "hidden";
}

// Add contact popup
function addContactForm(i) {
    const popup = document.getElementById("addContactPopup");

    popup.style.visibility = "visible";
    document.getElementById("overlay").style.visibility = "visible";
}

function addContactCloseForm(i) {
    document.getElementById("addContactPopup").style.visibility = "hidden";
    document.getElementById("overlay").style.visibility = "hidden";
}

// Edit contact popup
function editContactForm(i) {
    //console.log("here");
    const popup = document.getElementById("contactEditPopup-" + i);

    popup.style.visibility = "visible";
    popup.style.width = popup.parentNode.parentElement.clientWidth.toString() + "px";
}

function editContactCloseForm(i) {
    document.getElementById("contactEditPopup-" + i).style.visibility = "hidden";
}
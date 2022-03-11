// Add buttons
document.getElementById("addAddressBut").addEventListener('click', function() { addAddressForm() });

/***********************************************************
 * Edit buttons
 ***********************************************************/
document.getElementById("editClientButton").addEventListener('click', function() { editClientForm() });

// rDate popup
const rDateEditButs = document.getElementsByName("rDateEditButton");
for (let i = 0; i< rDateEditButs.length; i++) {
    rDateEditButs[i].addEventListener('click', function() { rDateForm(rDateEditButs[i].id); });
};

const rDateCancelButs = document.getElementsByName("rDateCancelPopupButton");
for (let i = 0; i< rDateCancelButs.length; i++) {
    rDateCancelButs[i].addEventListener('click', function() { rDateCloseForm(rDateCancelButs[i].id); });
};

// Contact popup
const contactEditButs = document.getElementsByName("contactEditButton");
for (let i = 0; i< contactEditButs.length; i++) {
    contactEditButs[i].addEventListener('click', function() { contactForm(contactEditButs[i].id); });
};

const contactCancelButs = document.getElementsByName("contactCancelPopupButton");
for (let i = 0; i< contactCancelButs.length; i++) {
    contactCancelButs[i].addEventListener('click', function() { contactCloseForm(contactCancelButs[i].id); });
};

// Functions
function addAddressForm() {
    document.getElementById("addFormPopup").style.display = "block";
}

function editClientForm() {
    document.getElementById("cliFormPopup").style.display = "block";
}

function rDateForm(i) {
    //console.log(i);
    document.getElementById("rDatePopup-" + i).style.visibility = "visible";
}

function rDateCloseForm(i) {
    document.getElementById("rDatePopup-" + i).style.visibility = "hidden";
}

function contactForm(i) {
    //console.log(i);
    document.getElementById("contactPopup-" + i).style.visibility = "visible";
}

function contactCloseForm(i) {
    document.getElementById("contactPopup-" + i).style.visibility = "hidden";
}
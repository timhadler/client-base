import {callData} from "./script.js";

// Set event listeners for form buttons
document.getElementById("closeAddFormButton").addEventListener('click', function() { closeAddCustomerForm(); })
document.getElementById("closeCustomerFormButton").addEventListener('click', function() { closeCustomerForm(); })
document.getElementById("customerDropButton").addEventListener('click', function() { openDropButton(); })

// Customer popup form
export function openCustomerForm(customer) {
    document.getElementById("name").innerHTML = customer.name;
    document.getElementById("cn").innerHTML = customer.contactNumber;
    document.getElementById("ea").innerHTML = customer.email;
    document.getElementById("add").innerHTML = customer.address;
    document.getElementById("sub").innerHTML = customer.suburb;
    document.getElementById("ci").innerHTML = customer.city;
    document.getElementById("pc").innerHTML = customer.postCode;
    document.getElementById("fa").innerHTML = customer.freshAir;
    document.getElementById("n").innerHTML = customer.notes;
    document.getElementById("cbDate").value = findCallDate(customer.id);
    document.getElementById("customerPopup").style.display = "block";
}

export function openAddCustomerForm(customer) {
    // Add
    if (!customer) {
        document.getElementById("formTitle").innerHTML = "Add Customer";
        // Reset all input fields
        document.getElementById("customerName").value = "";
        document.getElementById("contactNumber").value = "";
        document.getElementById("emailAddress").value = "";
        document.getElementById("address").value = "";
        document.getElementById("suburb").value = "";
        document.getElementById("city").value = "";
        document.getElementById("postCode").value = "";
        document.getElementById("comments").value = "";
        document.getElementById("addDate").value = "";

        // Radio inputs
        resetRadio("freshAir");
        resetRadio("status");

        // Set submit button to add function
        //document.getElementById("submitCustomerButton").addEventListener('click', addCustomer)

    // Edit
    } else if (customer){
        document.getElementById("formTitle").innerHTML = "Edit Customer";
        //let customer = findCustomer("name", document.getElementById("name").innerHTML);
        //console.log(customer);
        document.getElementById("customerName").value = customer.name;
        document.getElementById("contactNumber").value = customer.contactNumber;
        document.getElementById("emailAddress").value = customer.email;
        document.getElementById("address").value = customer.address;
        document.getElementById("suburb").value = customer.suburb;
        document.getElementById("city").value = customer.city;
        document.getElementById("postCode").value = customer.postCode;
        document.getElementById("comments").value = customer.notes;
        document.getElementById("addDate").value = findCallDate(customer.id);

        checkRadio("freshAir", customer.freshAir);
    } else {
        console.log("Something went wrong...");
    }

    closeCustomerForm();
    document.getElementById("addCustomerForm").style.display = "block";
}
// Dropbox button for call result
function openDropButton() {
    document.getElementById("callResultDropdown").classList.toggle("show");
}

function closeCustomerForm() {
    document.getElementById("customerPopup").style.display = "none";
}

function closeAddCustomerForm() {
    document.getElementById("addCustomerForm").style.display = "none";
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.drop_button')) {
        var dropdowns = document.getElementsByClassName("drop_content");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

// Finds callDate from customer id
function findCallDate(customerID) {
    for (let i = 0; i < callData.length; i++) {
        if (callData[i].customerId == customerID) {
            return callData[i].date;
        }
    }
    return 1;
}

// resets radio items
function resetRadio(name) {
    let e = document.getElementsByName(name);
    for (var i = 0; i < e.length; i++) {
        e[i].checked = false;
    }
}

// Reutrns the value of the radio element that is checked
function findCheckedRadio(name) {
    let e = document.getElementsByName(name);
    for (var i = 0; i < e.length; i++) {
        if (e[i].checked == true) {
            return e[i].value;
        }
    }
}

// Checks a given radio item 
function checkRadio(name, value) {
    let e = document.getElementsByName(name);
    for (var i = 0; i < e.length; i++) {
        if (e[i].value == value) {
            e[i].checked = true;
        }
    }
}
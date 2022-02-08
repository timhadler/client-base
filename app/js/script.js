import {Customer, CallDate} from "./customer.js";
import {openCustomerForm, openAddCustomerForm} from "./forms.js";

// Customer data for proof-of-concept
// Object list for customers and call dates
let customerData = [
    new Customer(1, "Anne Barron", "028 459 2654", "anne@barron.co.nz", "4 Burwood rd", "Burwood", "Christchurch", "8067", "None", "", "callList"),
    new Customer(2, "Frederick Botony", "027 449 3464", "fred@botony.co.nz", "6 Wincroft rd", "Riccarton", "Christchurch", "8065", "HRV Gen 1", "", "callList"),
    new Customer(3, "Karrie Ferguson", "021 659 9504", "karrie@furg.co.nz", "13 Oxycotin rd", "Burnside", "Christchurch", "8069", "None", "", "callList"),
    new Customer(4, "Toby Mur", "021 184 4627", "toby@mur.co.nz", "8 Kin rd", "Burnsdie", "Christchurch", "8089", "None", "", "toBeConfirmed"),
    new Customer(5, "Nocholous Lous", "021 387 6847", "nic@lous.co.nz", "102 Kindell rd", "Addington", "Christchurch", "8832", "None", "", "toBeConfirmed"),
    new Customer(6, "Charlie Wort", "021 385 2901", "harlie@wort.co.nz", "56 Oxycotin rd", "Burnside", "Christchurch", "8324", "Unknown", "", "toBeConfirmed"),
    new Customer(7, "Harry Burr", "021 938 3456", "harry@burr.co.nz", "56 Boycotte rd", "Fernside", "Christchurch", "8334", "DVS", "", "confirmed"),
    new Customer(8, "Barry Stansfield", "021 485 6852", "barry@stans.co.nz", "56 Boycotte rd", "Fernside", "Christchurch", "8334", "DVS", "", "confirmed"),
    new Customer(9, "Darren Buxley", "021 789 5214", "darren@bux.co.nz", "201 Foils rd", "Redwood", "Christchurch", "8324", "DVS", "Likes to get DVS serviced every 3 years", "confirmed"),
    new Customer(10, "Harold Bertrum", "021 458 2564", "harold@burty.co.nz", "45 Berty rd", "Avonhead", "Christchurch", "8335", "None", "", "confirmed")
];

export let callData = [
    new CallDate(1, 1, "2022-02-02"),
    new CallDate(8, 8, "2022-02-12"),
    new CallDate(3, 3, "2022-03-05"),
    new CallDate(4, 4, "2022-02-07"),
    new CallDate(5, 5, "2022-02-09"),
    new CallDate(10, 10, "2022-02-22"),
    new CallDate(6, 6, "2022-02-11"),
    new CallDate(7, 7, "2022-02-12"),
    new CallDate(9, 9, "2022-02-21"),
    new CallDate(2, 2, "2022-02-04")
];

var customer_global;

// Set event listener for buttons
document.getElementById("addCustomerButton").addEventListener('click', function() { openAddCustomerForm(false); });
document.getElementById("editCustomerButton").addEventListener('click', function() { openEditForm(); });
document.getElementById("submitCustomerButton").addEventListener('click', submitCustomer);
// Dropdown links
document.getElementById("setConfirmedButton").addEventListener('click', function() { setConfirmed(); });
document.getElementById("setToBeConfirmedButton").addEventListener('click', function() { setToBeConfirmed(); });
document.getElementById("setCallBackLaterButton").addEventListener('click', function() { setCallBack(); });
document.getElementById("setDeclinedButton").addEventListener('click', function() { setCallBack(); });

function openEditForm() {
    customer_global = findCustomer("name", document.getElementById("name").innerHTML);
    openAddCustomerForm(customer_global);
}

function submitCustomer() {
    if(document.getElementById("formTitle").innerHTML == "Edit Customer") {
        editCustomer();
    } else {
        addCustomer();
    }
}

// setting up html lists
setLists();

function setLists() {
    var callList = document.getElementById("callList");
    var toBeConfirmed = document.getElementById("toBeConfirmed");
    var confirmed = document.getElementById("confirmed");

    // Clear HTML lists
    clearList(callList);
    clearList(toBeConfirmed);
    clearList(confirmed);

    // Append all customer names in customerData to the appropriate list, governed by 'action'
    // Set confirmed and toBeConfirmed lists
    for (let i = 0; i < customerData.length; i++) {
        let customer = customerData[i];
        if (customer.action == "toBeConfirmed") {
            addToList(toBeConfirmed, customer);
        } else if (customer.action == "confirmed") {
            addToList(confirmed, customer);
        }
    }

    // Set callBack list sorted by call back date
    // Customers with multiple call back dates will appear in list mutiple times
    let month = "";
    callData.sort((a,b) => (a.date > b.date) ? 1 : -1);
    //console.log(callData);
    for (let i = 0; i < callData.length; i++) {
        let call = callData[i];
        let customer = findCustomer("id", call.customerId);

        // If customer action is call back later, add them to call list
        if (customer.action == "callList") {
            if (call.getMonth() != month) {
                month = call.getMonth();
                addToList(callList, month);
            }
            addToList(callList, customer);
        }
    }
}

// Creates and appends a list item to an HTML list
// if data is a customer, add to the list as a  customer
// if data is a string, add it to the call list as a month divider
function addToList(list, data) {
    let li = document.createElement("li");

    if (data instanceof Customer) {
        li.innerHTML = data.name;
        li.addEventListener('click', function() { openCustomerForm(data); });
    } else {
        li.innerHTML = data;
        li.classList.add("date_divider");
    }
    list.appendChild(li);
}

// Clears all items from a given HTML list
function clearList(list) {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

// Creates a new customer and call date for the customer
function addCustomer() {
    // Put this into function
    let radio1 = document.getElementsByName("freshAir");
    for (let i = 0; i < radio1.length; i++) {
        if (radio1[i].checked) {
            radio1 = radio1[i];
            break;
        }
    }
    let radio2 = document.getElementsByName("status");
    for (let i = 0; i < radio2.length; i++) {
        if (radio2[i].checked) {
            radio2 = radio2[i];
            break;
        }
    }

    var customer = new Customer( customerData.length + 1,
                                 document.getElementById("customerName").value, 
                                 document.getElementById("contactNumber").value,
                                 document.getElementById("emailAddress").value,
                                 document.getElementById("address").value,
                                 document.getElementById("suburb").value, 
                                 document.getElementById("city").value,
                                 document.getElementById("postCode").value,
                                 radio1.value,
                                 document.getElementById("comments").value,
                                 radio2.value
    );
    //console.log(customer);
    customerData.push(customer);

    callData.push(new CallDate(callData.length + 1, customerData.length, document.getElementById("addDate").value));
    //console.log(document.getElementById("addDate").value);
    //console.log(callData);
    setLists();
}

function editCustomer() {
    let customer = customer_global;
    customer.name = document.getElementById("customerName").value;
    customer.contactNumber = document.getElementById("contactNumber").value;
    customer.emailAddress = document.getElementById("emailAddress").value;
    customer.address = document.getElementById("address").value;
    customer.suburb = document.getElementById("suburb").value;
    customer.city = document.getElementById("city").value;
    customer.postCode = document.getElementById("postCode").value;
    customer.notes = document.getElementById("comments").value;
    setLists();
}

// Finds a customer with a given property
function findCustomer(property, value) {
    if (property == "name") {
        for (var i = 0; i < customerData.length; i++) {
            if (customerData[i].name == value) {
                return customerData[i];
            }
        }
    } else if (property == "id") {
        for (var i = 0; i < customerData.length; i++) {
            if (customerData[i].id == value) {
                return customerData[i];
            }
        }
    } else {
        console.log("Invalid property search");
    }
}

function setConfirmed() {
    let name = document.getElementById("name").innerHTML;
    let customer = findCustomer("name", name);

    customer.action = "confirmed";
    setLists();
}

function setToBeConfirmed() {
    let name = document.getElementById("name").innerHTML;
    let customer = findCustomer("name", name);

    customer.action = "toBeConfirmed";
    setLists();
}

function setCallBack() {
    let name = document.getElementById("name").innerHTML;
    let customer = findCustomer("name", name);

    customer.action = "callList";
    setLists();
}

function removeFromList(item, list) {
    const index = list.indexOf(item);
    if (index > -1) {
        list.splice(index, 1);
    }
}
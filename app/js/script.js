// Objects
// Customer
function Customer(id, name, cn, ea, add, sub, ci, pc, fa, n, a) {
    this.id = id;
    this.name = name;
    this.contactNumber = cn;
    this.email = ea;
    this.address = add;
    this.suburb = sub;
    this.city = ci;
    this.postCode = pc;
    this.freshAir = fa;
    this.notes = n;
    this.action = a;
}

// Call date
function CallDate(id, customerId, date) {
    this.id = id;
    this.customerId = customerId;
    this.date = date;
    // Methods for changing date to next year etc
    // Get striong formats, define own date object
}

// Customer data for proof-of-concept
// Object list for customers and call dates
let customerData = [
    new Customer(1, "Anne Barron", "028 459 2654", "anne@barron.co.nz", "4 Burwood rd", "Burwood", "Christchurch", "8067", "None", "", "callList"),
    new Customer(2, "Frederick Botony", "027 449 3464", "fred@botony.co.nz", "6 Wincroft rd", "Riccarton", "Christchurch", "8065", "HRV Gen1", "", "callList"),
    new Customer(3, "Karrie Ferguson", "021 659 9504", "karrie@furg.co.nz", "13 Oxycotin rd", "Burnside", "Christchurch", "8069", "None", "", "callList"),
    new Customer(4, "Toby Mur", "021 184 4627", "toby@mur.co.nz", "8 Kin rd", "Burnsdie", "Christchurch", "8089", "None", "", "toBeConfirmed"),
    new Customer(5, "Nocholous Lous", "021 387 6847", "nic@lous.co.nz", "102 Kindell rd", "Addington", "Christchurch", "8832", "None", "", "toBeConfirmed"),
    new Customer(6, "Charlie Wort", "021 385 2901", "harlie@wort.co.nz", "56 Oxycotin rd", "Burnside", "Christchurch", "8324", "Unknown", "", "toBeConfirmed"),
    new Customer(7, "Harry Burr", "021 938 3456", "harry@burr.co.nz", "56 Boycotte rd", "Fernside", "Christchurch", "8334", "DVS", "", "confirmed"),
    new Customer(8, "Barry Stansfield", "021 485 6852", "barry@stans.co.nz", "56 Boycotte rd", "Fernside", "Christchurch", "8334", "DVS", "", "confirmed"),
    new Customer(9, "Darren Buxley", "021 789 5214", "darren@bux.co.nz", "201 Foils rd", "Redwood", "Christchurch", "8324", "DVS", "Likes to get DVS serviced every 3 years", "confirmed"),
    new Customer(10, "Harold Bertrum", "021 458 2564", "harold@burty.co.nz", "45 Berty rd", "Avonhead", "Christchurch", "8335", "None", "", "confirmed")
];

let callData = [
    new CallDate(1, 1, new Date("2022-02-02")),
    new CallDate(8, 8, new Date("2022-02-12")),
    new CallDate(3, 3, new Date("2022-03-05")),
    new CallDate(4, 4, new Date("2022-02-07")),
    new CallDate(5, 5, new Date("2022-02-09")),
    new CallDate(10, 10, new Date("2022-02-22")),
    new CallDate(6, 6, new Date("2022-02-11")),
    new CallDate(7, 7, new Date("2022-02-12")),
    new CallDate(9, 9, new Date("2022-02-21")),
    new CallDate(2, 2, new Date("2022-02-04"))
];

// setting up html lists
setLists();

function setLists() {
    var callList = document.getElementById("callList");
    var toBeConfirmed = document.getElementById("toBeConfirmed");
    var confirmed = document.getElementById("confirmed");

    // Clear HTML and js lists
    // instead of reforming list everytime search list childs for specific customers to delete and add
    clearList(callList);
    clearList(toBeConfirmed);
    clearList(confirmed);

    // Append all customer names in customerData to the appropriate list, governed by 'action'
    // Set confirmed and toBeConfirmed lists
    for (let i = 0; i < customerData.length; i++) {
        let customer = customerData[i];
        if (customer.action == "toBeConfirmed") {
            addCustomerToList(toBeConfirmed, customer);
        } else if (customer.action == "confirmed") {
            addCustomerToList(confirmed, customer);
        }
    }

    // Set callBack list sorted by call back date
    // Customers with multiple call back dates will appear in list mutiple times
    let month = "";
    callData.sort((a,b) => (a.date > b.date) ? 1 : -1);
    for (let i = 0; i < callData.length; i++) {
        let call = callData[i];
        let customer = findCustomer("id", call.customerId);

        // If customer action is call back later, add them to call list
        if (customer.action == "callList") {
            if (getMonthText(call.date.getMonth()) != month) {
                month = getMonthText(call.date.getMonth());
                addCustomerToList(callList, call.date);
            }
            addCustomerToList(callList, customer);
        }
    }
}

// creates and appends an item to an HTML list
function addCustomerToList(list, data) {
    let li = document.createElement("li");

    if (data instanceof Date) {
        li.innerHTML = getMonthText(data.getMonth()) + " 20" + getYearText(data.getYear());
        li.classList.add("date_divider");
    } else {
        li.innerHTML = data.name;
        li.addEventListener('click', function() { openCustomerForm(data); });
    }
    list.appendChild(li);
}

// Clears all itmes from a given HTML list
function clearList(list) {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
}

// Find the month from date.getMonth
// date.getMonth starts indexing at 0
function getMonthText(i) {
    var month;
    switch (i) {
        case 0:
            month = "January";
            break;
        case 1:
            month = "February";
            break;
        case 2:
            month = "March";
            break;
        case 3:
            month = "April";
            break;
        case 4:
            month = "May";
            break;
        case 5:
            month = "June";
            break;
        case 6:
            month = "July";
            break;
        case 7:
            month = "August";
            break;
        case 8:
            month = "Septemeber";
            break;
        case 9:
            month = "October";
            break;
        case 10:
            month = "November";
            break;
        case 11:
            month = "December";
            break;
    }
    return month;
}

// Get the str year from date.getYear()
// Years >= 2000 are represented add 100 eg 2022 > 122
function getYearText(i) {
    return i - 100;
}

// Customer popup form
function openCustomerForm(customer) {
    document.getElementById("name").innerHTML = customer.name;
    document.getElementById("cn").innerHTML = customer.contactNumber;
    document.getElementById("ea").innerHTML = customer.email;
    document.getElementById("add").innerHTML = customer.address;
    document.getElementById("sub").innerHTML = customer.suburb;
    document.getElementById("ci").innerHTML = customer.city;
    document.getElementById("pc").innerHTML = customer.postCode;
    document.getElementById("fa").innerHTML = customer.freshAir;
    document.getElementById("n").innerHTML = customer.notes;
    //document.getElementById("cbDate").value = findCallDate(customer.id);
    document.getElementById("customerPopup").style.display = "block";
    console.log(findCallDate(customer.id));
}

function addCustomerForm() {
    document.getElementById("addCustomerForm").style.display = "block";
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
    let e = document.getElementsByName("freshAir");
    for (var i = 0; i < e.length; i++) {
        e[i].checked = false;
    }
    e = document.getElementsByName("status");
    for (var i = 0; i < e.length; i++) {
        e[i].checked = false;
    }
}

function closeCustomerForm() {
    document.getElementById("customerPopup").style.display = "none";
}

function closeAddForm() {
    document.getElementById("addCustomerForm").style.display = "none";
}

// Creates a new customer and call date for the customer
function addCustomer() {
    let radio = document.getElementsByName("freshAir");
    for (let i = 0; i < radio.length; i++) {
        if (radio[i].checked) {
            radio = radio[i];
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
                                 radio.value,
                                 document.getElementById("comments").value,
                                 "callList"
    );
    //console.log(customer);
    customerData.push(customer);

    callData.push(new CallDate(callData.length + 1, customerData.length, new Date(document.getElementById("addDate").value)));
    //console.log(document.getElementById("addDate").value);
    //console.log(callData);
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

// Finds callDate from customer id
function findCallDate(customerID) {
    for (let i = 0; i < callData.length; i++) {
        if (callData[i].customerId == customerID) {
            let date = callData[i].date;
            let str = date.getYear() + " " + date.getMonth() + " " + date.getDay();
            return str;
        }
    }
    return 1;
}

// Dropbox button for call result
function openDropButton() {
    document.getElementById("callResultDropdown").classList.toggle("show");
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
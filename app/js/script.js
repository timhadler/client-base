let  data1= ["Anne Barron", "Frederick Botony", "Karrie Ferguson"];
let  data2= ["Toby Mur", "Nocholous Lous", "Charlie Wort"];
let  data3= ["Harry Burr", "Barry Stansfield", "Darren Buxley", "Harold Bertrum"];

// Objects
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

function CallDate(id, customerId, date) {
    this.id = id;
    this.customerId = customerId;
    this.date = date;
}

let customerData = [
    new Customer(1, "Anne Barron", "028 459 2654", "anne@barron.co.nz", "4 Burwood rd", "Burwood", "Christchurch", "8067", "None", "", "callList"),
    new Customer(2, "Frederick Botony", "027 449 3464", "fred@botony.co.nz", "6 Wincroft rd", "Riccarton", "Christchurch", "8065", "HRV Gen1", "", "callList"),
    new Customer(3, "Karrie Ferguson", "021 659 9504", "karrie@furg.co.nz", "13 Oxycotin rd", "Burnside", "Christchurch", "8069", "None", "", "callList"),
    new Customer(4, "Toby Mur", "021 184 4627", "toby@mur.co.nz", "8 Kin rd", "Burnsdie", "Christchurch", "8089", "None", "", "toBeconfirmed"),
    new Customer(5, "Nocholous Lous", "021 387 6847", "nic@lous.co.nz", "102 Kindell rd", "Addington", "Christchurch", "8832", "None", "", "toBeconfirmed"),
    new Customer(6, "Charlie Wort", "021 385 2901", "harlie@wort.co.nz", "56 Oxycotin rd", "Burnside", "Christchurch", "8324", "Unknown", "", "toBeconfirmed"),
    new Customer(7, "Harry Burr", "021 938 3456", "harry@burr.co.nz", "56 Boycotte rd", "Fernside", "Christchurch", "8334", "DVS", "", "confirmed"),
    new Customer(8, "Barry Stansfield", "021 485 6852", "barry@stans.co.nz", "56 Boycotte rd", "Fernside", "Christchurch", "8334", "DVS", "", "confirmed"),
    new Customer(9, "Darren Buxley", "021 789 5214", "darren@bux.co.nz", "201 Foils rd", "Redwood", "Christchurch", "8324", "DVS", "Likes to get DVS serviced every 3 years", "confirmed"),
    new Customer(10, "Harold Bertrum", "021 458 2564", "harold@burty.co.nz", "45 Berty rd", "Avonhead", "Christchurch", "8335", "None", "", "confirmed")
];

let callData = [
    new CallDate(1, 1, "2022-02-02"),
    new CallDate(1, 2, "2022-02-04"),
    new CallDate(1, 3, "2022-02-05"),
    new CallDate(1, 4, "2022-02-07"),
    new CallDate(1, 5, "2022-02-09"),
    new CallDate(1, 6, "2022-02-11"),
    new CallDate(1, 7, "2022-02-012"),
    new CallDate(1, 8, "2022-02-12"),
    new CallDate(1, 9, "2022-02-21"),
    new CallDate(1, 10, "2022-02-22")
]

let callList = document.getElementById("callList");
let toBeConfirmed = document.getElementById("toBeConfirmed");
let confirmed = document.getElementById("confirmed");

setList(callList, data1);
setList(toBeConfirmed, data2);
setList(confirmed, data3);

function setList(list, data) {
    while(list.firstChild) {
        list.removeChild(list.firstChild);
    }
    data.forEach((item) => {
        let li = document.createElement("li");
        li.innerText = item;
        //li.setAttribute("onClick", "openCustomerForm()")
        li.addEventListener('click', function() { openCustomerForm(item); });
        list.appendChild(li);
    });
}

function openCustomerForm(name) {
    let customerDetails = findCustomer(name);
    document.getElementById("name").innerHTML = customerDetails.name;
    document.getElementById("cn").innerHTML = customerDetails.contactNumber;
    document.getElementById("ea").innerHTML = customerDetails.email;
    document.getElementById("add").innerHTML = customerDetails.address;
    document.getElementById("sub").innerHTML = customerDetails.suburb;
    document.getElementById("ci").innerHTML = customerDetails.city;
    document.getElementById("pc").innerHTML = customerDetails.postCode;
    document.getElementById("fa").innerHTML = customerDetails.freshAir;
    document.getElementById("n").innerHTML = customerDetails.notes;
    document.getElementById("customerPopup").style.display = "block";
}

function closeCustomerForm() {
    document.getElementById("customerPopup").style.display = "none";
}

function findCustomer(name) {
    for (var i=0; i < customerData.length; i++) {
        if (customerData[i].name == name) {
            return customerData[i];
        }
    }
}

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
    removeFromList(name, data1);
    removeFromList(name, data2);
    removeFromList(name, data3);

    data3.push(name);

    setList(callList, data1);
    setList(toBeConfirmed, data2);
    setList(confirmed, data3);
}

function setToBeConfirmed() {
    let name = document.getElementById("name").innerHTML;
    removeFromList(name, data1);
    removeFromList(name, data2);
    removeFromList(name, data3);

    data2.push(name);

    setList(callList, data1);
    setList(toBeConfirmed, data2);
    setList(confirmed, data3);
}

function setCallBack() {
    let name = document.getElementById("name").innerHTML;
    removeFromList(name, data1);
    removeFromList(name, data2);
    removeFromList(name, data3);

    data1.push(name);

    setList(callList, data1);
    setList(toBeConfirmed, data2);
    setList(confirmed, data3);
}

function removeFromList(item, list) {
    const index = list.indexOf(item);
    if (index > -1) {
        list.splice(index, 1);
    }
}
let  data1= ["Anne Barron", "Frederick Botony", "Karrie Ferguson"];
let  data2= ["Toby Mur", "Nocholous Lous", "Charlie Wort"];
let  data3= ["Harry Burr", "Barry Stansfield", "Darren Buxley", "Harold Bertrum"];

function Customer(id, name, cn, ea, add, sub, ci, pc, fa, n, a) {
    id = id;
    name = name;
    contactNumber = cn;
    email = ea;
    address = add;
    suburb = sub;
    city = ci;
    postCode = pc;
    freshAir = fa;
    notes = n;
    action = a;
}

let customerData = [
    ["Anne Barron", "028 459 2654", "anne@barron.co.nz", "4 Burwood rd", "Burwood", "Christchurch", "8067", "None", "", "callList"],
    ["Frederick Botony", "027 449 3464", "fred@botony.co.nz", "6 Wincroft rd", "Riccarton", "Christchurch", "8065", "HRV Gen1", "", "callList"],
    ["Karrie Ferguson", "021 659 9504", "karrie@furg.co.nz", "13 Oxycotin rd", "Burnside", "Christchurch", "8069", "None", "", "callList"],
    ["Toby Mur", "021 184 4627", "toby@mur.co.nz", "8 Kin rd", "Burnsdie", "Christchurch", "8089", "None", "", "toBeconfirmed"],
    ["Nocholous Lous", "021 387 6847", "nic@lous.co.nz", "102 Kindell rd", "Addington", "Christchurch", "8832", "None", "", "toBeconfirmed"],
    ["Charlie Wort", "021 385 2901", "harlie@wort.co.nz", "56 Oxycotin rd", "Burnside", "Christchurch", "8324", "Unknown", "", "toBeconfirmed"],
    ["Harry Burr", "021 938 3456", "harry@burr.co.nz", "56 Boycotte rd", "Fernside", "Christchurch", "8334", "DVS", "", "confirmed"],
    ["Barry Stansfield", "021 485 6852", "barry@stans.co.nz", "56 Boycotte rd", "Fernside", "Christchurch", "8334", "DVS", "", "confirmed"],
    ["Darren Buxley", "021 789 5214", "darren@bux.co.nz", "201 Foils rd", "Redwood", "Christchurch", "8324", "DVS", "Likes to get DVS serviced every 3 years", "confirmed"],
    ["Harold Bertrum", "021 458 2564", "harold@burty.co.nz", "45 Berty rd", "Avonhead", "Christchurch", "8335", "None", "", "confirmed"]
];

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
    document.getElementById("name").innerHTML = name;
    document.getElementById("cn").innerHTML = customerDetails[1];
    document.getElementById("ea").innerHTML = customerDetails[2];
    document.getElementById("add").innerHTML = customerDetails[3];
    document.getElementById("sub").innerHTML = customerDetails[4];
    document.getElementById("ci").innerHTML = customerDetails[5];
    document.getElementById("pc").innerHTML = customerDetails[6];
    document.getElementById("fa").innerHTML = customerDetails[7];
    document.getElementById("n").innerHTML = customerDetails[8];
    document.getElementById("customerPopup").style.display = "block";
}

function closeCustomerForm() {
    document.getElementById("customerPopup").style.display = "none";
}

function findCustomer(name) {
    for (var i=0; i < customerData.length; i++) {
        if (customerData[i][0] == name) {
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
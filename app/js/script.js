let  data1= ["Anne Brron", "Frederick Botony", "Karrie Ferguson"];
let  data2= ["Toby Mur", "Nocholous Lous", "Charlie Wort"];
let  data3= ["Harry Burr", "Barry Stansfield", "Darren Buxley", "Harold Bertrum"];

let callList = document.getElementById("callList");
let toBeConfirmed = document.getElementById("toBeConfirmed");
let confirmed = document.getElementById("confirmed");

setList(callList, data1);
setList(toBeConfirmed, data2);
setList(confirmed, data3);

function setList(list, data) {
    data.forEach((item) => {
        let li = document.createElement("li");
        li.innerText = item;
        li.setAttribute("onClick", "test()")
        list.appendChild(li);
    });
}

function test() {
    console.log("works");
    console.log(callList);
}

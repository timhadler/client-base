// client popups
const clientButs = document.getElementsByName("clientCallButton");
for (let i = 0; i< clientButs.length; i++) {
    clientButs[i].addEventListener('click', function() { clientPopup(clientButs[i].id); });
};

const clientCloseButs = document.getElementsByName("clientPopupClose");
for (let i = 0; i< clientCloseButs.length; i++) {
    clientCloseButs[i].addEventListener('click', function() { clientPopupClose(clientCloseButs[i].id); });
};

const statusBoxes = document.getElementsByName("clientStatus");
for (let i = 0; i< statusBoxes.length; i++) {
    if (statusBoxes[i].classList.contains("revealCallDate")) {
        statusBoxes[i].addEventListener('change', function(event) { incrementYear(event, statusBoxes[i].id)});
    }
};

// Prevent TBC list scroll bar resetting to 0 when the page is reloaded
// Call list
window.addEventListener('DOMContentLoaded', function() { cList.scrollTop = sessionStorage.getItem('lastScrollPos') })
const cList = document.getElementById("cList");
cList.addEventListener('scroll', function() { sessionStorage.setItem('lastScrollPos', cList.scrollTop) });

// TBC list
window.addEventListener('DOMContentLoaded', function() { tbcList.scrollTop = sessionStorage.getItem('lastScrollPos') })
const tbcList = document.getElementById("tbcList");
tbcList.addEventListener('scroll', function() { sessionStorage.setItem('lastScrollPos', tbcList.scrollTop) });

// Submit month input form when month is selcted
document.getElementById("monthInputCL").addEventListener('change', function() { document.getElementById("datesForm").submit(); } )

// Functions
function clientPopup(i) {
    const popup = document.getElementById("clientPopup-" + i);

    popup.style.display = "grid";
    //popup.style.width = popup.parentNode.parentElement.clientWidth.toString() + "px";
}

function clientPopupClose(i) {
    document.getElementById("clientPopup-" + i).style.display = "none";
}

function incrementYear(e, s) {
    //console.log(s);
    //console.log("datebox-" + s.substring(s.indexOf('-') + 1));
    if (e.currentTarget.checked) {
        let date =  document.getElementById("datebox-" + s.substring(s.indexOf('-') + 1));
        const newYear = parseInt(date.dataset.defaultdate.slice(0, 4)) + 1;
        const newDate = newYear.toString() + date.dataset.defaultdate.slice(4);

        date.value = newDate;
    }
}
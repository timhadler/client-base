// Client popups
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

// Checkboxes
document.getElementById("CLCheckbox").addEventListener('change', function() { checkAll(this) });
document.getElementById("TBCCheckbox").addEventListener('change', function() { checkAll(this) });

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

/***********************************************************
 * Functions
 ***********************************************************/
function clientPopup(i) {
    const popup = document.getElementById("clientPopup-" + i);

    popup.style.display = "grid";
    //popup.style.width = popup.parentNode.parentElement.clientWidth.toString() + "px";
}

function clientPopupClose(i) {
    document.getElementById("clientPopup-" + i).style.display = "none";
}

function checkAll(cb) {
    var clients = document.getElementsByName("selectedClients");
    var list;
    var checkStatus;

    // Find which parent checkbox has been checked
    if (cb.id == "CLCheckbox") { list = "cList" }
    else if (cb.id = "TBCCheckbox") { list = "tbcList" }

    // Has it been checked or unchecked?
    if (cb.checked) {
        checkStatus = true;
    } else {
        checkStatus = false;
    }

    // Check or uncheck the appropriate checkboxes
    for (let i = 0; i < clients.length; i++) {
        if (isChildOf(clients[i], list)) {
            clients[i].checked = checkStatus;
        }
    }
}

function incrementYear(e, s) {
    if (e.currentTarget.checked) {
        let date =  document.getElementById("datebox-" + s.substring(s.indexOf('-') + 1));
        const newYear = parseInt(date.dataset.defaultdate.slice(0, 4)) + 1;
        const newDate = newYear.toString() + date.dataset.defaultdate.slice(4);

        date.value = newDate;
    }
}

// Helper, checks if el is a child element of an element with a given id
// Returns true or false if no parent is found with the given id
function isChildOf(el, id) {
    while (el && el.parentElement) {
        el = el.parentElement;
        if (el.id == id) {
            return true;
        }
    }
    return false;
}
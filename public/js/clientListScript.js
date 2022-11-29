// Search bar
document.getElementById("searchBar").addEventListener("keyup", function(event) {
    if (event.code === "Enter") {
        event.preventDefault();
        document.getElementById("searchForm").submit();
    }
})


// Prevent client_list scroll bar resetting to 0 when the page is loaded
window.addEventListener('DOMContentLoaded', function() { cList.scrollTop = sessionStorage.getItem('lastScrollPos') })
const cList = document.getElementById("leftPane");
cList.addEventListener('scroll', function() { sessionStorage.setItem('lastScrollPos', cList.scrollTop) });

// Add client popup
document.getElementById("addClientPopupButton").addEventListener('click', function() { addClientPopup() });
document.getElementById("addClientCloseButton").addEventListener('click', function() { addClientPopupClose() });

function addClientPopup() {
    document.getElementById("addClientPopup").style.visibility = "visible";
}

function addClientPopupClose() {
    document.getElementById("addClientPopup").style.visibility = "hidden";
}
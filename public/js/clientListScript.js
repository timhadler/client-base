// Search bar
document.getElementById("searchBar").addEventListener("keyup", function(event) {
    if (event.code === "Enter") {
        event.preventDefault();
        document.querySelector('form').submit();
    }
})


// Prevent client_list scroll bar resetting to 0 when the page is loaded
window.addEventListener('DOMContentLoaded', function() { cList.scrollTop = sessionStorage.getItem('lastScrollPos') })
const cList = document.getElementById("leftPane");
cList.addEventListener('scroll', function() { sessionStorage.setItem('lastScrollPos', cList.scrollTop) });


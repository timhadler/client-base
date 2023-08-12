var reminderPopupButtonHTML;

const LIMIT = 25;

// Search bar
document.getElementById("searchBar").addEventListener("keyup", function(event) {
    if (event.code === "Enter") {
        event.preventDefault();
        document.getElementById("searchForm").submit();
    }
});

$(document).ready(function() {
    // Load more button
    $('#clientsLoadMore').on('click', function() { loadMore("") });

    // Load inital client list
    loadClientList("");
});

// Prevent client_list scroll bar resetting to 0 when the page is loaded
window.addEventListener('DOMContentLoaded', function() { cList.scrollTop = sessionStorage.getItem('lastScrollPos') })
const cList = document.getElementById("leftPane");
cList.addEventListener('scroll', function() { sessionStorage.setItem('lastScrollPos', cList.scrollTop) });

// Add client popup
document.getElementById("addClientPopupButton").addEventListener('click', function() { addClientPopup() });
document.getElementById("addClientCloseButton").addEventListener('click', function() { addClientPopupClose() });

/***********************************************************
 * Helper Functions
 **********************************************************/
// Loads the left pane client list
function loadClientList(search, offset=0) {
    // Load html files into variables
    $.get("html/reminderPopupButton.html", function(html) {
        reminderPopupButtonHTML = html;
    });

    $.ajax({
        url: "clients/load-client-list",
        method: "GET",
        data: { search:search, limit:LIMIT, offset:offset },
        success: function(res) {
          const data = JSON.parse(res);
          var list = $("#cList");

          if (offset === 0) {
            list.empty(); // Clear the list only for the initial load
          }

          for (let i = 0; i < data.length; i++) {
            let client = data[i];
            let id = client.id;
            var li = $('<li>').attr('id', "client-" + id).addClass("positionRelative");
            var $button = $(reminderPopupButtonHTML);
        
            // Button
            $button.find(".nameButton").text(client.name).on('click', function() { console.log(client.name) });

            li.html($button);
            list.append(li);
          }
        },
        error: function(xhr, status, error) {
          // Handle AJAX error
          console.log('AJAX Error while fetching client list:', error, xhr, status);
        }
    });
}

// Load another batch of clients for the client list
function loadMore(s) {
    let list = $('#cList');
    let offset = list.find('li').length;
    loadClientList(s, offset);
}  

function addClientPopup() {
    document.getElementById("addClientPopup").style.display = "block";
    document.getElementById("overlay").style.visibility = "visible";
}

function addClientPopupClose() {
    document.getElementById("addClientPopup").style.display = "none";
    document.getElementById("overlay").style.visibility = "hidden";
}
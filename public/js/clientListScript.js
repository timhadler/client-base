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
    // Tab buttons event listeners
    $('#cdSummaryTab').on('click', function(evt) { openTab(evt, "summary") });
    $('#cdApptTab').on('click', function(evt) { openTab(evt, "appts") });
    $('#cdReminderTab').on('click', function(evt) { openTab(evt, "reminders") });

    // Load more button
    $('#clientsLoadMore').on('click', function() { loadMore("") });

    // Get the client ID from URL parameters which is set by reminder popup client details link
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId');
    if(clientId) {
        loadClientDetails(parseInt(clientId));
    }

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
          const clients = data.clientList;
          const n = data.nClients;

          var list = $("#cList");
          $("#nClients").html("(" + n + ")");

          if (offset === 0) {
            list.empty(); // Clear the list only for the initial load
          }

          for (let i = 0; i < clients.length; i++) {
            let client = clients[i];
            let id = client.id;
            var li = $('<li>').addClass("positionRelative");
            var $button = $(reminderPopupButtonHTML);
        
            // Button
            $button.find(".nameButton").text(client.name).on('click', function() { loadClientDetails(id) });

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

// Loads the client details of a given id after being clicked on in client list
function loadClientDetails(id) {
    $.ajax({
        url: "clients/load-client-data",
        method: "GET",
        data: { id:id },
        success: function(res) {
            const data = JSON.parse(res);

            // Display details div
            $(".clientDetailsDiv").css("display", "block");

            // Fill details data
            $("#cdName").html(data.name);
            $("#cdCompany").html(data.company);
            $("#cdTelephone").html(data.home);
            $("#cdMobile").html(data.mobile);
            $("#cdEmail").html(data.email);
            $("#cdCreated").html(data.created);
            $("#cdStreet").html(data.street);
            $("#cdSuburb").html(data.suburb);
            $("#cdCity").html(data.city);
            $("#cdPostcode").html(data.postcode); 

            // Open summary tabs on load
            $('#cdSummaryDiv').css('display', 'block');
            $('#cdSummaryTab').addClass('active');
        },
        error: function(xhr, status, error) {
            // Handle AJAX error
            console.log('AJAX Error while fetching client list:', error, xhr, status);
        }
    });
}

// Open details tab
function openTab(evt, tabName) {
    // Hide tab contents nd remove active class
    $('.tabContent').hide();
    $('.tabLink').removeClass('active');

    // display the appropriate tab content
    if (tabName == "summary") {
        $("#cdSummaryDiv").show();
    } else if (tabName =="appts") {
        $("#cdApptsDiv").show();
    }
    else if (tabName =="reminders") {
        $("#cdRemindersDiv").show();
    }
  
    // Mark the tab link as active
    evt.currentTarget.classList.add('active');
}

function addClientPopup() {
    document.getElementById("addClientPopup").style.display = "block";
    document.getElementById("overlay").style.visibility = "visible";
}

function addClientPopupClose() {
    document.getElementById("addClientPopup").style.display = "none";
    document.getElementById("overlay").style.visibility = "hidden";
}
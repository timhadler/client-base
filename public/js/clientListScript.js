var reminderPopupButtonHTML;

const LIMIT = 25;

$(document).ready(function() {
    // Search bar
    $("#searchBar").on("keyup", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            loadClientList($(this).val());
        }
    });

    // Add client button
    $("#addClientPopupButton").on('click', function() { addClientPopup() });
    $("#clientPopupCloseButton").on('click', function() { addClientPopupClose() });

    // Tab buttons event listeners
    $('#cdSummaryTab').on('click', function(evt) { openTab(evt, "summary") });
    $('#cdApptTab').on('click', function(evt) { openTab(evt, "appts") });
    $('#cdReminderTab').on('click', function(evt) { openTab(evt, "reminders") });

    // Load more button
    $('#clientsLoadMore').on('click', function() { loadMore() });

    // Get the client ID from URL parameters which is set by reminder popup client details link
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('clientId');
    if(clientId) {
        loadClientDetails(parseInt(clientId));
    }

    // Load inital client list
    loadClientList("");
});

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

          // If search term is empty, loading client list
          if (search) {
            $("#clientListHeader").html("Search: " + search);
            $('#clientsLoadMore').hide();
            $(".clientDetailsDiv").hide();
          } else {
            $("#clientListHeader").html("Client List");
            $('#clientsLoadMore').show();
          }
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
          // Hide load more button
          if (list.find('li').length == n) {
              $('#clientsLoadMore').hide();
          }
        },
        error: function(xhr, status, error) {
          // Handle AJAX error
          console.log('AJAX Error while fetching client list:', error, xhr, status);
        }
    });
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

/***********************************************************
 * Helper Functions
 **********************************************************/
// Load another batch of clients for the client list
function loadMore() {
    let list = $('#cList');
    let offset = list.find('li').length;
    loadClientList("", offset);
}

function addClientPopup() {
    $("#clientPopup").show();
    $("#overlay").css("visibility", "visible")
}

function addClientPopupClose() {
    $("#clientPopup").hide();
    $("#overlay").css("visibility", "hidden")
}
var reminderPopupButtonHTML;
var noteItemHTML;

const LIMIT = 25;
var SEARCH =  "";

$(document).ready(function() {
    // Load html files into variables
    $.get("html/reminderPopupButton.html", function(html) {
        reminderPopupButtonHTML = html;
    });
    $.get("html/noteItem.html", function(html) {
        noteItemHTML = html;
    });

    // Search bar
    $("#searchBar").on("keyup", function(event) {
        if (event.key === "Enter") {
            const search = $(this).val();
            SEARCH = search;

            event.preventDefault();
            loadClientList(search);
        }
    });

    // Client popup buttons
    $("#addClientPopupButton").on('click', function() { addClientPopup() });
    $("#editClientButton").on('click', function() { editClientPopup() });
    $("#clientPopupCloseButton").on('click', function() { clientPopupClose() });
    $("#clientPopupSubmitButton").on('click', function() { clientPopupSubmit(this) });

    // Delete buttons
    $("#deleteClientButton").on('click', function() { deleteClientPopup() });
    $("#deleteClientSubmitButton").on('click', function() { deleteClientSubmit() });
    $("#deleteClientCloseButton").on('click', function() { deleteClientPopupClose() });

    // Add note button
    $("#cdAddNoteButton").on('click', function() { notePopup() });
    $("#addNoteCloseButton").on('click', function() { notePopupClose() });
    $("#addNoteSubmitButton").on('click', function() { noteSubmit(this) });

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
            const notes = data.notes;

            // Display details div
            $(".clientDetailsDiv").css("display", "block");

            // Set edit/delete client button data value to store id for submitting in edit and delete form
            $("#editClientButton").data("id", id);
            $("#deleteClientButton").data("id", id);
            $("#addNoteSubmitButton").data("id", id);

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

            // Client notes
            var list = $("#cdNotesList");
            list.empty();
            for (let i = 0; i < notes.length; i++) {
                var li = $('<li>').addClass("positionRelative");
                var $noteItem = $(noteItemHTML);
        
                // Button
                $noteItem.find(".note").html(notes[i].note);
                $noteItem.find(".date").html(notes[i].created);
    
                li.html($noteItem);
                list.append(li);
              }

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

function clientPopupSubmit(button) {
    // Get the form data
    var formData = $('#clientPopupForm').serialize();
    const formType = $(button).data("form");
    const id = $("#editClientButton").data("id");
    var url = "";

    // Change url based on formType
    if (formType == "add") {
        url = "clients/add-client";
    } else if (formType == "edit") {
        url = "clients/edit-client";
    }

    $.ajax({
        url: url,
        method: "POST",
        data: { data:formData, id:id },
        success: function(res) {
            clientPopupClose();

            // If edit
            if (formType == "edit") {
                loadClientDetails(id);
            } else if (formType == "add") {
                // Newly created client id, update client list
                loadClientDetails(res.id);
                loadClientList("");
            }
        },
        error: function(xhr, status, error) {
        // Handle AJAX error
        console.log('AJAX Error while submitting client popup form: ' + formType, error, xhr, status);
        }
    });
}

function noteSubmit(button) {
    const formData = $('#addNoteForm').serialize();
    const id = $(button).data("id");

    $.ajax({
        url: "clients/add-note",
        method: "POST",
        data: { data:formData, id:id },
        success: function(res) {
            notePopupClose();
            loadClientDetails(id);
        },
        error: function(xhr, status, error) {
        // Handle AJAX error
        console.log('AJAX Error while deleting client: ', error, xhr, status);
        }
    });
}

function deleteClientSubmit() {
    const id = $("#deleteClientButton").data("id");

    $.ajax({
        url: "clients/delete-client",
        method: "DELETE",
        data: { id:id },
        success: function(res) {
            $(".clientDetailsDiv").hide();
            deleteClientPopupClose();
            loadClientList(SEARCH);
        },
        error: function(xhr, status, error) {
        // Handle AJAX error
        console.log('AJAX Error while deleting client: ', error, xhr, status);
        }
    });
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
    // Clear details data
    $("#clientPopup input").val('');

    // Set header and button text
    $("#clientPopupHeader").html("New Client");
    $("#clientPopupSubmitButton").html("Add Client").data("form", "add");

    $("#clientPopup").show();
    $("#overlay").css("visibility", "visible")
}

function editClientPopup() {
    // Fill details data
    $("#clientPopupHeader").html($("#cdName").html());
    $("#cName").val($("#cdName").html());
    $("#cCompany").val($("#cdCompany").html());
    $("#cTelephone").val($("#cdTelephone").html());
    $("#cMobile").val($("#cdMobile").html());
    $("#cEmail").val($("#cdEmail").html());
    $("#cStreet").val($("#cdStreet").html());
    $("#cSuburb").val($("#cdSuburb").html());
    $("#cCity").val($("#cdCity").html());
    $("#cPc").val($("#cdPostcode").html());

    // Set button text
    $("#clientPopupSubmitButton").html("Submit").data("form", "edit");

    $("#clientPopup").show();
    $("#overlay").css("visibility", "visible")
}

function clientPopupClose() {
    $("#clientPopup").hide();
    $("#overlay").css("visibility", "hidden")
}

function deleteClientPopup() {
    $("#deleteClientPopup").show();
    $("#overlay").css("visibility", "visible")
}

function deleteClientPopupClose() {
    $("#deleteClientPopup").hide();
    $("#overlay").css("visibility", "hidden")
}

function notePopup() {
    $("#addNotePopup").find("textarea[name='note']").val("");
    $("#addNotePopup").show();
    $("#overlay").css("visibility", "visible")
}

function notePopupClose() {
    $("#addNotePopup").hide();
    $("#overlay").css("visibility", "hidden")
}
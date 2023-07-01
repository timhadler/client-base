var reminderPopupButtonHTML;
var reminderPopupHTML;

const LIMIT = 25;

$(document).ready(function() {
  // Open action tabs on load
  $('#actions').css('display', 'flex');
  $('#actionsTabLink').addClass('active');

  // Tab buttons event listeners
  $('#actionsTabLink').on('click', function(evt) { openTab(evt, "actions") });
  $('#awaitingTabLink').on('click', function(evt) { openTab(evt, "awaiting") });
  $('#completedTabLink').on('click', function(evt) { openTab(evt, "completed") });

  // Sellect all Checkboxes
  $('#PCheckbox').on('change', function() { checkAll(this) });
  $('#FUCheckbox').on('change', function() { checkAll(this) });
  $('#ACheckbox').on('change', function() { checkAll(this) });

  // Set status button
  $('#setStatusButton').on('click', function() { setStatusPopup() });
  $('#setStatusCloseButton').on('click', function() { setStatusClose() });

  // Load html files into variables
  $.get("html/reminderPopupButton.html", function(html) {
    reminderPopupButtonHTML = html;
  });
  $.get("html/reminderPopup.html", function(html) {
    reminderPopupHTML = html;
  });

  // Load reminder actions lists
  loadList("pendingList");
  loadList("followUpList");
  $('.load-more').on('click', function() { loadMore(this) });
});

/*****************************************************************
 * Functions
 ****************************************************************/
// AJAX Load a reminder list
function loadList(l, offset=0) {
  $.ajax({
    url: "load-reminder-list",
    method: "GET",
    data: { list:l, limit:LIMIT, offset:offset },
    success: function(res) {
      const data = JSON.parse(res);
      var list = $('#' + l);

      // Reminder count
      let n = 0;
      if (data.length > 0) {
        n = data[0].n;
        if (l == "pendingList") {
          $('#pendingCount').html('(' + n + ')');
        } else if (l == "followUpList") {
          $('#followUpCount').html('(' + n + ')');
        } else if (l == "awaitingList") {
          $('#awaitingCount').html('(' + n + ')');
        }
      }

      if (offset === 0) {
        list.empty(); // Clear the list only for the initial load
      }
      for (var i = 0; i < data.length; i++) {
        let reminder = data[i];
        let rId = reminder.rId;
        var li = $('<li>').attr('id', "reminder-" + rId).addClass("positionRelative");
        var $button = $(reminderPopupButtonHTML);

        // Button
        $button.find(".nameButton").text(reminder.name).on('click', function() { openPopup(reminder) });
        // List item properties
        $button.find('.RProperty .Rproperty-value').html(new Date(data[i].rDate).toLocaleDateString('en-GB'));
        if (data[i].mobile) {
          $button.find('.mobileProperty .Rproperty-value').html(data[i].mobile);
        } else {
          $button.find('.mobileProperty').css('visibility', 'hidden');
        }
        if (reminder.status != "completed") {
          $button.find(".hidden").removeClass("hidden").on('change', function() { revealStatusButton(this) });
        }

        li.html($button);
        list.append(li);
      }
      // Hide load more button
      if (list.find('li').length == n) {
        $('.load-more[data-list="' + l + '"]').hide();
      }
    },
    error: function(xhr, status, error) {
      // Handle AJAX error
      console.log('AJAX Error while fetching ' +  l +  ' reminder list:', error, xhr, status);
    }
  });
}

// Load more data into a list
function loadMore(button) {
  const listId = $(button).data('list');
  let list = $('#' + listId);
  let offset = list.find('li').length;
  loadList(listId, offset)
}

// Open reminder popup
function openPopup(data) {
  var $popup = $(reminderPopupHTML);

  // Close button event listener
  $popup.find('.close-button').on('click', function() { closePopup() });
  // Client details link
  $popup.find('#reminderPopupDetailsLink').attr('href', '/clients/?clientID=' + data.id);

  // Set popup values
  $popup.find('.popupHeader').html(data.name);
  if (data.status == 'awaiting' || data.status == 'followUp') {
    $popup.find('.interactionsDiv').css('display', 'block');
    $popup.find('.callOutcomes').css('display', 'block');
  } else if (data.status == "completed") {                  // Hide actions section in completed list
    $popup.find('.actionsDiv').css('display', 'none');
  } else {
    $popup.find('.revealCallOutcomes').on('change', function() { if (this.checked) { $(this).closest('.actionsDiv').next('.callOutcomes').css('display', 'block'); } });
    $popup.find('.hideCallOutcomes').on('change', function() { if (this.checked) { $popup.find('.callOutcomes').css('display', 'none'); } });
  }
  // Submit form
  $popup.find("#reminderPopupSubmitButton").on('click', function() { reminderSubmit(data.rId) })

  // Fetch note and interaction data
  $.ajax({
    url: "load-popup-data",
    method: "GET",
    data: { clientId:data.id, reminderId:data.rId },
    success: function(res) {
      const data = JSON.parse(res);
      const notes = data.notes;
      const interactions = data.interactions;

      // Notes
      if (notes.length == 0) {
        // Hide notes section
        $('#popupNotesDiv').hide();
      }
      for (var i = 0; i < notes.length; i++) {
        let li = $('<li>').html(notes[i].note)
        $('#reminderPopupNotes').append(li);
      }

      // Interactions
      for (var i = 0; i < interactions.length; i++) {
        let li = $('<li>').html(interactions[i].interaction);
        $('#reminderPopupInteractions').append(li);
      }
    },
    error: function(xhr, status, error) {
      // Handle AJAX error
      console.log('AJAX Error while opening popup:', error, xhr, status);
    }
  });

  $('#reminder-' + data.rId).append($popup);
  $('#overlay').css('visibility', 'visible');
}

function closePopup() {
  $('.clientPopup').remove();
  $('#overlay').css('visibility', 'hidden');
}

// Submit the reminder popup form
function reminderSubmit(rId) {
  // Get the form data
  var formData = $('#reminderPopupForm').serialize();

  $.ajax({
    url: "/set-reminder-status",
    method: "POST",
    data: { data:formData, id:rId },
    success: function(res) {
      reloadActiveLists();
      closePopup();
    },
    error: function(xhr, status, error) {
      // Handle AJAX error
      console.log('AJAX Error while POSTING reminder form:', error, xhr, status);
    }
  });
}

// Reloads the current tabs lists
function reloadActiveLists() {
  var tabId = $(".remindersTabLink.active").attr('id');
  
  if (tabId.includes("action")) {
    loadList("pendingList");
    loadList("followUpList");
  } else if (tabId.includes("awaiting")) {
    loadList("awaitingList");
  } else if (tabId.includes("completed")) {
    loadList("completedList");
  }
}

// Open list tab
function openTab(evt, tabName) {
    // Get all tab content elements and hide them
    const tabContent = document.getElementsByClassName('tabContent');
    for (let i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = 'none';
    }
  
    // Get all tab links and remove the 'active' class
    const tabLinks = document.getElementsByClassName('remindersTabLink');
    for (let i = 0; i < tabLinks.length; i++) {
      tabLinks[i].classList.remove('active');
    }

    // Load the appropriate lists
    if (tabName == "awaiting") {
      loadList("awaitingList");
    } else if (tabName =="completed") {
      loadList("completedList");
    } else if (tabName == "actions") {
      loadList("pendingList");
      loadList("followUpList");
    }
  
    // Show the selected tab content and mark the tab link as active
    document.getElementById(tabName).style.display = "flex";
    evt.currentTarget.classList.add('active');
}

// Reveals set multi status button if any checkboxes are selected
function revealStatusButton(cb) {
  if (cb.checked) {
    document.getElementById("setStatusDiv").style.display = 'block';
  } else {
    document.getElementById("setStatusDiv").style.display = 'none';
  }
}

// Set status popup
function setStatusPopup() {
  document.getElementById("setStatusPopup").style.visibility = "visible";
  overlay.style.visibility = "visible";
}

function setStatusClose() {
  document.getElementById("setStatusPopup").style.visibility = "hidden";
  overlay.style.visibility = "hidden";
}

// Checks all list items associated with a select all checkbox
function checkAll(cb) {
  var clients = document.getElementsByName("selectedClients");
  var list;
  var checkStatus;

  // Find which parent checkbox has been checked
  if (cb.id == "PCheckbox") { list = "pendingList" }
  else if (cb.id = "FUCheckbox") { list = "followUpList" }
  else if (cb.id = "ACheckbox") { list = "awaitingList" }

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
  revealStatusButton(cb);
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
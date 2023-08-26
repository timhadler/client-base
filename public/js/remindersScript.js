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

  // Set status button and nextReminderFields
  $('#setStatusButton').on('click', function() { setStatusPopup() });
  $('#reminderSetStautusMultiForm').find($('button[type="button"]')).on('click', function() { multiStatusSubmit() });
  $('#setStatusCloseButton').on('click', function() { setStatusClose() });

  $('#setStatusPopup').find('.revealNextReminder').on('change', function() { if (this.checked) { $('#setStatusPopup').find('.rNextReminder').css('display', 'block'); } });
  $('#setStatusPopup').find('.hideNextReminder').on('change', function() { if (this.checked) { $('#setStatusPopup').find('.rNextReminder').css('display', 'none'); } });

  // List filter buttons
  $('#pendingFilterButton').on('click', function() { filterPopup("pending") });
  $('#followUpFilterButton').on('click', function() { filterPopup("followUp") });
  $('#awaitingFilterButton').on('click', function() { filterPopup("awaiting") });
  $('#filterPopupClose-followUp').on('click', function() { filterPopupClose("followUp") });
  $('#filterPopupClose-pending').on('click', function() { filterPopupClose("pending") });
  $('#filterPopupClose-awaiting').on('click', function() { filterPopupClose("awaiting") });
  $('#filterButton-pending').on('click', function() { filterSubmit('pending') });
  $('#filterButton-followUp').on('click', function() { filterSubmit('followUp') });
  $('#filterButton-awaiting').on('click', function() { filterSubmit('awaiting') });
  $('.rDateRangeFilter').on('change', function() { dateRangeFilter(this) });

  // Load html files into variables
  $.get("html/reminderPopupButton.html", function(html) {
    reminderPopupButtonHTML = html;
  });
  $.get("html/reminderPopup.html", function(html) {
    reminderPopupHTML = html;
  });

  // Load reminder actions lists
  queryListData("pendingList");
  queryListData("followUpList");
  $('.load-more').on('click', function() { loadMore(this) });
});

/*****************************************************************
 * AJAX Functions
 ****************************************************************/
// AJAX Load a reminder list
function queryListData(l, offset=0) {
  $.ajax({
    url: "load-reminder-list",
    method: "GET",
    data: { list:l, limit:LIMIT, offset:offset },
    success: function(res) {
      const data = JSON.parse(res);
      loadList(l, data, offset);
    },
    error: function(xhr, status, error) {
      // Handle AJAX error
      console.log('AJAX Error while fetching ' +  l +  ' reminder list:', error, xhr, status);
    }
  });
}

// Open reminder popup
function openPopup(data) {
  var $popup = $(reminderPopupHTML);

  // Close button event listener
  $popup.find('.close-button').on('click', function() { closePopup() });
  // Client details link
  $popup.find('#reminderPopupDetailsLink').attr('href', '/clients?clientId=' + data.id);

  // Set popup values
  $popup.find('.popupHeader').html(data.name);
  if (data.status == 'awaiting' || data.status == 'followUp' || data.status == 'noResponse') {
    $popup.find('.interactionsDiv').css('display', 'block');
    $popup.find('.callOutcomes').css('display', 'block');

  } else if (data.status == "completed") {                  // Hide actions section in completed list
    $popup.find('.actionsDiv').css('display', 'none');

  } else if (data.status == "pending") {
    $popup.find('.revealCallOutcomes').on('change', function() { if (this.checked) { $(this).closest('.actionsDiv').next('.callOutcomes').css('display', 'block'); } });
    $popup.find('.hideCallOutcomes').on('change', function() { if (this.checked) { $popup.find('.callOutcomes').css('display', 'none'); } });
  }

  if (data.status != "completed") {
    $popup.find('.revealNextReminder').on('change', function() { if (this.checked) { $popup.find('.rNextReminder').css('display', 'block'); } });
    $popup.find('.hideNextReminder').on('change', function() { if (this.checked) { $popup.find('.rNextReminder').css('display', 'none'); } });
    
    let date = new Date(data.rDate).toLocaleDateString('en-GB');
    let y = parseInt(date.slice(6)) + 1;
    date = y + "-" + date.slice(3, 5) + "-" + date.slice(0, 2);
    $popup.find('#rNewReminderInput').val(date);
  }

  // Submit form
  $popup.find("#reminderPopupSubmitButton").on('click', function() { reminderSubmit(data.id, data.rId) })

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
        let li = $('<li>').addClass("flex flex-jc-sb rPopupLI");
        li.append($("<span>").css("word-wrap", "break-word").css("width", "70%").html(notes[i].note));
        li.append($("<span>").addClass("italic").html(new Date(notes[i].created).toLocaleDateString('en-GB')));
        $('#reminderPopupNotes').append(li);
      }

      // Interactions
      for (var i = 0; i < interactions.length; i++) {
        let li = $('<li>').addClass("flex flex-jc-sb rPopupLI");
        li.append($("<span>").html(interactions[i].interaction));
        li.append($("<span>").addClass("italic").html(new Date(interactions[i].created).toLocaleDateString('en-GB')));
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

// Submit the reminder popup form
function reminderSubmit(id, rId) {
  // Get the form data
  var formData = $('#reminderPopupForm').serialize();

  $.ajax({
    url: "/set-reminder-status",
    method: "POST",
    data: { data:formData, id:id, rId:rId },
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

// Submit the set multi status form
function multiStatusSubmit() {
  var formData = $('#reminderSetStautusMultiForm').serialize();
  const selectedClients = $('input[type="checkbox"][name="selectedClients"]:checked');
  const values = selectedClients.map(function() {
    return $(this).val();
  }).get();

  const ids = selectedClients.map(function() {
    return $(this).data('cId');
  }).get();
  // Uncheck boxes so setStatus button dissappears after submit
  selectedClients.prop('checked', false);

  $.ajax({
    url: "set-reminder-status-multi",
    method: "POST",
    data: {formData:formData, reminders:values, ids:ids},
    traditional: true,
    success: function(res) {
      setStatusClose();
      reloadActiveLists();
      revealStatusButton();
    }
    , error: function(xhr, status, error) {
      console.log('AJAX Error while POSTING reminder form in multi submit:', error, xhr, status);
    }
  });
}

// AJAX Submit filter 
function filterSubmit(list) {
  var formData = $('#filterForm-' + list).serialize();

  $.ajax({
    url: "/filter",
    method: "GET",
    data: { data:formData, list:list, limit:LIMIT, offset:0},
    success: function(res) {
      const data = JSON.parse(res);
      loadList(list + "List", data);
    },
    error: function(xhr, status, error) {
      // Handle AJAX error
      console.log('AJAX Error while submitting filter form:', error, xhr, status);
    }
  });
  filterPopupClose(list);
}

/*****************************************************************
 * Functions
 ****************************************************************/
// Loads data into html list
function loadList(l, data, offset=0) {
  var list = $('#' + l);
  // Reminder count
  let n = 0;
  if (data.length > 0) {
    n = data[0].n;
  }
  if (l == "pendingList") {
    $('#pendingCount').html('(' + n + ')');
  } else if (l == "followUpList") {
    $('#followUpCount').html('(' + n + ')');
  } else if (l == "awaitingList") {
    $('#awaitingCount').html('(' + n + ')');
  }

  if (offset === 0) {
    list.empty(); // Clear the list only for the initial load
  }
  for (var i = 0; i < data.length; i++) {
    let reminder = data[i];
    let rId = reminder.rId;
    let id = reminder.id;
    var li = $('<li>').attr('id', "reminder-" + rId).addClass("positionRelative");
    var $button = $(reminderPopupButtonHTML);

    // Button
    $button.find(".nameButton").text(reminder.name).on('click', function() { openPopup(reminder) });
    // List item properties
    if (l == "pendingList") {
      $button.find('.rProperty2 .Rproperty-name').html("Reminder: ");
      $button.find('.rProperty2 .Rproperty-value').html(new Date(reminder.rDate).toLocaleDateString('en-GB'));
      if (reminder.mobile) {
        $button.find('.rProperty1 .Rproperty-name').html("Mobile: ");
        $button.find('.rProperty1 .Rproperty-value').html(reminder.mobile);
      } 
    } else if (l == "followUpList") {
      if (reminder.status == "followUp") {
        $button.find('.rProperty2 .Rproperty-name').html("Requires follow up: ");
        $button.find('.rProperty2 .Rproperty-value').html(new Date(reminder.rDate).toLocaleDateString('en-GB'));
      } else {
        $button.find('.rProperty2 .Rproperty-value').html("No Answer");
      }
    } else if (l == "awaitingList") {
      $button.find('.rProperty2 .Rproperty-name').html("Last interaction: ");
      $button.find('.rProperty2 .Rproperty-value').html(new Date(reminder.latest_created).toLocaleDateString('en-GB'));
    } else if (l == "completedList") {
      $button.find('.rProperty2 .Rproperty-name').html(reminder.outcome);
    }
    // Show the reminder checkbox in all lists but completed
    if (reminder.status != "completed") {
      $button.find(".hidden").removeClass("hidden").attr('value', rId).data('cId', id).on('change', function() { revealStatusButton() });
    }

    li.html($button);
    list.append(li);
  }
  // Hide load more button
  if (list.find('li').length == n) {
    $('.load-more[data-list="' + l + '"]').hide();
  }
}

// Reloads the current tabs lists
function reloadActiveLists() {
  var tabId = $(".tabLink.active").attr('id');

  if (tabId.includes("action")) {
    queryListData("pendingList");
    queryListData("followUpList");
  } else if (tabId.includes("awaiting")) {
    queryListData("awaitingList");
  } else if (tabId.includes("completed")) {
    queryListData("completedList");
  }
}

// Open list tab
function openTab(evt, tabName) {
    // Hide tab contents nd remove active class
    $('.tabContent').hide();
    $('.tabLink').removeClass('active');

    // Load the appropriate lists
    if (tabName == "awaiting") {
      queryListData("awaitingList");
    } else if (tabName =="completed") {
      queryListData("completedList");
    } else if (tabName == "actions") {
      queryListData("pendingList");
      queryListData("followUpList");
    }
  
    // Show the selected tab content and mark the tab link as active
    $('#' + tabName).css('display', 'flex');
    evt.currentTarget.classList.add('active');
}

// Reveals set multi status popup button if any checkboxes are selected
function revealStatusButton() {
  const selected = $('input[type="checkbox"][name="selectedClients"]:checked');

  if (selected.length > 0) {
    $('#setStatusDiv').show();
  } else {
    $('#setStatusDiv').hide();
  }
}

// Set status popup
function setStatusPopup() {
  $('#setStatusPopup').css('display', 'block');
  $('#overlay').css('visibility', 'visible');
}

function setStatusClose() {
  $('#setStatusPopup').css('display', 'none');
  $('#overlay').css('visibility', 'hidden');
}

// Close reminder popup
function closePopup() {
  $('.popup-reminder').remove();
  $('#overlay').css('visibility', 'hidden');
}

// Filter popup
function filterPopup(list) {
  $('#filterPopup-' + list).show();
  $('#overlay').css('visibility', 'visible');
}

function filterPopupClose(list) {
  $('#filterPopup-' + list).hide();
  $('#overlay').css('visibility', 'hidden');
}

// Filter date range, displays the appropriate input for the selection box
function dateRangeFilter(filter) {
  const option = $(filter).val();
  
  if (option == "month") {
    $(filter).siblings('.rMonthInput').show();
    $(filter).siblings('.rCustomInput').hide();
  } else if (option == "custom") {
    $(filter).siblings('.rMonthInput').hide();
    $(filter).siblings('.rCustomInput').show();
  } else if (option == "all") {
    $(filter).siblings('.rMonthInput').hide();
    $(filter).siblings('.rCustomInput').hide();
  }
}

// Load more data into a list
function loadMore(button) {
  const listId = $(button).data('list');
  let list = $('#' + listId);
  let offset = list.find('li').length;
  queryListData(listId, offset)
}

// Checks all list items associated with a select all checkbox
function checkAll(cb) {
  var clients = $('input[type="checkbox"][name="selectedClients"]');
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
  revealStatusButton();
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
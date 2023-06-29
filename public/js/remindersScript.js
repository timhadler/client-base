var reminderPopupButtonHTML;
var reminderPopupHTML;

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

  // Reminder list popup buttons
  $('button[name="clientCallButton"]').on('click', function() { reminderPopup(this.id) });
  $('span[name="clientPopupClose"]').on('click', function() { reminderPopupClose(this.id) });

  // Load html files into variables
  $.get("html/reminderPopupButton.html", function(html) {
    reminderPopupButtonHTML = html;
  });
  $.get("html/reminderPopup.html", function(html) {
    reminderPopupHTML = html;
  });

  // Load reminder lists
  loadAllLists();
});

/*****************************************************************
 * Functions
 ****************************************************************/
// Load all reminder lists
function loadAllLists() {
  loadList("pendingList");
  loadList("followUpList");
  loadList("awaitingList");
  loadList("completedList");
};

// AJAX Load a reminder list
function loadList(l) {
  $.ajax({
    url: "load-reminder-list",
    method: "GET",
    data: { list:l },
    success: function(res) {
      const data = JSON.parse(res);
      var list = $('#' + l);

      list.empty(); // Clear the existing list items
      for (var i = 0; i < data.length; i++) {
        var li = $('<li>').addClass("positionRelative");
        var $button = $(reminderPopupButtonHTML);
        var $popup = $(reminderPopupHTML);

        // Button
        $button.find(".nameButton").text(data[i].name).data('id', data[i].rId).on('click', function() { reminderPopup($(this).data('id')) });
        if (data[i].status != "completed") {
          $button.find(".hidden").attr('id', 'cb-' + data[i].rId);
          $button.find(".hidden").removeClass("hidden").on('change', function() { revealStatusButton(this) });
        }
        // Popup
        $popup.attr('id', 'clientPopup-' + data[i].rId);
        $popup.find('.close-button').data('id', data[i].rId).on('click', function() { reminderPopupClose($(this).data('id')) });
        // Set values
        $popup.find('.popupHeader').html(data[i].name);
        if (data[i].status == 'awaiting' || data[i].status == 'followUp') {
          $popup.find('.interactionsDiv').css('display', 'block');
          $popup.find('.callOutcomes').css('display', 'block');
        } else if (data[i].status == "completed") {                  // Hide actions section in completed list
          $popup.find('.actionsDiv').css('display', 'none');
        } else {
          //$popup.find('.revealCallOutcomes').on('change', function() { if (this.checked) { $(this).closest('.actionsDiv').next('.callOutcomes').css('display', 'block'); } });
        }

        li.html($button);
        li.append($popup);
        //var button = $('<button>').text('Open Popup').data('popupId', i);
        list.append(li);
      }
    },
    error: function(xhr, status, error) {
      // Handle AJAX error
      console.log('AJAX Error while fetching ' +  l +  ' reminder list:', error);
    }
  });
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
  
    // Show the selected tab content and mark the tab link as active
    document.getElementById(tabName).style.display = "flex";
    evt.currentTarget.classList.add('active');
}

// Reminder popup
function reminderPopup(i) {
  //const popup = document.getElementById("clientPopup-" + i);
  $('#' + 'clientPopup-' + i).css('display', 'grid')
  //popup.style.display = "grid";
  document.getElementById("overlay").style.visibility = "visible";
}

function reminderPopupClose(i) {
  $('#' + 'clientPopup-' + i).css('display', 'none');
  //document.getElementById("clientPopup-" + i).style.display = "none";
  document.getElementById("overlay").style.visibility = "hidden";
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
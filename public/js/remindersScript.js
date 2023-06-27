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

  // Client button checkboxes
  $('input[name="selectedClients"]').change(revealStatusButton);  // Selects all inputs wuth name selectedClients

  // Set status button
  $('#setStatusButton').on('click', function() { setStatusPopup() });
  $('#setStatusCloseButton').on('click', function() { setStatusClose() });

  // Reminder list popup buttons
  $('button[name="clientCallButton"]').on('click', function() { reminderPopup(this.id) });
  $('span[name="clientPopupClose"]').on('click', function() { reminderPopupClose(this.id) });
});

/*****************************************************************
 * Functions
 ****************************************************************/
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
  const popup = document.getElementById("clientPopup-" + i);

  popup.style.display = "grid";
  document.getElementById("overlay").style.visibility = "visible";
  //popup.style.width = popup.parentNode.parentElement.clientWidth.toString() + "px";
}

function reminderPopupClose(i) {
  document.getElementById("clientPopup-" + i).style.display = "none";
  document.getElementById("overlay").style.visibility = "hidden";
}

// Reveals set multi status button if any checkboxes are selected
function revealStatusButton() {
  const checkboxes = document.getElementsByName("selectedClients");
  let anyChecked = false;

  checkboxes.forEach(function(checkbox) {
    if (checkbox.checked) {
      anyChecked = true;
    }
  });

  if (anyChecked) {
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
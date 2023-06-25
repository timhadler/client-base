// Tab buttons event listeners
document.getElementById("actionsTabLink").addEventListener('click', (event) => { openTab(event, "actions") });
document.getElementById("awaitingTabLink").addEventListener('click', (event) => { openTab(event, "awaiting") });
document.getElementById("completedTabLink").addEventListener('click', (event) => { openTab(event, "completed") });

// Open action tabs on load
document.getElementById('actions').style.display = 'flex';
document.getElementById('actionsTabLink').classList.add('active');

// Sellect all Checkboxes
document.getElementById("CLCheckbox").addEventListener('change', function() { checkAll(this) });
document.getElementById("TBCCheckbox").addEventListener('change', function() { checkAll(this) });

// Client button checkboxes
const checkboxes = document.getElementsByName("selectedClients");
checkboxes.forEach(function(checkbox) {
  checkbox.addEventListener('change', revealStatusButton);
});

// Set status button
document.getElementById("setStatusButton").addEventListener('click', function() { setStatusPopup() });
document.getElementById("setStatusCloseButton").addEventListener('click', function() { setStatusClose() });

// Reminder popup list buttons
const clientButs = document.getElementsByName("clientCallButton");
for (let i = 0; i< clientButs.length; i++) {
    clientButs[i].addEventListener('click', function() { reminderPopup(clientButs[i].id); });
};

const clientCloseButs = document.getElementsByName("clientPopupClose");
for (let i = 0; i< clientCloseButs.length; i++) {
    clientCloseButs[i].addEventListener('click', function() { reminderPopupClose(clientCloseButs[i].id); });
};

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
      console.log("jd")
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
  if (cb.id == "CLCheckbox") { list = "cList" }
  else if (cb.id = "TBCCheckbox") { list = "tbcList" }

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
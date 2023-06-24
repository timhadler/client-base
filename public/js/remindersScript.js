// Tab buttons event listeners
document.getElementById("actionsTabLink").addEventListener('click', (event) => { openTab(event, "actions") });
document.getElementById("awaitingTabLink").addEventListener('click', (event) => { openTab(event, "awaiting") });
document.getElementById("completedTabLink").addEventListener('click', (event) => { openTab(event, "completed") });

// Open action tabs on load
document.getElementById('actions').style.display = 'flex';
document.getElementById('actionsTabLink').classList.add('active');

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
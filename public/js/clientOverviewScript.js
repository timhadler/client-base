const overlay = document.getElementById("overlay");
const clientOverviewForm = document.getElementById("clientOverviewForm");
const filterForm = document.getElementById("ovFilterPopup");

// Add reminder date buttons
const addReminderSubmitButt = document.getElementById("addReminderSubmit").addEventListener('click', function() { addReminder() });
const addReminderPopupButt = document.getElementById("addReminderButton").addEventListener('click', function() { addReminderPopup() });
const addReminderCloseButt = document.getElementById("addReminderCloseButton").addEventListener('click', function() { addReminderClose() });

// Filter buttons
document.getElementById("filterButton").addEventListener('click', function() { filterPopup() });
document.getElementById("filterCloseButton").addEventListener('click', function() { filterClose() });

// Add reminder
function addReminder() {
    clientOverviewForm.action = "/clientOverview/addReminderDate";
    clientOverviewForm.method = "POST";
    clientOverviewForm.submit();
}

function addReminderPopup() {
    document.getElementById("addReminderPopup").style.visibility = "visible";
    overlay.style.visibility = "visible";
}

function addReminderClose() {
    document.getElementById("addReminderPopup").style.visibility = "hidden";
    overlay.style.visibility = "hidden";
}

// Filter popup
function filterPopup() {
    filterForm.style.visibility = "visible";
    overlay.style.visibility = "visible";
}

function filterClose() {
    filterForm.style.visibility = "hidden";
    overlay.style.visibility = "hidden";
}
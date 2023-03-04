const addReminderSubmitButt = document.getElementById("addReminderSubmit").addEventListener('click', function() { addReminder() });
const addReminderPopupButt = document.getElementById("addReminderButton").addEventListener('click', function() { addReminderPopup() });
const addReminderCloseButt = document.getElementById("addReminderCloseButton").addEventListener('click', function() { addReminderClose() });
const clientOverviewForm = document.getElementById("clientOverviewForm");

function addReminder() {
    clientOverviewForm.action = "/clientOverview/addReminderDate";
    clientOverviewForm.method = "POST";
    clientOverviewForm.submit();
}

function addReminderPopup() {
    document.getElementById("addReminderPopup").style.visibility = "visible";
    document.getElementById("overlay").style.visibility = "visible";
}

function addReminderClose() {
    document.getElementById("addReminderPopup").style.visibility = "hidden";
    document.getElementById("overlay").style.visibility = "hidden";
}
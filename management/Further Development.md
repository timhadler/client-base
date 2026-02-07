# Further Development

## Short Term

* \[x] Add 'reminderCount' filter to reminders page
* \[x] Limit reminders and interaction lists for all pages
* \[x] Re-work DB tables to track appointment attempts for data analytics

  * Add appointment attempt table
  * Merge interactions table into reminders table
  * Update model code

* \[ ] Automatically delete pending reminders after an attempt is resolved by replying to a text/email
* \[ ] Automatically set un-resoloved apoointment attempts status to 'stale' after a set time period
* \[x] Add 'respondedAt' date to interactions for non-imediate outcomes
* \[ ] Reminders page: add 'outcome' to completed reminders list
* \[ ] Client details page: add reminder req could respond with new reminder data to update the list without re-querying

## Long Term (not currently planned)

* \[ ] Add create reminder feature to the reminders page

  * Search feature within model to select client

* \[ ] Record note for each interaction
* \[ ] Prevent authenticated users from visiting login page
* \[ ] Implement forgot password feature
* \[ ] Handle incorrect route requests gracefully
* \[ ] Add user settings to set default reminder periods
* \[ ] Add user profile page

  * Reset email, password

## Possible Optimizations

* \[ ] DB client column 'name' is redundant with 'first\_name' nd 'last\_name'

  * Remove from DB, and add/edit client models
  * Concatenate first and last names in fetch client details models instead of 'name'

* \[ ] 'completeReminder' service can execute sequential db queries as part of a Promise to improve speed
* \[x] DB table interactions is essentially a copy of reminders with status = 'complete' plus method. Can add method to reminders table and delete interactions table

  * Fix this by re-working appointment attempt tracking

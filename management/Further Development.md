# Further Development

## Short Term (before next release)
* \[x] Add extra reminder filters (important, date range: today, this month, specific month, custom date range)
* \[ ] Add option to mark a new reminder as important (completing a reminder and on client details page)
* \[ ] Interaction date: client panel and client details page should render reminder completed/responded date if not null
* \[ ] Change default followup period - user feedback: should be three weeks

## Long Term

* Add create reminder feature to the reminders page

  * Search feature within model to select client

* Record note for each interaction
* Prevent authenticated users from visiting login page
* Implement forgot password feature (login)
* Add user settings/preferences page (custom default reminder periods, reminder notes)
* Add user profile page (reset email, password)
* Reminders page: add 'outcome' to completed reminders list
* Make complete reminder modal smaller - user feedback: have to scroll down to submit everytime
* Automatically delete pending reminders after an attempt is resolved by replying to a text/email
* Automatically set un-resoloved apoointment attempts status to 'stale' after a set time period

## Possible Optimizations

* DB client column 'name' is redundant with 'first\_name' nd 'last\_name'

  * Remove from DB, and add/edit client models
  * Concatenate first and last names in fetch client details models instead of 'name'

* 'completeReminder' service can execute sequential db queries as part of a Promise to improve speed
* Client details page: add reminder route handler could respond with new reminder data to update the FE list without re-querying
* Get list counts for reminders page could be a single sql query to potentially save query time

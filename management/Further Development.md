# Further Development
## Short Term
- [x] Add 'reminderCount' filter to reminders page
- [x] Limit reminders and interaction lists for all pages
- [ ] Re-work DB tables to track appointment attempts for data analytics
  - Add appointment attempt table
  - Merge interactions table into reminders table
  - Update model code
- [ ] Automatically set non-immediate interactions (text, email) to 'no_answer' after a set time period
- [ ] Add 'respondedAt' date to interactions for non-imediate outcomes

## Long Term (not currently planned)
- [ ] Add create reminder feature to the reminders page
  - Search feature within model to select client
- [ ] Record note for each interaction
- [ ] Prevent authenticated users from visiting login page
- [ ] Implement forgot password feature
- [ ] Handle incorrect route requests gracefully
- [ ] Add user settings to set default reminder periods
- [ ] Add user profile page
  - Reset email, password

## Possible Optimizations
- [ ] DB client column 'name' is redundant with 'first_name' nd 'last_name'
  - Remove from DB, and add/edit client models
  - Concatenate first and last names in fetch client details models instead of 'name'
- [ ] DB client columns 'nextFollowup' and 'lastContact' with reminders table. Can just compute these values when fetching client details instead of updating it every time a reminder is edited or client is contacted. 
- [ ] DB interaction column 'outcome' is duplicate of reminders 'outcome'.
  - Fix this by re-working appointment attempt tracking (future development)
- [ ] Optimize routes. Eg. 'clients/:id/reminders' should be 
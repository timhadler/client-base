# Database Migrations

## Overview

This directory contains SQL migration files that handle schema and data migration from v2.0.0 to v3.0.0. The migration was executed on a database used in production, the approach to migrating existing data is detailed below. The migration can be applied to an empty v2.0.0 database. 

## File Naming Convention

`{execution order}_{table}-{column/related-cols}.sql`

## Running Migrations

Migrations are designed to work on an existing v2.0.0 database, both:

* **Empty databases**: Schema is migrated with no data
* **Databases with existing data**: Data is migrated and re-mapped as needed

Execute migrations in numerical order:

```bash
# Add your db credentials to script file

.\run-sql.bat # Windows

bash run-sql.sh # Linux

```

## Migrating from Previous Version

### Single User Migration

The previous version did not filter queries by `user_id`, allowing only one account per database. The migration handles this in `002_users-setup`, by:

1. Migrating the existing user (if any) with preserved username and password hash
2. Assigning a constant `user_id` for data association
3. Linking all existing data to this user upon migration

### Email Format Requirement

**Action Required**: The new app version requires usernames to be in email format.

* If your existing username is already an email: No action needed
* If your existing username is not an email: **Manually update it to email format before attempting login**
* Your password will remain unchanged and functional after migration

### Reminders Table - 'createdAt'
The reminders table in v.2.0.0 did not include a 'createdAt' column and one is added for v3.0.0. The default value for this column for existing data is set to the date of migration as is there no alternative data points to set this to. 

### Legacy Data
The update invloved significant schema changes and a new table 'appointment_attempts' that adds a foregein key constraint to table 'reminders'. To satisfy this constrain an entry must be added to 'appointment_attempts' that links to the existing reminder data. These entries, as well as existing reminder entries, are set to '1' in the new 'is_legacy' column to easily filter these entries when performing data analytics that expects the updated structure. 

### Manual Testing After Migration
* **Reminder Count Mapping** - Verified `reminderCount` values (0/1/2) correctly mapped to old status values (pending/awaiting/followUp)
* **Status & Outcome Values** - Confirmed all distinct status and outcome enum values migrated without data loss
* **Client Names** - Validated `first_name` and `last_name` correctly populated from legacy `name` field
* **User Assignment** - Verified all migrated records assigned to constant userId
* **Important Flag** - Confirmed `important` field correctly mapped from legacy `flag` column
* **Appointment Attempts** - Validated all reminders linked to newly created legacy attempts with `is_legacy` flag set
* **Record Counts** - Confirmed total record counts matched between old and new schema with no orphaned records
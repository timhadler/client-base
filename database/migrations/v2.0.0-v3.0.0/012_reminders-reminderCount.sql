START TRANSACTION;

ALTER TABLE reminders
ADD COLUMN reminderCount SMALLINT(5) UNSIGNED NOT NULL DEFAULT 0;

UPDATE reminders SET reminderCount = 1 WHERE status = 'awaiting';
UPDATE reminders SET reminderCount = 2 WHERE status = 'followUp';

COMMIT;

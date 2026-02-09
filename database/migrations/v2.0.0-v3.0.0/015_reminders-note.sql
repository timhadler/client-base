START TRANSACTION;

ALTER TABLE reminders
ADD COLUMN note VARCHAR(150);

UPDATE reminders SET note = 'Initial reminder' WHERE reminderCount = 0;
UPDATE reminders SET note = 'Follow up' WHERE reminderCount > 1;

COMMIT;

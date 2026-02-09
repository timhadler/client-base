START TRANSACTION;

ALTER TABLE reminders 
ADD COLUMN is_legacy BIT(1) DEFAULT 0;

UPDATE reminders
SET is_legacy = 1;

COMMIT;
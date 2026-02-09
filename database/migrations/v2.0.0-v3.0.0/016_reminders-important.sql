START TRANSACTION;

ALTER TABLE reminders
ADD COLUMN important BIT(1);

UPDATE reminders
SET important = 1 WHERE flag > 0;

ALTER TABLE reminders
DROP flag;

COMMIT;

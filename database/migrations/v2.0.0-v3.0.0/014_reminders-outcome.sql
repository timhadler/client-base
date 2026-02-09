START TRANSACTION;

UPDATE reminders SET outcome = 'followup' WHERE outcome = 'followUp';
UPDATE reminders SET outcome = 'no_answer' WHERE outcome = 'noAns';
UPDATE reminders SET outcome = 'none' WHERE outcome = 'ignored';
UPDATE reminders SET outcome = 'waiting' WHERE outcome IS NULL AND status = 'complete';

ALTER TABLE reminders
MODIFY COLUMN outcome ENUM('booked','followup','no_answer','declined', 'waiting','none');

COMMIT;

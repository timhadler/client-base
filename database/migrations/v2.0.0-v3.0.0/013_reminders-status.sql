START TRANSACTION;

UPDATE reminders
SET status = 'complete'
WHERE status = 'completed';

UPDATE reminders 
SET status = 'pending'
WHERE status = 'awaiting'
OR status = 'followUp';

ALTER TABLE reminders
MODIFY COLUMN status ENUM('pending', 'complete');

COMMIT;

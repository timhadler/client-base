START TRANSACTION;

ALTER TABLE appointment_attempts
ADD COLUMN reminder_id INT(11) UNSIGNED;

INSERT INTO appointment_attempts (reminder_id, client_id, user_id, is_legacy)
SELECT id, client_id, 13, 1
FROM reminders;

COMMIT;
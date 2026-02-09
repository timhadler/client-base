START TRANSACTION;

ALTER TABLE reminders
ADD COLUMN appointment_attempt_id INT(11) UNSIGNED NOT NULL;

UPDATE reminders r
JOIN appointment_attempts a ON a.reminder_id = r.id
SET r.appointment_attempt_id = a.id;

ALTER TABLE reminders
ADD CONSTRAINT fk_reminders_attempt
	FOREIGN KEY (appointment_attempt_id)
	REFERENCES appointment_attempts(id)
	ON DELETE CASCADE
	ON UPDATE NO ACTION;
	
ALTER TABLE appointment_attempts
DROP COLUMN reminder_id;

COMMIT;
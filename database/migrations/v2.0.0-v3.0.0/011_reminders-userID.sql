START TRANSACTION;

ALTER TABLE reminders
ADD COLUMN user_id INT(11) UNSIGNED NOT NULL;

# User id link must be created on this migration. See migration readme. 
UPDATE reminders
SET user_id = 13;

ALTER TABLE reminders
ADD CONSTRAINT fk_reminders_user
  FOREIGN KEY (user_id)
  REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE NO ACTION;

COMMIT;

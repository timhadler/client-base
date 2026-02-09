START TRANSACTION;

ALTER TABLE reminders
ADD COLUMN method ENUM('call','text','email','ignored');

UPDATE reminders r
LEFT JOIN interactions i ON i.reminder_id = r.id
SET r.method = CASE
    WHEN i.interaction LIKE '%call%' THEN 'call'
    WHEN i.interaction LIKE '%text%' THEN 'text'
    WHEN i.interaction LIKE '%email%' THEN 'email'
    WHEN i.interaction LIKE '%ignore%' THEN 'ignored'
    ELSE 'ignored'
END
WHERE status = 'completed';

COMMIT;
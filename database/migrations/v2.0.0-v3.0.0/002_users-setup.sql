START TRANSACTION;

INSERT INTO userstmp (id, email, password_hash)
SELECT 13, u.username, u.password
FROM users u
LIMIT 1;

DROP TABLE users;

ALTER TABLE userstmp
RENAME users;

COMMIT;
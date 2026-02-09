START TRANSACTION;

ALTER TABLE clients
ADD COLUMN addressLine1 VARCHAR(150),
ADD COLUMN addressLine2 VARCHAR(150),
ADD COLUMN state VARCHAR(50),
ADD COLUMN country VARCHAR(50);

UPDATE clients
SET addressLine1 = street, state = suburb;

COMMIT;
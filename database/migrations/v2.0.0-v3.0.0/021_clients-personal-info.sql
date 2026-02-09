START TRANSACTION;

ALTER TABLE clients
ADD COLUMN first_name VARCHAR(100) NOT NULL, 
ADD COLUMN last_name VARCHAR(100), 
ADD COLUMN phone VARCHAR(30), 
ADD COLUMN priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium', 
ADD COLUMN source ENUM('website','referral','social media','advertisement','walk-in','cold outreach','networking event','other'),
ADD COLUMN notes VARCHAR(500),
ADD COLUMN position VARCHAR(50), 
ADD COLUMN status ENUM('active', 'inactive', 'pending') NOT NULL DEFAULT 'active';

UPDATE clients
SET phone = mobile;

COMMIT;

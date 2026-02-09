UPDATE clients
SET 
first_name = SUBSTRING_INDEX(name, ' ', 1),
last_name = CASE 
             WHEN name LIKE '% %' THEN SUBSTRING_INDEX(name, ' ', -1) 
             ELSE NULL 
           END;

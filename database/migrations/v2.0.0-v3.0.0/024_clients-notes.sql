START TRANSACTION;

UPDATE clients c
JOIN (
  SELECT
    	n.client_id,
    	GROUP_CONCAT(
	 		n.note ORDER BY n.created SEPARATOR ' || '
		) AS notes
  FROM notes n
  WHERE n.note IS NOT NULL
  GROUP BY n.client_id
) x ON x.client_id = c.id
SET c.notes = x.notes;

DROP TABLE notes;

COMMIT;
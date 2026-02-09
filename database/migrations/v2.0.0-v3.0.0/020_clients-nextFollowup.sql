START TRANSACTION;

UPDATE clients c
LEFT JOIN (
   SELECT r.client_id, MIN(r.rDate) AS next_date
   FROM reminders r
   WHERE r.status = 'pending'
   GROUP BY r.client_id
) rmin ON c.id = rmin.client_id
SET c.nextFollowup = rmin.next_date;

COMMIT;
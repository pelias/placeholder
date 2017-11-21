SELECT t1.id AS subjectId, t2.id as objectId
FROM lineage AS l1
  JOIN tokens AS t1 ON t1.id = l1.id
  JOIN tokens AS t2 ON t2.id = l1.pid
WHERE t1.token = $subject
AND t2.token LIKE $object
AND t1.lang IN ( t2.lang, 'eng', 'und' )
-- AND t1.tag NOT IN ( 'colloquial' )
-- AND t2.tag NOT IN ( 'colloquial' )
GROUP BY t1.id, t2.id
ORDER BY t1.id ASC, t2.id ASC
LIMIT $limit

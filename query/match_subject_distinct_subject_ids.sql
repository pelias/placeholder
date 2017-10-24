SELECT DISTINCT( t1.id ) AS subjectId
FROM tokens AS t1
WHERE t1.token = $subject
AND t1.tag NOT IN ( 'colloquial' )
ORDER BY t1.id ASC
LIMIT $limit

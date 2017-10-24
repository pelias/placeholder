SELECT DISTINCT( t1.id ) AS subjectId
FROM tokens AS t1
  JOIN fulltext AS f1 ON f1.rowid = t1.rowid
WHERE f1.fulltext MATCH $subject
AND t1.tag NOT IN ( 'colloquial' )
ORDER BY t1.id ASC
LIMIT $limit

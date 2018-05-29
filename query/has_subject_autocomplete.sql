SELECT id
FROM tokens as t1
  JOIN fulltext AS f1 ON f1.rowid = t1.rowid
WHERE f1.fulltext MATCH $subject
-- AND t1.tag NOT IN ( 'colloquial' )
LIMIT 1

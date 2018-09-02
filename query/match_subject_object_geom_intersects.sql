SELECT t1.id AS subjectId, t2.id as objectId
FROM rtree AS r1, rtree AS r2
  JOIN tokens AS t1 ON t1.id = r1.id
  JOIN tokens AS t2 ON t2.id = r2.id
WHERE t1.token = $subject
AND t2.token = $object
AND (
  t1.lang = t2.lang OR
  t1.lang IN ( 'eng', 'und' ) OR
  t2.lang IN ( 'eng', 'und' )
)
-- https://silentmatt.com/rectangle-intersection/
AND (
  r1.maxZ < r2.minZ AND
  r1.minX - $threshold < r2.maxX AND
  r1.maxX + $threshold > r2.minX AND
  r1.minY - $threshold < r2.maxY AND
  r1.maxY + $threshold > r2.minY
)
-- AND t1.tag NOT IN ( 'colloquial' )
-- AND t2.tag NOT IN ( 'colloquial' )
GROUP BY t1.id, t2.id
ORDER BY t1.id ASC, t2.id ASC
LIMIT $limit
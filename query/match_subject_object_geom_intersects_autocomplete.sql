SELECT
  t1.id AS subjectId,
  t2.id as objectId
FROM fulltext f1
  JOIN tokens t1 ON (
    f1.rowid = t1.rowid
    AND f1.fulltext MATCH $subject_quoted
    AND LIKELY(t1.token = $subject)
  )
    JOIN rtree AS r1 ON t1.id = r1.id
      JOIN rtree AS r2 ON (
        r1.maxZ < r2.minZ AND
        (r1.minX - $threshold) < r2.maxX AND
        (r1.maxX + $threshold) > r2.minX AND
        (r1.minY - $threshold) < r2.maxY AND
        (r1.maxY + $threshold) > r2.minY
      )
        JOIN fulltext AS f2 ON f2.fulltext MATCH $object_quoted OR $object_quoted*
          JOIN tokens t2 ON (
            f2.rowid = t2.rowid
            AND r2.id = t2.id
            AND LIKELY(t2.token = $object OR t2.token LIKE ($object || '%'))
            AND (
              t1.lang = t2.lang OR
              t1.lang IN ('eng', 'und') OR
              t2.lang IN ('eng', 'und')
            )
          )
GROUP BY t1.id, t2.id
ORDER BY t1.id ASC, t2.id ASC
LIMIT $limit


-- create virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS rtree USING rtree(
   id,              -- Integer primary key
   minX, maxX,      -- Minimum and maximum X coordinate
   minY, maxY,      -- Minimum and maximum Y coordinate
   minZ, maxZ       -- Minimum and maximum 'rank'
);

-- delete existing values
DELETE FROM rtree;

-- fill rtree
INSERT INTO rtree
SELECT
  id,
  json_extract( json( '[' || json_extract( json, '$.geom.bbox' ) || ']' ), '$[0]' ) AS minX,
  json_extract( json( '[' || json_extract( json, '$.geom.bbox' ) || ']' ), '$[2]' ) AS maxX,
  json_extract( json( '[' || json_extract( json, '$.geom.bbox' ) || ']' ), '$[1]' ) AS minY,
  json_extract( json( '[' || json_extract( json, '$.geom.bbox' ) || ']' ), '$[3]' ) AS maxY,
  json_extract( json, '$.rank.min' ) AS minZ,
  json_extract( json, '$.rank.max' ) AS maxZ
FROM docs;
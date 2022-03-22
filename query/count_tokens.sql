SELECT COUNT(*) AS cnt
FROM fulltext AS ft
WHERE ft.fulltext MATCH $token_quoted

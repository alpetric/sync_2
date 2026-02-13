-- https://www.windmill.dev/docs/getting_started/scripts_quickstart/sql#result-collection
-- result_collection=legacy

SELECT TABLE_SCHEMA, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'PUBLIC';
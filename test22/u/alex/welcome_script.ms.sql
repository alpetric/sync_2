-- This script will create 1000 tables named test_1 to test_1000
-- Each table will have the schema with columns first_name and last_name

-- Loop to create tables
DECLARE @i INT = 1; -- Initialize counter
DECLARE @sql NVARCHAR(MAX); -- Variable to hold dynamic SQL

WHILE @i <= 1000
BEGIN
    -- Construct the SQL statement to create a table
    SET @sql = N'CREATE TABLE test_' + CAST(@i AS NVARCHAR(10)) + ' (
        first_name NVARCHAR(255) NOT NULL, -- first_name column, type NVARCHAR, required
        last_name NVARCHAR(255) NOT NULL  -- last_name column, type NVARCHAR, required
    );';

    -- Execute the SQL statement
    EXEC sp_executesql @sql;

    -- Increment the counter
    SET @i = @i + 1;
END;
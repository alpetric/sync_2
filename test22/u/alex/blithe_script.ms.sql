-- return_last_result
-- to pin the database use '-- database f/your/path'
-- @P1 name1 (varchar) = default arg
-- @P2 name2 (int)
-- @P3 name3 (int)
INSERT INTO demo VALUES (@P1, @P2);
UPDATE demo SET col2 = @P3 WHERE col2 = @P2;

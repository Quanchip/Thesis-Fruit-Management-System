USE db_manach;

-- Step 7: rollback migration (DOWN)
SET @db_name = DATABASE();

SET @drop_unique_user_name = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'users'
      AND index_name = 'uniq_users_user_name'
  ) > 0,
  'ALTER TABLE `users` DROP INDEX `uniq_users_user_name`;',
  'SELECT "skip uniq_users_user_name";'
);
PREPARE stmt FROM @drop_unique_user_name;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_unique_email = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'users'
      AND index_name = 'uniq_users_email'
  ) > 0,
  'ALTER TABLE `users` DROP INDEX `uniq_users_email`;',
  'SELECT "skip uniq_users_email";'
);
PREPARE stmt FROM @drop_unique_email;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @drop_unique_phone = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'users'
      AND index_name = 'uniq_users_phone'
  ) > 0,
  'ALTER TABLE `users` DROP INDEX `uniq_users_phone`;',
  'SELECT "skip uniq_users_phone";'
);
PREPARE stmt FROM @drop_unique_phone;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

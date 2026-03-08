USE db_manach;

DROP TABLE IF EXISTS `email_verification_tokens`;

SET @db_name = DATABASE();

SET @drop_is_email_verified_column = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = @db_name
      AND table_name = 'users'
      AND column_name = 'is_email_verified'
  ) > 0,
  'ALTER TABLE `users` DROP COLUMN `is_email_verified`;',
  'SELECT "skip is_email_verified column";'
);
PREPARE stmt FROM @drop_is_email_verified_column;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

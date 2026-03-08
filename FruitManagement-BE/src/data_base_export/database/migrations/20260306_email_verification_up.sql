USE db_manach;

SET @db_name = DATABASE();

SET @add_is_email_verified_column = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = @db_name
      AND table_name = 'users'
      AND column_name = 'is_email_verified'
  ) = 0,
  'ALTER TABLE `users` ADD COLUMN `is_email_verified` TINYINT(1) NOT NULL DEFAULT 0;',
  'SELECT "skip is_email_verified column";'
);
PREPARE stmt FROM @add_is_email_verified_column;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
  `email_verification_token_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `token_hash` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`email_verification_token_id`),
  UNIQUE KEY `idx_email_verification_tokens_token_hash` (`token_hash`),
  CONSTRAINT `fk_email_verification_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @create_idx_email_verification_tokens_user_id = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'email_verification_tokens'
      AND index_name = 'idx_email_verification_tokens_user_id'
  ) = 0,
  'CREATE INDEX `idx_email_verification_tokens_user_id` ON `email_verification_tokens` (`user_id`);',
  'SELECT "skip idx_email_verification_tokens_user_id";'
);
PREPARE stmt FROM @create_idx_email_verification_tokens_user_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

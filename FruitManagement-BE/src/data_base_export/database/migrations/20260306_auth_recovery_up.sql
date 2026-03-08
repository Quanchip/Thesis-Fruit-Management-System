USE db_manach;

CREATE TABLE IF NOT EXISTS `auth_refresh_tokens` (
  `refresh_token_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `token_hash` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `is_revoked` TINYINT(1) NOT NULL DEFAULT 0,
  `revoked_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`refresh_token_id`),
  UNIQUE KEY `idx_auth_refresh_tokens_token_hash` (`token_hash`),
  CONSTRAINT `fk_auth_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `password_reset_token_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `token_hash` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`password_reset_token_id`),
  UNIQUE KEY `idx_password_reset_tokens_token_hash` (`token_hash`),
  CONSTRAINT `fk_password_reset_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @db_name = DATABASE();

SET @create_idx_auth_refresh_tokens_user_id = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'auth_refresh_tokens'
      AND index_name = 'idx_auth_refresh_tokens_user_id'
  ) = 0,
  'CREATE INDEX `idx_auth_refresh_tokens_user_id` ON `auth_refresh_tokens` (`user_id`);',
  'SELECT "skip idx_auth_refresh_tokens_user_id";'
);
PREPARE stmt FROM @create_idx_auth_refresh_tokens_user_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @create_idx_password_reset_tokens_user_id = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'password_reset_tokens'
      AND index_name = 'idx_password_reset_tokens_user_id'
  ) = 0,
  'CREATE INDEX `idx_password_reset_tokens_user_id` ON `password_reset_tokens` (`user_id`);',
  'SELECT "skip idx_password_reset_tokens_user_id";'
);
PREPARE stmt FROM @create_idx_password_reset_tokens_user_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

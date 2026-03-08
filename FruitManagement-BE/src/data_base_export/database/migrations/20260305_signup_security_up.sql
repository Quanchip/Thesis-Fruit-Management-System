USE db_manach;

-- Step 7: rollout migration (UP)
-- 1) Run duplicate checks first. Each query must return 0 rows before adding unique indexes.
SELECT user_name, COUNT(*) AS total
FROM users
GROUP BY user_name
HAVING COUNT(*) > 1;

SELECT email, COUNT(*) AS total
FROM users
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

SELECT phone, COUNT(*) AS total
FROM users
WHERE phone IS NOT NULL
GROUP BY phone
HAVING COUNT(*) > 1;

-- 2) Add unique indexes only when missing (idempotent).
SET @db_name = DATABASE();

SET @add_unique_user_name = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'users'
      AND index_name = 'uniq_users_user_name'
  ) = 0,
  'ALTER TABLE `users` ADD UNIQUE KEY `uniq_users_user_name` (`user_name`);',
  'SELECT "skip uniq_users_user_name";'
);
PREPARE stmt FROM @add_unique_user_name;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_unique_email = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'users'
      AND index_name = 'uniq_users_email'
  ) = 0,
  'ALTER TABLE `users` ADD UNIQUE KEY `uniq_users_email` (`email`);',
  'SELECT "skip uniq_users_email";'
);
PREPARE stmt FROM @add_unique_email;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_unique_phone = IF(
  (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = @db_name
      AND table_name = 'users'
      AND index_name = 'uniq_users_phone'
  ) = 0,
  'ALTER TABLE `users` ADD UNIQUE KEY `uniq_users_phone` (`phone`);',
  'SELECT "skip uniq_users_phone";'
);
PREPARE stmt FROM @add_unique_phone;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

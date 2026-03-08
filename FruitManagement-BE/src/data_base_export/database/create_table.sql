CREATE DATABASE db_manach;

USE db_manach;

-- Drop tables if they exist
DROP TABLE IF EXISTS `email_verification_tokens`, `password_reset_tokens`, `auth_refresh_tokens`, `suppliers`, `warehouses`, `categories`, `products`, `shelves`, `imports`, `exports`, `roles`, `users`, `orders`, `order_products`, `warehouse_products`, `shelf_products`, `export_products`, `export_shelf`, `export_product`;

-- Create suppliers table - done 
CREATE TABLE `suppliers` (
  `supplier_id` INT NOT NULL AUTO_INCREMENT,
  `supplier_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create warehouses table - done 
CREATE TABLE `warehouses` (
  `warehouse_id` INT NOT NULL AUTO_INCREMENT,
  `quantity` INT DEFAULT NULL,
  PRIMARY KEY (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create categories table - done 
CREATE TABLE `categories` (
  `category_id` INT NOT NULL AUTO_INCREMENT,
  `category_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_img` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_description` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Create products table - done 
CREATE TABLE `products` (
  `product_id` INT NOT NULL AUTO_INCREMENT,
  `product_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` TEXT COLLATE utf8mb4_unicode_ci,
  `selling_price` FLOAT DEFAULT NULL,
  `import_price` FLOAT DEFAULT NULL,
  `product_condition` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `product_img` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` INT DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create shelves table - done 
CREATE TABLE `shelves` (
  `shelf_id` INT NOT NULL AUTO_INCREMENT,
  `quantity` INT DEFAULT NULL,
  `category_id` INT DEFAULT NULL,
  `date_on_shelf` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`shelf_id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create imports table - done 
CREATE TABLE `imports` (
  `import_id` INT NOT NULL AUTO_INCREMENT,
  `warehouse_id` INT DEFAULT NULL,
  `supplier_id` INT DEFAULT NULL,
  `product_id` INT DEFAULT NULL,
  `quantity` FLOAT DEFAULT NULL,
  `import_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`import_id`),
  FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`),
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create exports table
CREATE TABLE `exports` (
  `export_id` INT NOT NULL AUTO_INCREMENT,
  `warehouse_id` INT DEFAULT NULL,
  `export_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `export_quantity` INT DEFAULT NULL,
  PRIMARY KEY (`export_id`),
  FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create roles table
CREATE TABLE `roles` (
  `role_id` INT NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create users table
CREATE TABLE `users` (
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `user_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_password` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` INT DEFAULT NULL,
  `full_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uniq_users_user_name` (`user_name`),
  UNIQUE KEY `uniq_users_email` (`email`),
  UNIQUE KEY `uniq_users_phone` (`phone`),
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create email verification tokens table
CREATE TABLE `email_verification_tokens` (
  `email_verification_token_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `token_hash` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`email_verification_token_id`),
  UNIQUE KEY `idx_email_verification_tokens_token_hash` (`token_hash`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create auth refresh tokens table
CREATE TABLE `auth_refresh_tokens` (
  `refresh_token_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `token_hash` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `is_revoked` TINYINT(1) NOT NULL DEFAULT 0,
  `revoked_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`refresh_token_id`),
  UNIQUE KEY `idx_auth_refresh_tokens_token_hash` (`token_hash`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create password reset tokens table
CREATE TABLE `password_reset_tokens` (
  `password_reset_token_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `token_hash` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`password_reset_token_id`),
  UNIQUE KEY `idx_password_reset_tokens_token_hash` (`token_hash`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create orders table
CREATE TABLE `orders` (
  `order_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT DEFAULT NULL,
  `order_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `total_price` FLOAT DEFAULT NULL,
  `order_quantity` INT DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create order_products table
CREATE TABLE `order_products` (
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `order_product_quantity` FLOAT DEFAULT NULL,
  PRIMARY KEY (`order_id`, `product_id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create warehouse_products table
CREATE TABLE `warehouse_products` (
  `warehouse_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` FLOAT DEFAULT 0,
  PRIMARY KEY (`warehouse_id`, `product_id`),
  FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create shelf_products table
CREATE TABLE `shelf_products` (
  `shelf_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` FLOAT DEFAULT 0,
  PRIMARY KEY (`shelf_id`, `product_id`),
  FOREIGN KEY (`shelf_id`) REFERENCES `shelves` (`shelf_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create export_shelf table
CREATE TABLE `export_shelfs` (
  `export_shelf_id` INT NOT NULL AUTO_INCREMENT,
  `shelf_id` INT DEFAULT NULL,
  `export_id` INT DEFAULT NULL,
  `export_shelf_quantity` FLOAT DEFAULT NULL,
  PRIMARY KEY (`export_shelf_id`),
  FOREIGN KEY (`shelf_id`) REFERENCES `shelves` (`shelf_id`),
  FOREIGN KEY (`export_id`) REFERENCES `exports` (`export_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create export_products table
CREATE TABLE `export_products` (
  `product_id` INT NOT NULL,
  `export_shelf_id` INT NOT NULL,
  `export_product_quantity` INT DEFAULT NULL,
  PRIMARY KEY (`product_id`, `export_shelf_id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`),
  FOREIGN KEY (`export_shelf_id`) REFERENCES `export_shelfs` (`export_shelf_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes to foreign key columns
CREATE INDEX `idx_import_warehouse_id` ON `imports` (`warehouse_id`);
CREATE INDEX `idx_import_product_id` ON `imports` (`product_id`);
CREATE INDEX `idx_import_supplier_id` ON `imports` (`supplier_id`);

CREATE INDEX `idx_export_warehouse_id` ON `exports` (`warehouse_id`);
CREATE INDEX `idx_auth_refresh_tokens_user_id` ON `auth_refresh_tokens` (`user_id`);
CREATE INDEX `idx_password_reset_tokens_user_id` ON `password_reset_tokens` (`user_id`);
CREATE INDEX `idx_email_verification_tokens_user_id` ON `email_verification_tokens` (`user_id`);

CREATE INDEX `idx_order_user_id` ON `orders` (`user_id`);
CREATE INDEX `idx_order_product_id` ON `order_products` (`product_id`);
CREATE INDEX `idx_order_order_id` ON `order_products` (`order_id`);

CREATE INDEX `idx_warehouse_product_id` ON `warehouse_products` (`product_id`);
CREATE INDEX `idx_warehouse_warehouse_id` ON `warehouse_products` (`warehouse_id`);

CREATE INDEX `idx_shelf_product_id` ON `shelf_products` (`product_id`);
CREATE INDEX `idx_shelf_shelf_id` ON `shelf_products` (`shelf_id`);

CREATE INDEX `idx_export_product_id` ON `export_products` (`product_id`);
CREATE INDEX `idx_export_shelf_id` ON `export_products` (`export_shelf_id`);

CREATE DATABASE IF NOT EXISTS food_court_express CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE food_court_express;
CREATE TABLE IF NOT EXISTS menu_items (
 id BIGINT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(150) NOT NULL, description VARCHAR(1000), category VARCHAR(80) NOT NULL,
 price DECIMAL(10,2) NOT NULL, image_url VARCHAR(500), available BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS customer_orders (
 id BIGINT PRIMARY KEY AUTO_INCREMENT, customer_name VARCHAR(150) NOT NULL, customer_email VARCHAR(254) NOT NULL,
 customer_phone VARCHAR(40) NOT NULL, delivery_address VARCHAR(1000) NOT NULL, total DECIMAL(10,2) NOT NULL,
 created_at DATETIME NOT NULL, items_json LONGTEXT NOT NULL
);
INSERT INTO menu_items (name, description, category, price, image_url, available)
SELECT * FROM (SELECT 'Classic Burger','Juicy grilled patty with lettuce, tomato and house sauce','Burgers',149.00,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900',TRUE) AS tmp WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Classic Burger');
INSERT INTO menu_items (name, description, category, price, image_url, available)
SELECT * FROM (SELECT 'Margherita Pizza','Tomato, mozzarella and fresh basil','Pizza',229.00,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900',TRUE) AS tmp WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Margherita Pizza');
INSERT INTO menu_items (name, description, category, price, image_url, available)
SELECT * FROM (SELECT 'Crispy Fries','Golden seasoned potato fries','Sides',89.00,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=900',TRUE) AS tmp WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Crispy Fries');
INSERT INTO menu_items (name, description, category, price, image_url, available)
SELECT * FROM (SELECT 'Cold Coffee','Chilled creamy coffee','Drinks',99.00,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=900',TRUE) AS tmp WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Cold Coffee');
INSERT INTO menu_items (name, description, category, price, image_url, available)
SELECT * FROM (SELECT 'Chocolate Brownie','Warm chocolate brownie','Desserts',119.00,'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=900',TRUE) AS tmp WHERE NOT EXISTS (SELECT 1 FROM menu_items WHERE name='Chocolate Brownie');

CREATE DATABASE bamazon_db;
 
 USE bamazon_db;
 
 CREATE TABLE products (
item_id INTEGER  NOT NULL AUTO_INCREMENT,
product_name VARCHAR(100) NOT NULL,
department_name VARCHAR(50) NOT NULL,
price DECIMAL (9,2) UNSIGNED NOT NULL ,
stock_quantity INTEGER(10),
 primary key(item_id)
 );
 

 ALTER TABLE products
ADD COLUMN  product_sales VARCHAR(15) AFTER stock_quantity;
 
 
 CREATE TABLE departments (
department_id INTEGER  NOT NULL AUTO_INCREMENT,
department_name VARCHAR(50) NOT NULL,
over_head_costs DECIMAL (9,2) UNSIGNED NOT NULL ,
 primary key(department_id)
 );
 
 SELECT * FROM departments;
 INSERT INTO departments(department_name, over_head_costs)
 VALUES ("Jewelry", 5000.00),
 ("Furniture", 6000.00),
 ("China", 4000.00),
 ("Womenswear", 4200.00),
 ("Menswear", 3800.00),
 ("Shoes", 2900.00),
 ("Bedding", 4000.00),
 ("Formalwear", 4000.00),
 ("Accessories", 1900.00);
 
 SELECT * FROM products;
 INSERT INTO products(product_name, department_name, price, stock_quantity)
 VALUES ("Diamond Bracelet","Jewelry",5000.00, 10),
("Armiore", "Furniture",  2300.00, 10),
("Duvet Cover", "Bedding", 189.99, 10),
("Waterford Champane Glasses", "China", 199.99, 17),
("Little Black Dress", "Formalwear", 299.99, 34),
("Jimmy Choo Shoes", "Shoes",  799.99, 51),
("Judith Lieber Clutch", "Accessories", 369.99, 15),
("Thomas Pink Tie", "Accessories", 149.99, 26),
("Leather Belt", "Accessories", 79.99, 48),
("Grey Pinstripe Suit", "Menswear", 899.99, 28),
("Sofa", "Furniture",  2000.00, 3),
("Duvet Cover", "Bedding", 189.99, 10),
("Limoge Place Setting", "China", 189.99, 5),
("Evening Gown", "Formalwear", 699.99, 4),
("Birkenstocks", "Shoes",  799.99, 1),
("Michael Kors Tote", "Accessories", 269.99, 5),
("Hermes Tie", "Accessories", 239.99, 2),
("UnderArmour Socks", "Accessories", 9.99, 4),
("Golf Shirt", "Menswear", 79.99, 2);

DELETE FROM departments
WHERE department_id > 10;

SELECT * FROM departments;
 
 UPDATE products
SET department_name = "Accessories"
WHERE item_id = 8;

SELECT department_name, SUM(product_sales) AS department_sales
FROM products 
GROUP BY department_name;

 SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.department_name, SUM(products.product_sales) as department_sales
FROM	departments  INNER JOIN products ON  products.department_name  = departments.department_name
GROUP BY department_id

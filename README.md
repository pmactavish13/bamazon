Storefront using MySQL, Node.js, npm Inquirer, npm is-natural-number, npm CLI-Table and npm Colors to take orders and track inventory via CLI.

Live demonstration on YouTube:  https://youtu.be/gbEWSo145eI

To use this app:
# Rename this file to ".env" and enter your personal key values on a non-public server to run this application.
# MySQL Connection
MYSQL_HOST = localhost
MYSQL_PORT=3306
MYSQL_USER = 'user'
MYSQL_PASSWORD = 'secret'
MYSQL_DATABASE = bamazon_db


#1: Customer View
1. A MySQL Database called `bamazon`.
2. Table called `products`.
3. The products table has each of the following columns:
    * item_id (unique id for each product)
    * product_name (Name of product)
    * department_name
    * price (cost to customer)
    * stock_quantity (how much of the product is available in stores)
4.  Database populated with around 10 different products.

5.  A Node application called `bamazonCustomer.js`. Running this application will first display all of the items available for sale. Including the ids, names, and prices of products for sale.
6.  Users prompted with two messages.
    * ID of the product they would like to buy.
    * How many units of the product they would like to buy.
7. Once the customer has placed the order, application checks if BAMAZON store has enough of the product to meet the customer's request.
    * If out of stock, and option to choose another item or if not enough the app show how much of the product is in stock and give the 'cusomer' the option to choose another quantity. 
8. However, if the store does have enough of the product, the customer is given the option to keep shopping.  If the order is complete, the app:
    * Updates the SQL database to reflect the remaining quantity and the product_sales for the bamazonManager and bamazonSupervisor.
    * Once the update goes through, the app produces an invoice of all items purchased and a total cost.

#2: Manager View
* A  Node application called `bamazonManager.js`. that:
* Lists a set of menu options:
* View Products for Sale
* View Low Inventory
* Add to Inventory
* Add New Product
* If a manager selects `View Products for Sale`, the app lists every available item: the item IDs, names, prices, and quantities.
* If a manager selects `View Low Inventory`, then app lists all items with an inventory count lower than five.
* If a manager selects `Add to Inventory`, the app displays a prompt that will let the manager "add more" of any item currently in the store.
* If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.

### Challenge #3: Supervisor View
1.  MySQL table called `departments`. 
    Table includes the following columns:
    * department_id
    * department_name
    * over_head_costs 
2. A Node app called `bamazonSupervisor.js`. that lists a set of menu options:
    * View Product Sales by Department
    * Create New Department
3. When a supervisor selects `View Product Sales by Department`, the app displays a summarized table in their terminal/bash window. 
4. The `total_profit` column is calculated my mySQL using the difference between `over_head_costs` and `product_sales`. 
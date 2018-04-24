require("dotenv").config();

var inquirer = require("inquirer");
var Table = require("cli-table");
var colors = require("colors");
var isNumber = require("is-natural-number");
var mysql = require("mysql");

console.log(colors.rainbow("BAMAZON ") + colors.blue("Manager"));

// ************************* CONNECT TO MYSQL *************************
var connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

connection.connect(function (err) {
    if (err) throw err;
    afterConnectionOperation();
});

// ****************************** OPERATIONS ******************************
function afterConnectionOperation() {
    inquirer.prompt([
        {
            name: "chooseTask",
            type: "list",
            message: colors.blue("What would you like to do?\n"),
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit " + colors.rainbow("BAMAZON ") + "Manager"],
            filter: function (val) {
                return val; console.log(val)
            }
        },
    ]).then(function (answer) {
        switch (answer.chooseTask) {
            case "View Products for Sale":
                viewProducts();
                break;

            case "View Low Inventory":
                viewLow();
                break;

            case "Add to Inventory":
                addToInv();
                break;

            case "Add New Product":
                addNewProd();
                break;

            case "Exit " + colors.rainbow("BAMAZON ") + "Manager":
                connection.end();
                break;
        };
    });
};

// ************************* QUERY - ALL PRODUCTS *************************
function viewProducts() {
    connection.query("SELECT * FROM products", function (error, results) {
        if (error) throw error;
        table(results);
        afterConnectionOperation();
    });
};

// ************************* QUERY - LOW INVENTORY *************************
function viewLow() {
    connection.query("SELECT * FROM products WHERE stock_quantity<5", function (error, results) {
        if (error) throw error;
        table(results);
        afterConnectionOperation();
    });
};

// *************** QUERY - ADD QUANTITY TO EXISTING STOCK ******************
function showNewQuantity(itemData) {
    connection.query("SELECT * FROM products WHERE item_id = " + itemData, function (error, results) {
        if (error) throw error;
        table(results);
        addAnotherQuantity();
    });
};

// ********************** QUERY - ADD NEW INVENTORY *************************
function showNewItem(itemData) {
    connection.query("SELECT * FROM products WHERE item_id = " + itemData, function (error, results) {
        if (error) throw error;
        table(results);
        addAnotherNewProd();
    });
};

// *********************** ADD TO EXISTING INVENTORY ***********************
function addToInv() {
    var questionsAddToInv = [
        {
            type: 'input',
            name: 'itemId',
            message: "Enter the Item ID",
            validate: function (value) {
                if (isNumber(parseInt(value)) === true) {
                    return true;
                } else {
                    return colors.red("Please enter a valid item number.");
                };
            },
        },
        {
            type: 'input',
            name: 'quantity',
            message: "Enter the quantity you would like to add to stock",
            validate: function (value) {
                if (isNumber(parseInt(value)) === true) {
                    return true;
                } else {
                    return colors.red("Please enter a valid number.");
                };
            },
        },
    ];
    inquirer.prompt(questionsAddToInv).then(function (answers) {
        connection.query("SELECT * FROM products WHERE ?", { item_id: answers.itemId }, function (error, results) {
            if (error) throw error;
            if (results.length > 0) {
                var newQuantity = parseInt(answers.quantity) + results[0].stock_quantity
                var changeQuantity = "UPDATE products SET stock_quantity =" + newQuantity +
                    " WHERE item_id=" + answers.itemId;
                connection.query(changeQuantity, function (err, results) {
                    if (err) throw err;
                    showNewQuantity(answers.itemId)
                });
            } else {
                console.log(colors.red("That is not a valid Item Id.  Please try again."))
                addToInv();
            }
        });
    });
};

// ******************** ADD MORE TO EXISTING INVENTORY *********************
function addAnotherQuantity() {
    inquirer.prompt([
        {
            name: "addMore",
            type: "confirm",
            message: colors.blue("\nWould you like to add stock to another item?"),
            default: true
        }
    ]).then(function (answer) {
        if (answer.addMore === true) {
            addToInv();
        } else {
            afterConnectionOperation();
        };
    });
};

// **************************** ADD NEW PRODUCT ****************************
// collect new product data
function addNewProd() {
    var questionsAddNewProd = [
        {
            type: 'input',
            name: 'product_name',
            message: "Enter the new product name."
        },
        {
            type: 'input',
            name: 'department_name',
            message: "Enter the department name.",
        },
        {
            type: 'input',
            name: 'price',
            message: "Enter the price of the new item.",
            validate: function (value) {
                var regex = /^[1-9]\d*(?:\.\d{0,2})?$/;
                if (regex.test(value) === true) {
                    return true;
                } else {
                    return colors.red("Please enter a valid item price (00.00).");
                };
            },
        },
        {
            type: 'input',
            name: 'stock_quantity',
            message: "Enter the stock quantity of the new item.",
            validate: function (value) {
                if (isNumber(parseInt(value)) === true) {
                    return true;
                } else {
                    return colors.red("Please enter a valid quantity.");
                };
            },
        }
    ];
    inquirer.prompt(questionsAddNewProd).then(function (answers) {
        var addNewProdAnswers = "'" + answers.product_name + "', '" + answers.department_name + "', '" +
            answers.price + "', '" + answers.stock_quantity + "'";
        var insertProd = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (" + addNewProdAnswers + ")";
        connection.query(insertProd, function (err, results) {
            if (err) throw err;
            showNewItem(results.insertId);
        });
    });
};

// ******************** ADD MORE TO EXISTING INVENTORY *********************
function addAnotherNewProd() {
    inquirer.prompt([
        {
            name: "addMoreProducts",
            type: "confirm",
            message: colors.blue("\nWould you like to add another item?"),
            default: true
        }
    ]).then(function (answer) {
        if (answer.addMoreProducts === true) {
            addNewProd();
        } else {
            afterConnectionOperation();
        };
    });
};

// ********************************* TABLE  *********************************
function table(data) {
    var table = new Table({
        head: ['Item Id#', 'Product Name', 'Department Name', 'Price', 'Stock Quantity'],
        style: {
            head: ['blue'],
            compact: false,
            colAligns: ['center'],
        }
    });
    //loop through each item in the mysql bamazon database and push data into a new row in the table
    for (var i = 0; i < data.length; i++) {
        table.push(
            [data[i].item_id, data[i].product_name, data[i].department_name, ((data[i].price).toFixed(2)), data[i].stock_quantity],
        );
    };
    console.log(table.toString());
}

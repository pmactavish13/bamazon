require("dotenv").config();

var inquirer = require("inquirer");
var Table = require("cli-table");
var colors = require("colors");
var isNumber = require("is-natural-number");
var mysql = require("mysql");

// global order
var customerOrder = [];
var totalPrice = 0;

console.log(colors.blue("\n\nWelcome to ") + colors.rainbow("BAMAZON!  ") + colors.blue("A CLI shopping experience."));

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
    afterConnection();
});

function afterConnection() {
    connection.query("SELECT * FROM products", function (error, body) {
        if (error) throw error;
        table(body);
        wantOrder(body);
    });
};

// ************************* TABLE - ALL PRODUCTS *************************
function table(results) {
    // constructor function for table-cli to create a table with all the products in the database
    var table = new Table({
        head: ['Item Id#', 'Product Name', 'Price'],
        style: {
            head: ['blue'],
            compact: false,
            colAligns: ['center'],
        }
    });
    //loop through each item in the mysql bamazon database and push data into a new row in the table
    for (var i = 0; i < results.length; i++) {
        table.push(
            [(parseInt([i]) + 1), results[i].product_name, ((results[i].price).toFixed(2))]
        );
    };
    console.log(table.toString());
};

// ****************************** WANT TO ORDER ******************************
function wantOrder(wantOrderData) {
    inquirer.prompt([
        {
            name: "wantToOrder",
            type: "confirm",
            message: colors.blue("Would you like to place an order?\n"),
            default: true
        },
    ]).then(function (answer) {
        if (answer.wantToOrder === true) {
            order(wantOrderData);
        } else if (customerOrder.length > 1) {
            invoice(wantOrderData)
        } else {
            connection.end();
        };
    });
};

// ************************* ORDER ITEM # FROM TABLE *************************
function order(data) {
    customerRequest = [];
    inquirer.prompt([
        {
            name: "purchase",
            type: "input",
            message: colors.blue("Please enter the ") + colors.green("Item # ") + colors.blue("of the procuct you wish to purchase?"),
            validate: function (value) {
                if ((isNumber(parseInt(value)) === true) && (parseInt(value) <= data.length)) {
                    return true;
                } else {
                    return colors.red("Please enter a valid item number.");
                };
            },
        },
    ]).then(function (answer) {
        var customerRequest = ((parseInt(answer.purchase)) - 1);
        if (data[customerRequest].stock_quantity === 0) {
            console.log(colors.blue("Sorry, ") + colors.red(data[customerRequest].product_name) + colors.blue(" is currently out of stock."));
            addToOrder(data);
        } else {
            confirmOrder(data, customerRequest);
        };
    });
};

// **************************** CONFIRM ITEM # ****************************
function confirmOrder(confirmData, confirmRequest) {
    inquirer.prompt([
        {
            name: "orderConfirm",
            type: "confirm",
            message: colors.blue("You requested: ") + colors.magenta("Item #: " + (confirmRequest + 1) +
                "\n                 Product Name: " + confirmData[confirmRequest].product_name +
                "\n                 Price: " + (confirmData[confirmRequest].price).toFixed(2)) +
                colors.blue("\nIs this the correct item?\n")
        },
    ]).then(function (answer) {
        if (answer.orderConfirm === true) {
            quantity(confirmData, confirmRequest);
        } else {
            order(confirmData);
        };
    });
};

// ******************************* QUANTITY *******************************
function quantity(quantityData, quantityRequest) {
    inquirer.prompt([
        {
            name: "howMany",
            type: "value",
            message: colors.blue("\nPlease enter the quantity you wish to purchase?"),
            default: 0,
            validate: function (value) {
                if (isNumber(parseInt(value)) === true) {
                    return true;
                } else {
                    return colors.red("\nPlease enter a number.\n");
                };
            },
        },
    ]).then(function (answer) {
        if (answer.howMany <= quantityData[quantityRequest].stock_quantity) {
            var quantitySubtract = (quantityData[quantityRequest].stock_quantity - parseInt(answer.howMany))
            var orderItem = {
                itemIndex: quantityRequest,
                quantity: parseInt(answer.howMany),
                newQuantity: quantitySubtract
            };
            customerOrder.push(orderItem);
            console.log(colors.blue("You ordered: ") + colors.magenta("Item #: " + (quantityRequest + 1) +
                "\n             Product Name: " + quantityData[quantityRequest].product_name +
                "\n             Price per Item: " + ((quantityData[quantityRequest].price).toFixed(2)) +
                "\n             Total Price: " + ((quantityData[quantityRequest].price * parseInt(answer.howMany)).toFixed(2))));
            addToOrder(quantityData)
        } else {
            quantityNot(quantityData, quantityRequest);
        };
    });
};

// ************************* INSUFFICIENT QUANTITY *************************
function quantityNot(quantityNotData, quantityNotRequest) {
    inquirer.prompt([
        {
            name: "buySome",
            type: "confirm",
            message: colors.blue("\n Sorry, we currently have only ") + colors.magenta(quantityNotData[quantityNotRequest].stock_quantity +
                " Product Name: " + quantityNotData[quantityNotRequest].product_name) +
                colors.blue(" in stock. \nWould you like to choose a different quantity?"),
            default: true
        }
    ]).then(function (answer) {
        if (answer.buySome === true) {
            quantity(quantityNotData, quantityNotRequest);
        } else {
            addToOrder(quantityNotData);
        };
    });
};

// ************************* ADD TO ORDER *************************
function addToOrder(addData) {
    inquirer.prompt([
        {
            name: "buyMore",
            type: "confirm",
            message: colors.blue("\nWould you like to order another item?"),
            default: true
        }
    ]).then(function (answer) {
        if (answer.buyMore === true) {
            table(addData);
            order(addData);
        } else if (customerOrder.length < 1) {
            console.log(colors.blue("\nThank you for shoping at ") + colors.rainbow("BAMAZON."));
            closeConnection()
        } else {
            console.log(colors.blue("\nThank you for shoping at ") + colors.rainbow("BAMAZON.") + colors.blue("Your Invoice is listed below."));
            invoice(addData);
        };
    });
};

// *************************** INVOICE ***************************
function invoice(invoiceData) {
    var table = new Table({
        head: ['Item Id#', 'Product Name', 'Price per Item', 'Quantity', 'Total Price'],
        style: {
            head: ['blue'],
            compact: false,
            colAligns: ['center'],
        }
    });
    //loop through each item in the customerOrder array and push data into a new row in the table
    for (var i = 0; i < customerOrder.length; i++) {
        j = customerOrder[i].itemIndex
        totalPrice += (invoiceData[j].price * customerOrder[i].quantity)
        table.push(
            [invoiceData[j].item_id, invoiceData[j].product_name, invoiceData[j].price, customerOrder[i].quantity, ((invoiceData[j].price * customerOrder[i].quantity).toFixed(2))]
        );
    };
    total = (totalPrice).toFixed(2)
    table.push(['', '', '', colors.red('Balance'), colors.red(total)]);
    console.log(table.toString());
    updateDatabase(invoiceData);
}


// *********************** UPDATE DATABASE ***********************
function updateDatabase(updateData) {
    for (var i = 0; i < customerOrder.length; i++) {
        //update quantity
        var itemId = updateData[customerOrder[i].itemIndex].item_id;
        var changeQuantity = "stock_quantity =" + customerOrder[i].newQuantity;
        // update product_sales
        var k = customerOrder[i].itemIndex;
        var prodSales = (updateData[k].price * customerOrder[i].quantity).toFixed(2);
        var changeProdSales = ", product_sales =" + prodSales;
        var queryChange = "UPDATE products SET " + changeQuantity + changeProdSales + " WHERE item_id=" + itemId;
        // update database
        connection.query(queryChange, function (err, result) {
            if (err) throw err;
        });
    };
    closeConnection()
};

// *********************** CLOSE CONNECTION ***********************

function closeConnection () {
    setTimeout( function(){
        connection.end();
      }, 3000 );       
};


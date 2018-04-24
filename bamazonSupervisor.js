require("dotenv").config();

var inquirer = require("inquirer");
var Table = require("cli-table");
var colors = require("colors");
var isNumber = require("is-natural-number");
var mysql = require("mysql");

console.log(colors.rainbow("BAMAZON ") + colors.blue("Supervisor"));

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
            choices: ["View Product Sales by Department", "Create New Department", "Exit " + colors.rainbow("BAMAZON ") + "Supervisor"],
            filter: function (val) {
                return val; console.log(val)
            }
        },
    ]).then(function (answer) {
        switch (answer.chooseTask) {
            case "View Product Sales by Department":
                viewProductSales();
                break;

            case "Create New Department":
                createNewDept();
                break;

            case "Exit " + colors.rainbow("BAMAZON ") + "Supervisor":
                connection.end();
                break;
        };
    });
};

// *************** QUERY - PRODUCT SALES BY DEPARTMENT ****************
function viewProductSales() {
    
    var query = "SELECT departments.department_id, departments.department_name, departments.over_head_costs, products.department_name, SUM(products.product_sales) AS department_sales, SUM(products.product_sales) - departments.over_head_costs as total_profit"
    query += " FROM departments INNER JOIN products ON products.department_name = departments.department_name"
    query += " GROUP BY department_id"
    connection.query(query, function (error, data) {
        if (error) throw error;
        table(data)
    });
};

// **************** TABLE - PRODUCT SALES BY DEPARTMENT ***************
function table(data) {
    var table = new Table({
        head: ['Department Id#', 'Department Name', 'Overhead Costs', 'Department Sales', 'Total Profit'],
        style: {
            head: ['blue'],
            compact: false,
            colAligns: ['center'],
        }
    });
    //loop through each item in the mysql bamazon database and push data into a new row in the table
    for (var i = 0; i < data.length; i++) {
        table.push(
            [data[i].department_id, data[i].department_name, (data[i].over_head_costs).toFixed(2), (data[i].department_sales).toFixed(2), (data[i].total_profit).toFixed(2)],
        );
    };
    console.log(table.toString());
    afterConnectionOperation();
};

// ********************** ADD NEW DEPARTMENT *********************
function createNewDept() {
// collect new department data
    var questionsAddNewDept = [
        {
            type: 'input',
            name: 'department_name',
            message: "Enter the new Department name."
        },
        {
            type: 'input',
            name: 'over_head_costs',
            message: "Enter the Over Head Costs of the new Department.",
            validate: function (value) {
                var regex = /^[1-9]\d*(?:\.\d{0,2})?$/;
                if (regex.test(value) === true) {
                    return true;
                } else {
                    return colors.red("Please enter a valid cost (00.00).");
                };
            },
        },
    ];
    inquirer.prompt(questionsAddNewDept).then(function (answers) {
        var addNewDeptAnswers = "'" + answers.department_name + "', '" + answers.over_head_costs+ "' ";
        var insertDept = "INSERT INTO departments (department_name, over_head_costs) VALUES (" + addNewDeptAnswers + ")";
        connection.query(insertDept, function (err, results) {
            if (err) throw err;
            showNewDept(results.insertId);
        });
    });
};

// ********************************* TABLE  *********************************
function showNewDept(deptData) {
    console.log(deptData)
    connection.query("SELECT * FROM departments WHERE department_id = " + deptData, function (error, results) {
        if (error) throw error;
    
    var table = new Table({
        head: ['Department Id#', 'Department Name', 'Over Head Costs',],
        style: {
            head: ['blue'],
            compact: false,
            colAligns: ['center'],
        }
    });
    for (var i = 0; i < results.length; i++) {
        table.push(
            [results[i].department_id, results[i].department_name, (results[i].over_head_costs).toFixed(2)],
        );
    };
    console.log(table.toString());
    addAnotherNewDept();
});
}

// ******************** ADD MORE TO EXISTING INVENTORY *********************
function addAnotherNewDept() {
    inquirer.prompt([
        {
            name: "addMoreDepartments",
            type: "confirm",
            message: colors.blue("\nWould you like to add another department?"),
            default: true
        }
    ]).then(function (answer) {
        if (answer.addMoreDepartments === true) {
            addNewDept();
        } else {
            afterConnectionOperation();
        };
    });
};
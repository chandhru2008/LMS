"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = void 0;
const typeorm_1 = require("typeorm");
const employee_model_1 = require("../../modules/empolyee/employee-model");
const leave_type_model_1 = require("../../modules/leave-types/leave-type-model");
const leave_request_model_1 = require("../../modules/leave-requests/leave-request-model");
const leave_balance_model_1 = require("../../modules/leave-balances/leave-balance-model");
const dataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    driver: require('mysql2'),
    entities: [employee_model_1.Employee, leave_type_model_1.LeaveType, leave_request_model_1.LeaveRequest, leave_balance_model_1.LeaveBalance],
    ssl: {
        rejectUnauthorized: false, // Aiven requires SSL
    },
});
exports.dataSource = dataSource;

import { DataSource } from "typeorm";
import { Employee } from "../../modules/empolyee/employee-model";
import { LeaveType } from "../../modules/leave-types/leave-type-model";
import { LeaveRequest } from "../../modules/leave-requests/leave-request-model";
import { LeaveBalance } from "../../modules/leave-balances/leave-balance-model";

import * as dotenv from 'dotenv';
import path from "path";
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });


const dataSource = new DataSource({
    type : "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize : true,
    driver: require('mysql2'),
    entities : [Employee, LeaveType, LeaveRequest, LeaveBalance],
      ssl: {
    rejectUnauthorized: false, // Aiven requires SSL
  },
});



export { dataSource };
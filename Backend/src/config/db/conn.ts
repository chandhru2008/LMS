import { DataSource } from "typeorm";
import { Employee } from "../../modules/empolyee/employee-entity";
import { LeaveType } from "../../modules/leave-types/leave-type-model";
import { LeaveRequest } from "../../modules/leave-requests/leave-request-model";
import { LeaveBalance } from "../../modules/leave-balances/leave-balance-model";

import * as dotenv from 'dotenv';
import path from "path";
import { DefaultLeaveEntitlement } from "../../modules/default-leave-entitlement/default-leave-entitlement-entity";
import { LeaveApproval } from "../../modules/leave-approval/leave-approval-model";
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
    entities : [Employee, LeaveType, LeaveRequest, LeaveBalance, DefaultLeaveEntitlement, LeaveApproval],
      ssl: {
    rejectUnauthorized: false, // Aiven requires SSL
  },
});



export { dataSource };
import { DataSource } from "typeorm";
import { Employee } from "../../entity/Employee";
import { LeaveType } from "../../entity/LeaveType";
import { LeaveRequest } from "../../entity/Leave-request";
import { LeaveBalance } from "../../entity/LeaveBalance";


const dataSource = new DataSource({
    type : "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize : true,
    driver: require('mysql2'),
    entities : [Employee, LeaveType, LeaveRequest, LeaveBalance]
});



export { dataSource };
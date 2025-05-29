"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("../../modules/empolyee/employee-entity");
const leave_type_model_1 = require("../../modules/leave-types/leave-type-model");
const leave_request_entity_1 = require("../../modules/leave-requests/leave-request-entity");
const leave_balance_entity_1 = require("../../modules/leave-balances/leave-balance-entity");
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const default_leave_entitlement_entity_1 = require("../../modules/default-leave-entitlement/default-leave-entitlement-entity");
const leave_approval_entity_1 = require("../../modules/leave-approval/leave-approval-entity");
dotenv.config({ path: path_1.default.resolve(__dirname, '../../../../.env') });
const dataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    driver: require('mysql2'),
    entities: [employee_entity_1.Employee, leave_type_model_1.LeaveType, leave_request_entity_1.LeaveRequest, leave_balance_entity_1.LeaveBalance, default_leave_entitlement_entity_1.DefaultLeaveEntitlement, leave_approval_entity_1.LeaveApproval],
    ssl: {
        rejectUnauthorized: false, // Aiven requires SSL
    },
});
exports.dataSource = dataSource;

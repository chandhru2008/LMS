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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
// config/server.ts
const Hapi = __importStar(require("@hapi/hapi"));
const di_container_1 = require("./di-container");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const employee_routes_1 = require("../modules/empolyee/employee-routes");
const leave_type_routes_1 = require("../modules/leave-types/leave-type-routes");
const leave_request_routes_1 = require("../modules/leave-requests/leave-request-routes");
const leave_balance_router_1 = require("../modules/leave-balances/leave-balance-router");
const leave_approval_routes_1 = require("../modules/leave-approval/leave-approval-routes");
const default_leave_entitlement_routes_1 = require("../modules/default-leave-entitlement/default-leave-entitlement-routes");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env') });
function createServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = Hapi.server({
            port: 3001,
            host: '0.0.0.0',
            routes: {
                state: { parse: true },
                cors: {
                    origin: ['http://localhost:3001'],
                    credentials: true,
                },
            },
        });
        // Cookie config
        server.state('userSession', {
            ttl: 24 * 60 * 60 * 1000,
            isSecure: true,
            isSameSite: 'None',
            domain: 'lms-zwod.onrender.com',
            isHttpOnly: true,
            path: '/',
            encoding: 'base64json',
            clearInvalid: true,
            strictHeader: true,
        });
        // Register routes
        const { defaultLeaveEntitlementController, leaveTypeController, leaveRequestController, leaveBalanceController, employeeController, leaveApprovalController, } = (0, di_container_1.initializeDependencies)();
        (0, default_leave_entitlement_routes_1.defaultLeaveEntitlementRoutes)(server, defaultLeaveEntitlementController);
        (0, leave_type_routes_1.leaveTypeRoutes)(server, leaveTypeController);
        (0, leave_request_routes_1.leaveRequestRoutes)(server, leaveRequestController);
        (0, leave_balance_router_1.leaveBalanceRoute)(server, leaveBalanceController);
        (0, employee_routes_1.employeeRoute)(server, employeeController);
        (0, leave_approval_routes_1.leaveApproveRoutes)(server, leaveApprovalController);
        return server;
    });
}

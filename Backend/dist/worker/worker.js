"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
exports.connectRedisWithRetry = connectRedisWithRetry;
const conn_1 = require("../config/db/conn");
const employee_service_1 = require("../modules/empolyee/employee-service");
const leave_balance_service_1 = require("../modules/leave-balances/leave-balance-service");
const default_leave_entitlement_service_1 = require("../modules/default-leave-entitlement/default-leave-entitlement-service");
const redis_1 = require("redis");
const redisUrl = process.env.UPSTASH_REDIS_URL;
if (!redisUrl) {
    throw new Error('❌ Missing UPSTASH_REDIS_URL in environment variables.');
}
exports.redisClient = (0, redis_1.createClient)({
    url: redisUrl,
    socket: {
        connectTimeout: 30000,
        keepAlive: 30000,
        reconnectStrategy: (retries) => {
            if (retries < 5) {
                return 10000;
            }
            return new Error('❌ Redis connection failed after multiple attempts');
        }
    }
});
// Enhanced event listeners
exports.redisClient.on('error', (err) => {
    console.error(`❌ Redis error: ${err.message}`);
});
exports.redisClient.on('ready', () => {
    console.log('✅ Redis client ready');
});
exports.redisClient.on('end', () => {
    console.log('❌ Redis connection ended');
});
exports.redisClient.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});
function connectRedisWithRetry() {
    return __awaiter(this, arguments, void 0, function* (maxRetries = 5, retryDelay = 10000) {
        let attempts = 0;
        while (attempts < maxRetries) {
            attempts++;
            try {
                if (exports.redisClient.isOpen)
                    return;
                console.log(`🔌 Attempting Redis connection (attempt ${attempts}/${maxRetries})`);
                yield exports.redisClient.connect();
                console.log('✅ Redis connected successfully');
                return;
            }
            catch (err) {
                console.error(`❌ Redis connection attempt ${attempts} failed:`, err);
                if (attempts >= maxRetries) {
                    throw new Error(`Failed to connect to Redis after ${maxRetries} attempts`);
                }
                yield new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    });
}
// Health check
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!exports.redisClient.isOpen) {
            yield connectRedisWithRetry(1); // Try once
            return;
        }
        yield exports.redisClient.ping();
    }
    catch (err) {
        console.error('❌ Redis health check failed:', err);
    }
}), 30000);
// Graceful shutdown
const shutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('🛑 Shutting down gracefully...');
    try {
        if (exports.redisClient.isOpen) {
            yield exports.redisClient.quit();
            console.log('✅ Redis disconnected');
        }
        process.exit(0);
    }
    catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
    }
});
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    shutdown();
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown();
});
// Worker process
(function startWorker() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield conn_1.dataSource.initialize();
            yield connectRedisWithRetry();
            console.log('🚀 Worker started successfully');
            const defaultLeaveEntitlementService = new default_leave_entitlement_service_1.DefaultLeaveEntitlementService();
            const leaveBalanceService = new leave_balance_service_1.LeaveBalanceService(defaultLeaveEntitlementService);
            const employeeService = new employee_service_1.EmployeeService(leaveBalanceService);
            while (true) {
                try {
                    console.log('👂 Listening for employee data...');
                    const data = yield exports.redisClient.blPop('employee_queue', 0);
                    if (!(data === null || data === void 0 ? void 0 : data.element)) {
                        console.log('ℹ️ Empty message received');
                        continue;
                    }
                    const employee = JSON.parse(data.element);
                    console.log('📨 Processing employee:', employee.email);
                    yield employeeService.registerEmployee(employee);
                    console.log(`✅ Successfully registered employee: ${employee.email}`);
                }
                catch (err) {
                    console.error('❌ Error processing employee:', err);
                    if (!exports.redisClient.isOpen) {
                        console.log('ℹ️ Redis disconnected, reconnecting...');
                        yield connectRedisWithRetry();
                    }
                }
            }
        }
        catch (err) {
            console.error('❌ Worker startup failed:', err);
            process.exit(1);
        }
    });
})();

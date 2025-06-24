import { dataSource } from "../config/db/conn";
import { EmployeeService } from "../modules/empolyee/employee-service";
import { LeaveBalanceService } from "../modules/leave-balances/leave-balance-service";
import { DefaultLeaveEntitlementService } from "../modules/default-leave-entitlement/default-leave-entitlement-service";
import { createClient } from "redis";

const redisUrl = process.env.UPSTASH_REDIS_URL;
if (!redisUrl) {
    throw new Error('❌ Missing UPSTASH_REDIS_URL in environment variables.');
}

export const redisClient = createClient({
    url: redisUrl,
    socket: {
        connectTimeout: 30000,
        keepAlive: 30000,
        reconnectStrategy: (retries: number) => {
            if (retries < 5) {
                return 10000;
            }
            return new Error('❌ Redis connection failed after multiple attempts');
        }
    }
});

// Enhanced event listeners
redisClient.on('error', (err) => {
    console.error(`❌ Redis error: ${err.message}`);
});

redisClient.on('ready', () => {
    console.log('✅ Redis client ready');
});

redisClient.on('end', () => {
    console.log('❌ Redis connection ended');
});

redisClient.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
});

export async function connectRedisWithRetry(maxRetries = 5, retryDelay = 10000): Promise<void> {
    let attempts = 0;
    
    while (attempts < maxRetries) {
        attempts++;
        try {
            if (redisClient.isOpen) return;
            
            console.log(`🔌 Attempting Redis connection (attempt ${attempts}/${maxRetries})`);
            await redisClient.connect();
            console.log('✅ Redis connected successfully');
            return;
        } catch (err) {
            console.error(`❌ Redis connection attempt ${attempts} failed:`, err);
            if (attempts >= maxRetries) {
                throw new Error(`Failed to connect to Redis after ${maxRetries} attempts`);
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

// Health check
setInterval(async () => {
    try {
        if (!redisClient.isOpen) {
            await connectRedisWithRetry(1); // Try once
            return;
        }
        await redisClient.ping();
    } catch (err) {
        console.error('❌ Redis health check failed:', err);
    }
}, 30000);

// Graceful shutdown
const shutdown = async () => {
    console.log('🛑 Shutting down gracefully...');
    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
            console.log('✅ Redis disconnected');
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during shutdown:', err);
        process.exit(1);
    }
};

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
(async function startWorker() {
    try {
        await dataSource.initialize();
        await connectRedisWithRetry();
        console.log('🚀 Worker started successfully');

        const defaultLeaveEntitlementService = new DefaultLeaveEntitlementService();
        const leaveBalanceService = new LeaveBalanceService(defaultLeaveEntitlementService);
        const employeeService = new EmployeeService(leaveBalanceService);

        while (true) {
            try {
                console.log('👂 Listening for employee data...');
                const data = await redisClient.blPop('employee_queue', 0);
                
                if (!data?.element) {
                    console.log('ℹ️ Empty message received');
                    continue;
                }

                const employee = JSON.parse(data.element);
                console.log('📨 Processing employee:', employee.email);
                await employeeService.registerEmployee(employee);
                console.log(`✅ Successfully registered employee: ${employee.email}`);
            } catch (err) {
                console.error('❌ Error processing employee:', err);
                if (!redisClient.isOpen) {
                    console.log('ℹ️ Redis disconnected, reconnecting...');
                    await connectRedisWithRetry();
                }
            }
        }
    } catch (err) {
        console.error('❌ Worker startup failed:', err);
        process.exit(1);
    }
})();
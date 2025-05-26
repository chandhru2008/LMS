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
// index.ts
require("reflect-metadata"); // For TypeORM
const conn_1 = require("./config/db/conn");
const server_1 = require("./config/server");
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Initializing database...');
            yield conn_1.dataSource.initialize();
            console.log('✅ Database initialized.');
            const server = yield (0, server_1.createServer)();
            yield server.start();
            console.log('🚀 Server running at:', server.info.uri);
        }
        catch (error) {
            console.error('❌ Initialization error:', error);
            process.exit(1);
        }
    });
}
// Global error handlers
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
init();

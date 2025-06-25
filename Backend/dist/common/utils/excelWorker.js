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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseExcel = parseExcel;
exports.pushEmployeesToQueue = pushEmployeesToQueue;
const exceljs_1 = __importDefault(require("exceljs"));
const worker_1 = require("../../worker/worker");
function normalizeCellValue(cell) {
    if (cell == null)
        return '';
    if (typeof cell === 'object' && 'text' in cell)
        return cell.text.trim();
    return String(cell).trim();
}
function parseExcel(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const workbook = new exceljs_1.default.Workbook();
            yield workbook.xlsx.load(buffer);
            const worksheet = workbook.worksheets[0];
            const employees = [];
            worksheet.eachRow((row, rowNumber) => {
                var _a, _b;
                if (rowNumber === 1)
                    return; // Skip header
                const values = row.values;
                const employee = {
                    name: normalizeCellValue(values[1]),
                    email: normalizeCellValue(values[2]).toLowerCase(),
                    password: normalizeCellValue(values[3]),
                    role: normalizeCellValue(values[4]),
                    managerEmail: (_a = normalizeCellValue(values[5])) === null || _a === void 0 ? void 0 : _a.toLowerCase(),
                    hrManagerEmail: (_b = normalizeCellValue(values[6])) === null || _b === void 0 ? void 0 : _b.toLowerCase(),
                    created_at: new Date(),
                    updated_at: new Date(),
                };
                // Validate required fields
                if (!employee.name || !employee.email || !employee.password || !employee.role) {
                    console.warn(`⚠️ Skipping row ${rowNumber} - Missing required fields`);
                    return;
                }
                employees.push(employee);
            });
            console.log(`✅ Successfully parsed ${employees.length} employees`);
            return employees;
        }
        catch (error) {
            console.error('❌ Excel parsing failed:', error);
            throw error;
        }
    });
}
function pushEmployeesToQueue(employees) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!employees.length) {
            console.log('ℹ️ No employees to process');
            return;
        }
        try {
            if (!worker_1.redisClient.isOpen) {
                console.log('ℹ️ Redis not connected, attempting to connect...');
                yield worker_1.redisClient.connect();
            }
            console.log(`📤 Pushing ${employees.length} employees to queue`);
            // Using pipeline for batch operations
            const pipeline = worker_1.redisClient.multi();
            employees.forEach(emp => {
                pipeline.rPush('employee_queue', JSON.stringify(emp));
            });
            const results = yield pipeline.exec();
            // Verify all commands succeeded
            const failedCommands = results.filter(result => result[0]);
            if (failedCommands.length > 0) {
                console.error('❌ Some Redis commands failed:', failedCommands);
                throw new Error('Partial failure in Redis operations');
            }
            console.log(`✅ Successfully pushed ${employees.length} employees to queue`);
        }
        catch (error) {
            console.error('❌ Failed to push employees to queue:', error);
            throw error;
        }
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLeaveDays = calculateLeaveDays;
function calculateLeaveDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
}

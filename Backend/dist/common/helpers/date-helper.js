"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaveDatesExcludingWeekends = getLeaveDatesExcludingWeekends;
exports.isWeekend = isWeekend;
exports.isEntirelyWeekend = isEntirelyWeekend;
function getLeaveDatesExcludingWeekends(startDate, endDate) {
    const dates = [];
    let current = new Date(startDate);
    while (current <= endDate) {
        const day = current.getDay();
        if (day !== 0 && day !== 6) {
            dates.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }
    return dates;
}
function isWeekend(date) {
    return date.getDay() === 0 || date.getDay() === 6;
}
function isEntirelyWeekend(start, end) {
    let current = new Date(start);
    while (current <= end) {
        if (!isWeekend(current)) {
            return false;
        }
        current.setDate(current.getDate() + 1);
    }
    return true;
}

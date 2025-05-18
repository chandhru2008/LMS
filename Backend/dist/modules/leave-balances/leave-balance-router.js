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
exports.LeaveBalanceRoute = void 0;
class LeaveBalanceRoute {
    constructor(leaveBalanceController) {
        this.leaveBalanceController = leaveBalanceController;
    }
    leaveBalanceRoute(server) {
        server.route([
            {
                method: 'GET',
                path: '/leave-balances',
                handler: (request, h) => __awaiter(this, void 0, void 0, function* () {
                    console.log("Leave balance rout fit : ", request);
                    return this.leaveBalanceController.fetchEmployeeLeaveBalance(request, h);
                })
            }
        ]);
    }
}
exports.LeaveBalanceRoute = LeaveBalanceRoute;

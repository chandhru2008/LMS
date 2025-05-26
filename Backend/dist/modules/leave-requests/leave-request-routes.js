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
exports.leaveRequestRoutes = leaveRequestRoutes;
function leaveRequestRoutes(server, leaveRequestController) {
    server.route([
        {
            method: 'GET',
            path: '/all-leave-requests',
            handler: (request, response) => __awaiter(this, void 0, void 0, function* () { return yield leaveRequestController.getAllLeaveRequests(request, response); })
        },
        {
            method: 'POST',
            path: '/create-leave-request',
            handler: (request, response) => __awaiter(this, void 0, void 0, function* () { return yield leaveRequestController.createLeaveRequest(request, response); })
        },
        {
            method: "GET",
            path: '/leave-requests/my',
            handler: (request, response) => __awaiter(this, void 0, void 0, function* () { return yield leaveRequestController.getMyLeaveRequests(request, response); })
        },
        {
            method: 'PUT',
            path: '/leave-requests/cancel',
            handler: (request, response) => __awaiter(this, void 0, void 0, function* () { return yield leaveRequestController.cancelLeaveRequest(request, response); })
        }
    ]);
}

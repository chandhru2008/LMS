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
const auth_middleware_1 = require("../../middleware/auth-middleware");
function leaveRequestRoutes(server, leaveRequestController) {
    server.route([
        {
            method: 'GET',
            path: '/all-leave-requests',
            options: {
                pre: [{ method: auth_middleware_1.authenticate },
                    { method: (0, auth_middleware_1.authorizeRoles)(['hr', 'director']) }
                ],
                handler: (request, response) => __awaiter(this, void 0, void 0, function* () { return yield leaveRequestController.getAllLeaveRequests(request, response); })
            }
        },
        {
            method: 'GET',
            path: '/all-leave-requests-by-role',
            options: {
                pre: [{ method: auth_middleware_1.authenticate },
                    { method: (0, auth_middleware_1.authorizeRoles)(['manager', 'hr_manager']) }],
                handler: (request, response) => __awaiter(this, void 0, void 0, function* () { return yield leaveRequestController.getAllLeaveRequestsByRole(request, response); })
            }
        },
        {
            method: 'POST',
            path: '/create-leave-request',
            options: {
                pre: [{ method: auth_middleware_1.authenticate }],
                handler: (request, response) => __awaiter(this, void 0, void 0, function* () { return yield leaveRequestController.createLeaveRequest(request, response); })
            }
        },
        {
            method: "GET",
            path: '/leave-requests/my',
            options: {
                pre: [{ method: auth_middleware_1.authenticate }],
                handler: (request, response) => __awaiter(this, void 0, void 0, function* () { return yield leaveRequestController.getMyLeaveRequests(request, response); })
            }
        },
        {
            method: 'PUT',
            path: '/leave-requests/cancel',
            options: {
                pre: [{ method: auth_middleware_1.authenticate }],
                handler: (request, response) => __awaiter(this, void 0, void 0, function* () { return yield leaveRequestController.cancelLeaveRequest(request, response); })
            }
        }
    ]);
}

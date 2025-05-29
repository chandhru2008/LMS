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
exports.leaveTypeRoutes = leaveTypeRoutes;
const auth_middleware_1 = require("../../middleware/auth-middleware");
function leaveTypeRoutes(server, leaveTypeController) {
    server.route([
        {
            method: 'GET',
            path: "/leave-types",
            handler: (request, response) => __awaiter(this, void 0, void 0, function* () { return yield leaveTypeController.getAllLeaveTypes(request, response); })
        }, {
            method: 'GET',
            path: "/leave-types/eligibility",
            options: {
                pre: [{ method: auth_middleware_1.authenticate }],
                handler: (request, response) => __awaiter(this, void 0, void 0, function* () { return yield leaveTypeController.getLeaveTypesByEligibility(request, response); })
            }
        }
    ]);
}

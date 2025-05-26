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
exports.employeeRoute = employeeRoute;
function employeeRoute(server, employeeController) {
    server.route([
        {
            method: 'POST',
            path: '/register',
            handler: (request, h) => __awaiter(this, void 0, void 0, function* () {
                return yield employeeController.registerEmployee(request, h);
            })
        },
        {
            method: 'POST',
            path: '/login',
            handler: (request, h) => __awaiter(this, void 0, void 0, function* () {
                return yield employeeController.loginEmployee(request, h);
            })
        },
        {
            method: 'POST',
            path: '/log-out',
            handler: (request, h) => {
                return h
                    .response({ message: 'Logged out successfully' })
                    .unstate('userSession', { path: '/' });
            }
        },
        {
            method: 'GET',
            path: '/check-auth',
            handler: (request, h) => {
                return employeeController.authenticateEmployee(request, h);
            }
        },
        {
            method: 'GET',
            path: '/get-all-employees',
            handler: (request, h) => {
                return employeeController.getAllEmployee(request, h);
            }
        }, {
            method: 'GET',
            path: '/get-employees-by-role',
            handler: (request, h) => {
                console.log('routes hit');
                return employeeController.getEmployeeByRole(request, h);
            }
        }
    ]);
}

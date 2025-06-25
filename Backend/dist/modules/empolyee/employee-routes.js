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
const employee_controller_1 = require("./employee-controller");
const auth_middleware_1 = require("../../middleware/auth-middleware");
function employeeRoute(server, employeeController) {
    server.route([
        {
            method: 'POST',
            path: '/register',
            options: {
                pre: [{ method: auth_middleware_1.authenticate },
                    { method: (0, auth_middleware_1.authorizeRoles)(['hr', 'hr_manager']) }
                ],
                handler: (request, h) => __awaiter(this, void 0, void 0, function* () {
                    return yield employeeController.registerEmployee(request, h);
                })
            },
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
            options: {
                pre: [{ method: auth_middleware_1.authenticate }],
                handler: (request, h) => {
                    return employeeController.authenticateEmployee(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/get-all-employees',
            options: {
                pre: [{ method: auth_middleware_1.authenticate },
                    { method: (0, auth_middleware_1.authorizeRoles)(['rh', 'director']) }
                ],
                handler: (request, h) => {
                    return employeeController.getAllEmployee(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/get-employees-by-role',
            options: {
                pre: [{ method: auth_middleware_1.authenticate },
                    { method: (0, auth_middleware_1.authorizeRoles)(['hr_manager', 'manager']) }
                ], // middleware
                handler: (request, h) => {
                    return employeeController.getEmployeeByRole(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/get-all-managers',
            handler: (request, h) => __awaiter(this, void 0, void 0, function* () {
                return yield employeeController.getAllManagers(request, h);
            })
        },
        {
            method: 'GET',
            path: '/get-all-hr-managers',
            handler: (request, h) => __awaiter(this, void 0, void 0, function* () {
                return yield employeeController.getAllHrManagers(h);
            })
        }, {
            method: 'POST',
            path: '/employees/bulk-upload',
            options: {
                payload: {
                    output: 'stream',
                    parse: true,
                    allow: 'multipart/form-data',
                    maxBytes: 10 * 1024 * 1024, // 10MB
                    multipart: true,
                },
            },
            handler: (request, response) => employee_controller_1.EmployeeController.uploadHandler(request, response)
        },
        {
            method: 'GET',
            path: '/get-gender',
            handler: (r, res) => employeeController.getGender()
        }
    ]);
}

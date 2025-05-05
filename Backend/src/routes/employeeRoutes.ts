import { ServerRoute } from '@hapi/hapi';
import * as EmployeeController from '../controllers/EmployeeController';

export const employeeRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/register',
    handler: EmployeeController.createEmployee,
    options: {
      payload: {
        parse: true,
        output: 'data',
        allow: ["application/x-www-form-urlencoded"]
      }
    },
  },
  {
    method: 'POST',
    path: '/login',
    handler : EmployeeController.authenticateEmployee,
    options: {
      payload: {
        parse: true,
        output: 'data',
        allow: ["application/x-www-form-urlencoded"]
      }
    },
  },
];

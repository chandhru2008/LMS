import '@hapi/hapi';

declare module '@hapi/hapi' {
    interface AuthCredentials {
        payload: {
            id: string;
            name: string;
            email: string;
            password: string;
            role: 'hr' | 'manager' | 'hr_manager' | 'director' | 'employee';
            gender: 'male' | 'female';
            materialStatus: 'single' | 'married';
        }
    }
    interface RequestAuth {
        credentials: AuthCredentials;
    }
}


interface RegisterEmployeePayload {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'hr' | 'manager' | 'hr_manager' | 'director' | 'employee';
    gender: 'male' | 'female';
    materialStatus: 'single' | 'married';
    managerEmail: string;
    hrManagerEmail: string;
}

interface LoginEmployeePayload {
    email: string;
    password: string;
}

interface Approval {
    approver: Employee;
}

interface Employee {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'hr' | 'manager' | 'hr_manager' | 'director' | 'employee';
    gender: 'male' | 'female';
    materialStatus: 'single' | 'married';
    managerEmail: string;
    hrManagerEmail: string;
}
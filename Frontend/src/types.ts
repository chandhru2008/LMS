import type { Dispatch, SetStateAction } from "react";

export interface ILeaveRequestRawData {
    employeeName: string,
    employeeEmail: string,
    role: 'hr' | 'manager' | 'hr_manager' | 'director' | 'employee',
    leaveRequestId: number,
    leaveType: string,
    startDate: string,
    endDate: string,
    description: string,
    overallStatus: 'Approved' | 'Pending' | 'Cancelled',
    managerApproval: 'Approved' | 'Pending' | 'Cancelled',
    hrManagerApproval: 'Approved' | 'Pending' | 'Cancelled',
    hrApproval: 'Approved' | 'Pending' | 'Cancelled',
    directorApproval: 'Approved' | 'Pending' | 'Cancelled',
}


export interface ILeaveRequest {
    employeeDetails: {
        employeeName: string;
        employeeEmail: string;
        employeeRole: 'hr' | 'manager' | 'hr_manager' | 'director' | 'employee'
    };
    leaveDetails: {
        leaveRequestId: string;
        leaveType: string;
        leaveStartDate: string;
        leaveEndDate: string;
        leaveReason: string;
        status: string;
        approvalStatus: {
            managerApproval: 'Approved' | 'Pending' | 'Cancelled';
            hrManagerApproval: 'Approved' | 'Pending' | 'Cancelled'
            hrApproval: 'Approved' | 'Pending' | 'Cancelled';
            directorApproval: 'Approved' | 'Pending' | 'Cancelled';
        };
    };
}

export interface IUserDetails {
    name: string;
    email: string;
    password: string;
    role: 'hr' | 'hr_manager' | 'director' | 'manager' | 'employee'
    gender: string;
    maritalStatus: string;
    managerEmail?: string;
    hrManagerEmail?: string;
}

export interface IEmployee {
    name: string;
    role: string;
    email: string;
}

export
    interface ILeaveEvent {
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    status: string;
    employeeName: string;
    leaveTypeName: string;
    email: string;
}

export interface ILeaveBalance {
    total: number;
    type: string;
    used: number;
    remaining: number;
}

export interface IAuthData {
    name: string;
    email: string;
    role: 'hr' | 'manager' | 'hr_manager' | 'director' | 'employee';
};


export interface IAuthContextType {
    authData: IAuthData | null;
    login: boolean;
    setLogin: Dispatch<SetStateAction<boolean>>;
    setAuthData: React.Dispatch<React.SetStateAction<IAuthData | null>>;
    fetchAuth: () => Promise<void>;
};

export interface ILeaveType {
    id: number;
    name: string;
    max_allowed_days?: number;
}

export interface IApproval {
    id: number;
    level: number;
    approverRole: "manager" | "hr" | "director";
    status: string;
    remarks: string | null;
    approver : IEmployee
    approvedAt : Date
}

export interface IApiLeaveData {
    employee: { name: string; email: string };
    leaveType: { name: string };
    start_date: string;
    end_date: string;
    status: string;
}


export interface ILeaveHistoryItem {
    id: string;
    start_date: string;
    end_date: string;
    description: string;
    status: string;
    approvals: IApproval[];
    leaveType: ILeaveType;
    created_at: string;
    workDays : number
}

export interface TabPanelProps {
    activeTab: string;
    role: string;
}

export interface IAuthData {
    name: string;
    email: string;
    role: 'hr' | 'manager' | 'hr_manager' | 'director' | 'employee';
};


export interface IleaveBalanceDeatils{
    type : string,
    remaining : number;
    used : number;
}
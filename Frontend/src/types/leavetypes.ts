export interface ILeaveRequest {
  employeeDetails: {
    employeeName: string;
    employeeEmail: string;
    employeeRole: string; // you can fill it as needed
  };
  leaveDetails: {
    leaveRequestId: string;
    leaveType: string;
    leaveStartDate: string; // add real data or leave blank
    leaveEndDate: string;   // add real data or leave blank
    leaveReason: string;
    status: string;
    approvalStatus: {
      managerApproval: string;
      hrMangerApproval : string
      hrApproval: string;
      directorApproval: string;
    };
  };
}
import { useEffect, useState } from "react";
import type { ILeaveRequest, ILeaveRequestRawData } from "../types";
import { useAuth } from "./AuthProvider";

function calculateDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
}

const approvalFieldMap: Record<string, keyof ILeaveRequest["leaveDetails"]["approvalStatus"]> = {
  director: "directorApproval",
  hr: "hrApproval",
  hr_manager: "hrManagerApproval",
  manager: "managerApproval",
};

function LeaveRequestApproval() {
  const { authData } = useAuth();
  if (!authData) throw new Error("authData is missing");
  const role = authData.role;

  const [leaveRequests, setLeaveRequests] = useState<ILeaveRequest[]>([]);
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const approvalField = approvalFieldMap[role] ?? null;

  useEffect(() => {
    if (!approvalField) {
      setIsLoading(false);
      return;
    }

    async function fetchLeaveRequests() {
      try {
        setIsLoading(true);
        const res = await fetch("https://lms-zwod.onrender.com/approvals", {
          method: "GET",
          credentials: "include",
        });
        
        if (!res.ok) {
          throw new Error("Failed to fetch leave requests");
        }
        
        const rawData = await res.json();

        const mappedData: ILeaveRequest[] = rawData.map((item: ILeaveRequestRawData) => ({
          employeeDetails: {
            employeeName: item.employeeName,
            employeeEmail: item.employeeEmail,
            employeeRole: item.employeeRole,
          },
          leaveDetails: {
            leaveRequestId: item.leaveRequestId,
            leaveType: item.leaveType,
            leaveStartDate: item.startDate,
            leaveEndDate: item.endDate,
            leaveReason: item.description || "",
            status: item.overallStatus,
            approvalStatus: {
              managerApproval: item.managerApproval,
              managerRemarks: item.managerRemark,
              hrApproval: item.hrApproval,
              hrRemarks: item.hrRemark,
              hrManagerApproval: item.hrManagerApproval,
              hrManagerRemarks: item.hrManagerRemark,
              directorApproval: item.directorApproval,
              directorRemarks: item.directorRemark,
            },
          },
        }));

        setLeaveRequests(mappedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching leave requests:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaveRequests();
  }, [approvalField]);

  async function handleAction(id: string, decision: "Approve" | "Reject") {
    const remarks = remarksMap[id] || "";

    try {
      const res = await fetch(`https://lms-zwod.onrender.com/approvals/decision`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaveRequestId: id,
          decision,
          role,
          remarks,
        }),
      });

      if (res.ok) {
        setLeaveRequests((prev) =>
          prev.filter((req) => req.leaveDetails.leaveRequestId !== id)
        );
        setRemarksMap((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      } else {
        throw new Error("Action failed");
      }
    } catch (err) {
      console.error("Action error:", err);
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  const approvalStatusColors: Record<string, string> = {
    Pending: "text-yellow-600",
    Approved: "text-green-600",
    Rejected: "text-red-600",
  };

  if (!approvalField) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h2>
          <p className="text-gray-500">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const filteredRequests = leaveRequests.filter((req) => {
    const status = req.leaveDetails.approvalStatus;
    const currentApproval = status[approvalField];
    if (role === "hr") {
      return status.managerApproval === "Approved" && currentApproval === "Pending";
    }
    return currentApproval === "Pending";
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            {role?.replace("_", " ")} Pending Approvals
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Review and approve/reject leave requests
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            {filteredRequests.length} pending
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No pending requests</h3>
            <p className="mt-1 text-sm text-gray-500">All leave requests have been processed.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(({ employeeDetails, leaveDetails }) => (
            <div
              key={leaveDetails.leaveRequestId}
              className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {employeeDetails.employeeName.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{employeeDetails.employeeName}</h3>
                      <p className="text-sm text-gray-500">{employeeDetails.employeeEmail}</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[leaveDetails.status]}`}>
                      {leaveDetails.status}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {leaveDetails.leaveType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Start Date</label>
                    <p className="text-gray-900 font-medium">{leaveDetails.leaveStartDate || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">End Date</label>
                    <p className="text-gray-900 font-medium">{leaveDetails.leaveEndDate || "-"}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="text-gray-900 font-medium">
                      {calculateDuration(leaveDetails.leaveStartDate, leaveDetails.leaveEndDate)} day(s)
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-500">Reason</label>
                  <p className="text-gray-800 mt-1 bg-gray-50 p-3 rounded-md">{leaveDetails.leaveReason || "No reason provided"}</p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Approval Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {leaveDetails.approvalStatus.managerApproval && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-700">Manager</span>
                          <span className={`text-xs font-semibold ${approvalStatusColors[leaveDetails.approvalStatus.managerApproval]}`}>
                            {leaveDetails.approvalStatus.managerApproval}
                          </span>
                        </div>
                        {leaveDetails.approvalStatus.managerRemarks && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{leaveDetails.approvalStatus.managerRemarks}"</p>
                        )}
                      </div>
                    )}
                    {leaveDetails.approvalStatus.hrApproval && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-700">HR</span>
                          <span className={`text-xs font-semibold ${approvalStatusColors[leaveDetails.approvalStatus.hrApproval]}`}>
                            {leaveDetails.approvalStatus.hrApproval}
                          </span>
                        </div>
                        {leaveDetails.approvalStatus.hrRemarks && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{leaveDetails.approvalStatus.hrRemarks}"</p>
                        )}
                      </div>
                    )}
                    {leaveDetails.approvalStatus.directorApproval && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-700">Director</span>
                          <span className={`text-xs font-semibold ${approvalStatusColors[leaveDetails.approvalStatus.directorApproval]}`}>
                            {leaveDetails.approvalStatus.directorApproval}
                          </span>
                        </div>
                        {leaveDetails.approvalStatus.directorRemarks && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{leaveDetails.approvalStatus.directorRemarks}"</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor={`remarks-${leaveDetails.leaveRequestId}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Your Remarks
                  </label>
                  <textarea
                    id={`remarks-${leaveDetails.leaveRequestId}`}
                    value={remarksMap[leaveDetails.leaveRequestId] || ""}
                    onChange={(e) =>
                      setRemarksMap((prev) => ({
                        ...prev,
                        [leaveDetails.leaveRequestId]: e.target.value,
                      }))
                    }
                    placeholder="Enter your remarks here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={3}
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleAction(leaveDetails.leaveRequestId, "Reject")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction(leaveDetails.leaveRequestId, "Approve")}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LeaveRequestApproval;
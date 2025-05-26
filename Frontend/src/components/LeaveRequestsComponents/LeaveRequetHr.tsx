import { useEffect, useState } from "react";

interface LeaveRequest {
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
      hrApproval: string;
      directorApproval: string;
    };
  };
}

function calculateDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diff / (1000 * 3600 * 24)) + 1;
}

function LeaveRequestHr() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    async function fetchLeaveRequests() {
      try {
        const res = await fetch("https://leave-management-app-2025.netlify.app/approvals", {
          method: "GET",
          credentials: "include",
        });
        const rawData = await res.json();



        // Map raw backend data to LeaveRequest interface shape
        const mappedData: LeaveRequest[] = rawData.map((item: any) => ({
          employeeDetails: {
            employeeName: item.employeeName,
            employeeEmail: item.employeeEmail,
            employeeRole: item.role 
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
              hrApproval: item.hrApproval,
              directorApproval: item.directorApproval,
            },
          },
        }));

        setLeaveRequests(mappedData);
      } catch (err) {
        console.error("Error fetching leave requests:", err);
      }
    }

    fetchLeaveRequests();
  }, []);

  async function handleAction(id: string, decision: "Approve" | "Reject") {
    try {
      const res = await fetch(`https://leave-management-app-2025.netlify.app/approvals/decision`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leaveRequestId : id,
          decision: decision,
        }),
      });

      if (res.ok) {
        setLeaveRequests((prev) =>
          prev.filter((req) => req.leaveDetails.leaveRequestId !== id)
        );
      } else {
        console.error("Action failed");
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  }

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-300 text-yellow-900",
    Approved: "bg-green-300 text-green-900",
    Rejected: "bg-red-300 text-red-900",
  };



  return (
    <div className="w-[70%] mx-auto my-6">
      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-2xl font-semibold text-gray-800">Pending Leave Requests</h2>
      </div>

      <div className="flex flex-col gap-4">
        {leaveRequests.length === 0 ? (
          <p className="text-gray-500 text-center">No pending leave requests</p>
        ) : (
          leaveRequests.filter(({ leaveDetails }) => leaveDetails.approvalStatus.hrApproval === "Pending").map(({ employeeDetails, leaveDetails }) => (
            <div
              key={leaveDetails.leaveRequestId}
              className="border-l-4 border-blue-500 rounded shadow bg-white overflow-hidden"
            >
              <div className="flex justify-between items-center px-5 py-3 bg-gray-100">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {employeeDetails.employeeName}
                  </h3>
                  <p className="text-sm text-gray-500">{employeeDetails.employeeRole}</p>
                  <p className="text-sm text-gray-400">{employeeDetails.employeeEmail}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700 mb-1">
                    {leaveDetails.leaveType}
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      statusColors[leaveDetails.status] || "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {leaveDetails.status}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                <div className="flex gap-10">
                  <div>
                    <p className="font-semibold text-sm text-gray-600">From</p>
                    <p className="text-gray-800">{leaveDetails.leaveStartDate || "-"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-600">To</p>
                    <p className="text-gray-800">{leaveDetails.leaveEndDate || "-"}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-600">Duration</p>
                    <p className="text-gray-800">
                      {calculateDuration(leaveDetails.leaveStartDate, leaveDetails.leaveEndDate)} days
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-sm text-gray-600">Reason</p>
                  <p className="text-gray-800">{leaveDetails.leaveReason}</p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 pt-2 border-t mt-4">
                  <div>
                    <p className="font-semibold">Manager Approval</p>
                    <p>{leaveDetails.approvalStatus.managerApproval}</p>
                  </div>
                  <div>
                    <p className="font-semibold">HR Approval</p>
                    <p>{leaveDetails.approvalStatus.hrApproval}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Director Approval</p>
                    <p>{leaveDetails.approvalStatus.directorApproval}</p>
                  </div>
                </div>

                {leaveDetails.approvalStatus.hrApproval === "Pending" && (
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                      onClick={() => handleAction(leaveDetails.leaveRequestId, "Approve")}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                      onClick={() => handleAction(leaveDetails.leaveRequestId, "Reject")}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LeaveRequestHr;

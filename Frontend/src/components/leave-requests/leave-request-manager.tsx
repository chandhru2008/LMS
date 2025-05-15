import { useEffect, useState } from "react";

interface LeaveRequest {
  employeeDetails: {
    employeeName: string;
    employeeEmail: string;
  };
  leaveDetails: {
    leaveRequestId : string,
    leaveType: string;
    leaveStartDate: string;
    leaveEndDate: string;
    leaveReason: string;
    status: string;
    approvalStatus: {
      managerApproval: string;
      hrApproval: string;
      directorApproval: string;
    };
  };
}

function LeaveRequestManager() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  useEffect(() => {
    async function fetchLeaveRequests() {
      try {
        const res = await fetch("http://localhost:3001/leave-requests/subordinates", {
          method: "GET",
          credentials: "include",
        });
        const json = await res.json();
        console.log(json)
        setLeaveRequests(json.leaveRequestByRole || []);
      } catch (err) {
        console.error("Error fetching leave requests:", err);
      }
    }

    fetchLeaveRequests();
  }, []);

  async function handleAction(id: string, decision: "Approve" | "Reject") {
    try {
        console.log("Sending decision for leave ID:", id);
      const res = await fetch("http://localhost:3001/leave-requests/"+ id+ "/decision", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          manager_approval: decision,
        }),
      });

      if (res.ok) {
        alert(`Leave ${decision.toLowerCase()}d successfully!`);
        window.location.reload();
      } else {
        console.error("Action failed");
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">📋 Leave Requests Dashboard</h2>

      {leaveRequests.length === 0 ? (
        <p className="text-center text-gray-500">No leave requests found.</p>
      ) : (
        <div className="overflow-auto rounded-lg shadow border border-gray-200">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 font-semibold">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3">HR</th>
                <th className="px-4 py-3">Director</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveRequests.map((req, index) => (
                <tr key={index} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-2">{req.employeeDetails.employeeName}</td>
                  <td className="px-4 py-2 text-gray-500">{req.employeeDetails.employeeEmail}</td>
                  <td className="px-4 py-2">{req.leaveDetails.leaveType}</td>
                  <td className="px-4 py-2">{new Date(req.leaveDetails.leaveStartDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(req.leaveDetails.leaveEndDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{req.leaveDetails.leaveReason}</td>
                  <td className="px-4 py-2 font-medium">{req.leaveDetails.status}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      req.leaveDetails.approvalStatus.managerApproval === "Approved"
                        ? "bg-green-100 text-green-800"
                        : req.leaveDetails.approvalStatus.managerApproval === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {req.leaveDetails.approvalStatus.managerApproval}
                    </span>
                  </td>
                  <td className="px-4 py-2">{req.leaveDetails.approvalStatus.hrApproval}</td>
                  <td className="px-4 py-2">{req.leaveDetails.approvalStatus.directorApproval}</td>
                  <td className="px-4 py-2 text-center">
                    {req.leaveDetails.approvalStatus.managerApproval === "Pending" && (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAction(req.leaveDetails.leaveRequestId, "Approve")}
                          className="bg-green-600 text-white px-3 py-1 rounded-md text-xs hover:bg-green-700"
                        >
                           Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.leaveDetails.leaveRequestId, "Reject")}
                          className="bg-red-500 text-white px-3 py-1 rounded-md text-xs hover:bg-red-600"
                        >
                           Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LeaveRequestManager;

import { useEffect, useState } from "react";

interface LeaveRequest {
  employeeDetails: {
    employeeName: string;
    employeeEmail: string;
  };
  leaveDetails: {
    leaveRequestId: string;
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

function LeaveRequestDirector() {
  const [leaveData, setLeaveData] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAllLeaveRequest() {
      try {
        const response = await fetch("https://lms-zwod.onrender.com/all-leave-requests", {
          method: 'GET',
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
          setLeaveData(data);
        } else {
          setError(data.message || "Failed to fetch leave requests");
        }
      } catch (e) {
        setError("Server error: " + (e as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchAllLeaveRequest();
  }, []);

  async function handleAction(id: string, decision: "Approve" | "Reject") {
    try {
      const res = await fetch(`http://localhost:3001/leave-requests/${id}/decision`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          director_approval: decision,
        }),
      });

      if (res.ok) {
        showError(`Leave ${decision.toLowerCase()}d successfully!`);
        window.location.reload();
      } else {
        console.error("Action failed");
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  }

  if (loading) return <p className="p-4 text-gray-600">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Leave Requests</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm text-left">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Type</th>
              <th className="px-4 py-2 border">From</th>
              <th className="px-4 py-2 border">To</th>
              <th className="px-4 py-2 border">Reason</th>
              <th className="px-4 py-2 border">Status</th>
              <th className="px-4 py-2 border">Manager</th>
              <th className="px-4 py-2 border">HR</th>
              <th className="px-4 py-2 border">Director</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveData.map((item, index) => {
              const directorApproval = item.leaveDetails.approvalStatus.directorApproval;
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{item.employeeDetails.employeeName}</td>
                  <td className="px-4 py-2 border">{item.employeeDetails.employeeEmail}</td>
                  <td className="px-4 py-2 border">{item.leaveDetails.leaveType}</td>
                  <td className="px-4 py-2 border">{item.leaveDetails.leaveStartDate}</td>
                  <td className="px-4 py-2 border">{item.leaveDetails.leaveEndDate}</td>
                  <td className="px-4 py-2 border">{item.leaveDetails.leaveReason}</td>
                  <td className="px-4 py-2 border">{item.leaveDetails.status}</td>
                  <td className="px-4 py-2 border">{item.leaveDetails.approvalStatus.managerApproval}</td>
                  <td className="px-4 py-2 border">{item.leaveDetails.approvalStatus.hrApproval}</td>
                  <td className="px-4 py-2 border">{directorApproval}</td>
                  <td className="px-4 py-2 border">
                    {directorApproval === "Pending" ? (
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 bg-green-500 text-white rounded"
                          onClick={() => handleAction(item.leaveDetails.leaveRequestId, "Approve")}
                        >
                          Approve
                        </button>
                        <button
                          className="px-2 py-1 bg-red-500 text-white rounded"
                          onClick={() => handleAction(item.leaveDetails.leaveRequestId, "Reject")}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        Already {directorApproval}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaveRequestDirector;

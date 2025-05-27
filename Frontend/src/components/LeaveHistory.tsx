import { useEffect, useState } from "react";

interface LeaveType {
  id: number;
  name: string;
  max_allowed_days?: number;
}

interface Approval {
  id: number;
  level: number;
  approverRole: "manager" | "hr" | "director";
  status: string;
  remarks: string | null;
}

interface LeaveHistoryItem {
  id: string;
  start_date: string;
  end_date: string;
  description: string;
  status: string;
  approvals: Approval[];
  leaveType: LeaveType;
  created_at: string;
}

function LeaveHistory() {
  const [data, setData] = useState<LeaveHistoryItem[]>([]);
const [decision, setDecision] = useState('')
  useEffect(() => {
    async function fetchLeaveHistory() {
    
      try {
        const response = await fetch("http://localhost:3001/leave-requests/my", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const result = await response.json();
          setData(result.leaveRequest || []);
        }
      } catch (error) {
        console.error("Error fetching leave history:", error);
      }
    }

    fetchLeaveHistory();
  }, []);

  const getApprovalStatus = (approvals: Approval[], role: string) => {
    const approval = approvals.find((a) => a.approverRole.toLowerCase() === role.toLowerCase());
    return approval ? approval.status : "N/A";
  };

  async function handleCancel(id: string) {
    setDecision(id);
    const confirmCancel = window.confirm("Are you sure you want to cancel this leave request?");
    if (!confirmCancel) return;

    try {
      const res = await fetch(`http://localhost:3001/leave-requests/cancel`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,         // leave request ID
          decision,   // whatever decision you're passing (e.g., "Cancelled")
        }),
      });

      if (res.ok) {
        alert("Leave request cancelled successfully!");
        setData((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("Failed to cancel leave request.");
      }
    } catch (err) {
      console.error("Cancel error:", err);
    }
  }

  return (
    <div className="mt-10 mx-auto">
      <h2 className="text-3xl font-semibold text-center my-[15px]">Leave History</h2>
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 w-[70%] mx-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold">Leave Type</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">From</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">To</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">Status</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">Manager Approval</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">HR Approval</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">Director Approval</th>
              <th className="text-left px-6 py-3 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item) => {
                const isCancelable =
                  item.status === "Pending" &&
                  new Date(item.start_date).getTime() > new Date().getTime();

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 ${item.status === "Rejected"
                        ? "bg-red-100"
                        : item.status === "Approved"
                          ? "bg-green-100"
                          : ""
                      }`}
                  >
                    <td className="px-6 py-4 border-b">{item.leaveType.name}</td>
                    <td className="px-6 py-4 border-b">
                      {new Date(item.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b">
                      {new Date(item.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 border-b">
                      <span
                        className={`font-medium ${item.status === "Approved"
                            ? "text-green-700"
                            : item.status === "Rejected"
                              ? "text-red-700"
                              : "text-yellow-700"
                          }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b">{getApprovalStatus(item.approvals, "manager")}</td>
                    <td className="px-6 py-4 border-b">{getApprovalStatus(item.approvals, "hr")}</td>
                    <td className="px-6 py-4 border-b">{getApprovalStatus(item.approvals, "director")}</td>
                    <td className="px-6 py-4 border-b">
                      {isCancelable ? (
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="text-center px-6 py-4 text-gray-500">
                  No leave history available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaveHistory;

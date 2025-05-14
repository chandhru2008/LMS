import { useEffect, useState } from "react";
interface Employee {
    id: string;
    name: string;
    email: string;
  
}

interface LeaveType {
    id: number;
    name: string;
}

interface LeaveHistory {
    id: string;
    start_date: string;
    end_date: string;
    status: string;
    description: string;
    leaveType: LeaveType;
    manager_approval: string;
    HR_approval: string;
    director_approval: string;
}

interface LeaveRequestEntry {
    employee: Employee;
    leaveHistory: LeaveHistory[];
}

function LeaveRequestManager() {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequestEntry[]>([]);


    useEffect(() => {
        async function getLeaveRequest() {
            const res = await fetch("http://localhost:3001/manager/leaves", {
                method: "GET",
                credentials: "include",
            });

            if (res.ok) {
                const json = await res.json();
                setLeaveRequests(json.data);
            } else {
                console.log("Something went wrong");
            }
        }

        getLeaveRequest();
    }, []);

    async function handleApprove(leaveId: string) {
        try {
          const res = await fetch(`http://localhost:3001/leave-request/${leaveId}/approve`, {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              manager_approval: "Approved",
            }),
          });
      
          if (res.ok) {
            console.log("Leave approved!");
            window.location.reload();
            
          } else {
            console.error("Failed to approve");
          }
        } catch (e) {
          console.error("Error approving:", e);
        }
      }
      

    const handleReject = (id) => {
        console.log("Rejected", id);

    };

    return (
        <div className="w-[95%] mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Leave Requests</h2>
            <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2">Employee</th>
                        <th className="border p-2">Leave Type</th>
                        <th className="border p-2">Start Date</th>
                        <th className="border p-2">End Date</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Manager Approval</th>
                        <th className="border p-2">HR Approval</th>
                        <th className="border p-2">Director Approval</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leaveRequests.map((entry, i) =>
                        entry.leaveHistory.map((leave: any, j: number) => (
                            <tr key={`${i}-${j}`}>
                                <td className="border p-2">{entry.employee.name}</td>
                                <td className="border p-2">{leave.leaveType?.name}</td>
                                <td className="border p-2">{new Date(leave.start_date).toLocaleDateString()}</td>
                                <td className="border p-2">{new Date(leave.end_date).toLocaleDateString()}</td>
                                <td className="border p-2">{leave.status}</td>
                                <td className="border p-2">{leave.manager_approval}</td>
                                <td className="border p-2">{leave.HR_approval}</td>
                                <td className="border p-2">{leave.director_approval}</td>
                                <td className="border p-2 space-x-2">
                                    { leave.manager_approval != "Approved" && leave.stats != "Approved" ? <> <button
                                        onClick={() => handleApprove(leave.id)}
                                        className="bg-green-500 text-white px-2 py-1 rounded"
                                    >
                                        Approve
                                    </button>
                                        <button
                                            onClick={() => handleReject(leave.id)}
                                            className="bg-red-500 text-white px-2 py-1 rounded"
                                        >
                                            Reject
                                        </button></> : <>Leave request approved</>}

                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default LeaveRequestManager;

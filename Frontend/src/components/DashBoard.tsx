import { useEffect, useState } from "react"
import LeaveRequestForm from "./LeaveRequestForm";
import LeaveHistory from "./LeaveHistory";
import LeaveBalances from "./LeaveBalance";
import LeaveRequestDirector from "./LeaveRequestsComponents/LeaveRequestDirector";
import LeaveRequestHr from "./LeaveRequestsComponents/LeaveRequetHr";
import LeaveRequestManager from "./LeaveRequestsComponents/LeaveRequestManager";
import Registration from "./Registration";

function DashBoard() {

    const [role, setRole] = useState('');
    const [dashBoardContent, setDashBoardContent] = useState('leaveRequest');

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch('http://localhost:3002/check-auth', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!res.ok) {
                    throw new Error('Authentication check failed');
                } else {
                    const data = await res.json();
                    setRole(data.role);
                }

            } catch (error) {
                console.log(error);
            }
        }
        checkAuth();
    }, []);

    function handledashBoardContent(dbc: string) {
        setDashBoardContent(dbc);
    }
    console.log(role)
    return (
        <div className="w-full h-full">
            <div className="w-[70%] h-[100px] flex gap-[20px] mx-auto border-b border-gray-300 items-end">
                <button onClick={() => handledashBoardContent("leaveRequest")}
                    className={`py-[10px] px-[15px] border-b-3 mb-[7px] ${dashBoardContent === 'leaveRequest' ? 'border-[#4f39f6]-300 text-[#4f39f6]' : 'border-transparent text-[#00000]'
                        }`}
                >
                    Request Leave
                </button>
                <button onClick={() => handledashBoardContent("leaveBalance")} className={`py-[10px] px-[15px] border-b-3 mb-[7px] ${dashBoardContent === 'leaveBalance' ? 'border-[#4f39f6]-300 text-[#4f39f6]' : 'border-transparent text-[#00000]'
                    }`}>Leave Balance</button>
                <button onClick={() => handledashBoardContent("leaveHistory")} className={`py-[10px] px-[15px] border-b-3 mb-[7px] ${dashBoardContent === 'leaveHistory' ? 'border-[#4f39f6]-300 text-[#4f39f6]' : 'border-transparent text-[#00000]'
                    }`}>Leave History</button>

                {
                    (role === 'manager' || role === 'HR' || role === 'director') && (
                        <button onClick={() => handledashBoardContent("view")} className={`py-[10px] px-[15px] border-b-3 mb-[7px] ${dashBoardContent === 'view' ? 'border-[#4f39f6]-300 text-[#4f39f6]' : 'border-transparent text-[#00000]'
                            }`}>{role} View</button>
                    )
                }
                {
                    (
                       ( role === 'HR' || role === 'hr_manager') && (
                            <button onClick={() => handledashBoardContent("registerEmployee")} className={`py-[10px] px-[15px] border-b-3 mb-[7px] ${dashBoardContent === 'registerEmployee' ? 'border-[#4f39f6]-300 text-[#4f39f6]' : 'border-transparent text-[#00000]'
                                }`}> Register Employee</button>
                        )
                    )
                }
            </div>
            {dashBoardContent === 'leaveRequest' && (
                <LeaveRequestForm />
            )
            }
            {dashBoardContent === 'leaveBalance' && (
                <LeaveBalances />
            )
            }
            {dashBoardContent === 'leaveHistory' && (
                <LeaveHistory />
            )
            }

            {
                (dashBoardContent === 'view' && role === 'director') && (
                    <LeaveRequestDirector />
                )
            }
            {
                (dashBoardContent === 'view' && role === 'HR') && (
                    <LeaveRequestHr />

                )
            }
            {
                (dashBoardContent === 'registerEmployee' && (role === 'HR' || role === 'hr_manager')) && (
                    <Registration />
                )
            }
            {
                (dashBoardContent === 'view' && role === 'manager') && (
                    <LeaveRequestManager />
                )
            }

        </div>
    )
}
export default DashBoard;
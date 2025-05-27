import { useEffect, useState } from "react"
import { useNavigate } from 'react-router-dom';
import LeaveRequestForm from "./LeaveRequestForm";
import LeaveHistory from "./LeaveHistory";
import LeaveBalances from "./LeaveBalance";
import LeaveRequestDirector from "./LeaveRequestsComponents/LeaveRequestDirector";
import LeaveRequestHr from "./LeaveRequestsComponents/LeaveRequetHr";
import LeaveRequestManager from "./LeaveRequestsComponents/LeaveRequestManager";
import Registration from "./Registration";
import LeaveRequestHrManager from "./LeaveRequestsComponents/LeaveRequestHrManager";

function DashBoard() {

    const navigate = useNavigate();

    const [role, setRole] = useState('');
    const [dashBoardContent, setDashBoardContent] = useState('leaveRequest');

    useEffect(() => {
        async function checkAuth() {
            try {
                const res = await fetch('http://localhost:3001/check-auth', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!res.ok) {
                    navigate('/login');
                } else {
                    const data = await res.json();
                    setRole(data.role);
                    console.log(data)
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
                    (role === 'manager' || role === 'hr' || role === 'director' || role === 'hr_manager') && (
                        <button onClick={() => handledashBoardContent("view")} className={`py-[10px] px-[15px] border-b-3 mb-[7px] ${dashBoardContent === 'view' ? 'border-[#4f39f6]-300 text-[#4f39f6]' : 'border-transparent text-[#00000]'
                            }`}>{role === 'hr' ? 'hr' : role === 'director' ? 'Director' : role === 'hr_manager' ? 'HR Manager' : 'Manager'} View</button>
                    )
                }
                {
                    (
                        (role === 'hr' || role === 'hr_manager') && (
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
                (dashBoardContent === 'view' && role === 'hr') && (
                    <LeaveRequestHr />

                )
            }
            {
                (dashBoardContent === 'view' && role === 'hr_manager') && (
                    <LeaveRequestHrManager />
                )
            }
            {
                (dashBoardContent === 'registerEmployee' && (role === 'hr' || role === 'hr_manager')) && (
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
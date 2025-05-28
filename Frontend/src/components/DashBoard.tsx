import { useEffect, useState } from "react";
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
    const [activeTab, setActiveTab] = useState('leaveRequest');

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
                }
            } catch (error) {
                console.error(error);
            }
        }
        checkAuth();
    }, [navigate]);


    const tabs = [
        { key: 'leaveRequest', label: 'Request Leave', component: <LeaveRequestForm /> },
        { key: 'leaveBalance', label: 'Leave Balance', component: <LeaveBalances /> },
        { key: 'leaveHistory', label: 'Leave History', component: <LeaveHistory /> },
        ...(role === 'manager' ? [{ key: 'view', label: 'Manager View', component: <LeaveRequestManager /> }] : []),
        ...(role === 'hr' ? [
            { key: 'view', label: 'HR View', component: <LeaveRequestHr /> },
            { key: 'registerEmployee', label: 'Register Employee', component: <Registration /> }
        ] : []),
        ...(role === 'hr_manager' ? [
            { key: 'view', label: 'HR Manager View', component: <LeaveRequestHrManager /> },
            { key: 'registerEmployee', label: 'Register Employee', component: <Registration /> }
        ] : []),
        ...(role === 'director' ? [{ key: 'view', label: 'Director View', component: <LeaveRequestDirector /> }] : [])
    ];

    return (
        <div className="w-full h-full">
            {/* Tab Headers */}
            <div className="w-[70%] h-[100px] flex gap-[20px] mx-auto border-b border-gray-300 items-end">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`py-[10px] px-[15px] border-b-3 mb-[7px] 
                            ${activeTab === tab.key
                                ? 'border-[#4f39f6] text-[#4f39f6]'
                                : 'border-transparent text-black'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="w-[70%] mx-auto mt-4">
                {tabs.find(tab => tab.key === activeTab)?.component}
            </div>
        </div>
    );
}

export default DashBoard;

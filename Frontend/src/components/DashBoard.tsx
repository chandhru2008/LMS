import { useEffect, useState } from "react";
import LeaveRequestForm from "./LeaveRequestForm";
import LeaveHistory from "./LeaveHistory";
import LeaveBalances from "./LeaveBalance";
import Registration from "./Registration";
import LeaveRequestApproval from "./LeaveRequestApprovals";
import { useAuth } from "./AuthProvider";
import { useNavigate } from "react-router-dom";


function DashBoard() {

    const navigate = useNavigate();
    const [role, setRole] = useState('');
    const [activeTab, setActiveTab] = useState('leaveRequest');

    const { authData, login } = useAuth();

    useEffect(() => {
        if (authData) {
            setRole(authData.role);
            if (!login) {
                console.log(login)
                navigate('/login');
            }
        }
        console.log(authData)
    }, [authData, login, navigate]);


    const tabs = [
        { key: 'leaveRequest', label: 'Request Leave', component: <LeaveRequestForm /> },
        { key: 'leaveBalance', label: 'Leave Balance', component: <LeaveBalances /> },
        { key: 'leaveHistory', label: 'Leave History', component: <LeaveHistory /> },
        ...(role === 'hr' || role === 'hr_manager' ? [
            { key: 'registerEmployee', label: 'Register Employee', component: <Registration /> }
        ] : []),
        ...(role === 'hr' || role === 'hr_manager' || role === 'manager' || role === 'director' ? [
            { key: 'view', label: `Pending Approvals`, component: <LeaveRequestApproval /> }
        ] : [])

    ];

    return (
        <div className="w-full h-full">
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

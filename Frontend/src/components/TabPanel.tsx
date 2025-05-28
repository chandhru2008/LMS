import LeaveRequestForm from "./LeaveRequestForm";
import LeaveHistory from "./LeaveHistory";
import LeaveBalances from "./LeaveBalance";
import LeaveRequestDirector from "./LeaveRequestsComponents/LeaveRequestDirector";
import LeaveRequestHr from "./LeaveRequestsComponents/LeaveRequetHr";
import LeaveRequestManager from "./LeaveRequestsComponents/LeaveRequestManager";
import Registration from "./Registration";
import LeaveRequestHrManager from "./LeaveRequestsComponents/LeaveRequestHrManager";

interface TabPanelProps {
    activeTab: string;
    role: string;
}

const TabPanel: React.FC<TabPanelProps> = ({ activeTab, role }) => {
    switch (activeTab) {
        case 'leaveRequest':
            return <LeaveRequestForm />;
        case 'leaveBalance':
            return <LeaveBalances />;
        case 'leaveHistory':
            return <LeaveHistory />;
        case 'view':
            if (role === 'director') return <LeaveRequestDirector />;
            if (role === 'hr') return <LeaveRequestHr />;
            if (role === 'hr_manager') return <LeaveRequestHrManager />;
            if (role === 'manager') return <LeaveRequestManager />;
            return <div>Access Denied</div>;
        case 'registerEmployee':
            return (role === 'hr' || role === 'hr_manager') ? <Registration /> : <div>Access Denied</div>;
        default:
            return <div>Select a tab</div>;
    }
};

export default TabPanel;

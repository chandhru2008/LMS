import LeaveRequestForm from "./LeaveRequestForm";
import LeaveHistory from "./LeaveHistory";
import LeaveBalances from "./LeaveBalance";
import Registration from "./Registration";
import LeaveRequestHrManager from "./LeaveRequestApprovals";
import type { TabPanelProps } from "../types";


const TabPanel: React.FC<TabPanelProps> = ({ activeTab, role }) => {
    switch (activeTab) {
        case 'leaveRequest':
            return <LeaveRequestForm />;
        case 'leaveBalance':
            return <LeaveBalances />;
        case 'leaveHistory':
            return <LeaveHistory />;
        case 'PendingApproval':
           return <LeaveRequestHrManager />
        case 'registerEmployee':
            return (role === 'hr' || role === 'hr_manager') ? <Registration /> : <div>Access Denied</div>;
        default:
            return <div>Select a tab</div>;
    }
};

export default TabPanel;

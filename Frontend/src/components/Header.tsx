import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';


function Header() {
    const navigate = useNavigate();
    const [isLogin, setIsLogIn] = useState(false);
    const [data, setData] = useState<{ employeeName: string; role: string } | null>(null);
    const [showProfile, setShowProfile] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await fetch("https://lms-zwod.onrender.com/check-auth", {
                    method: "GET",
                    credentials: "include",
                });

                const result = await response.json();

                if (!response.ok) {
                    setIsLogIn(false);
                    if (result.message === "Invalid or expired token") {
                       throw new Error(result.message);
                    }
                } else {
                    setIsLogIn(true);
                    setData(result);
                }
            } catch (err) {
                console.error("Auth check failed:", err);
                setIsLogIn(false);
            }
        }

        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch('https://lms-zwod.onrender.com/log-out', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setIsLogIn(false);
                navigate("/login");
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className="w-full h-[80px] bg-[#005a9c] shadow-md flex items-center justify-between relative">
            <div className="w-[70%] h-[100%] flex justify-between items-center mx-auto">
                <h1 className="text-xl font-bold text-white">Leave Management System</h1>

                {isLogin && data ? (
                    <div className="relative">
                        <div
                            className="w-10 h-10 flex items-center justify-center text-white bg-blue-500 rounded-full cursor-pointer"
                            onClick={() => setShowProfile(prev => !prev)}
                        >
                            <h1 className="text-lg font-semibold">{data.employeeName[0]}</h1>
                        </div>




                        {showProfile && (
                            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-50 ">
                                <div className="px-4 py-3 border-b text-sm text-gray-700 flex flex-col gap-3">
                                    <div className="font-medium">{data.employeeName}</div>
                                    <div className="text-xs text-gray-500">Role : {data.role === 'employee' ? 'Employee' : data.role === 'hr' ? 'HR' : data.role === 'director' ? 'Director' : data.role === 'hr_manager' ? 'HR Manager' : 'Manager'}</div>
                                    {['hr', 'director', 'hr_manager', 'manager'].includes(data.role.toLowerCase()) ? (
                                        <div onClick={() => navigate('/calendar')} className="p-[10px] bg-[#3b5dfc] rounded text-white hover:cursor-pointer">Calendar View</div>
                                    ) : (
                                        <div></div>
                                    )}
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 text-sm"
                                >
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className="px-[15px] py-[8px] bg-[#ffffff] text-blue-500 rounded-[5px] hover:cursor-pointer"
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;

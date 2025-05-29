// AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

type AuthData = {
    name: string;
    email : string;
    role: 'hr' | 'manager' | 'hr_manager' | 'director' | 'employee';
};

type AuthContextType = {
    authData: AuthData | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authData, setAuthData] = useState<AuthData | null>(null);

    const fetchAuth = async () => {
        try {
            const res = await fetch('https://lms-zwod.onrender.com/check-auth',{
                method : 'GET',
                credentials : 'include'
            });
            if (!res.ok) throw new Error('Failed to fetch auth data');
            const data = await res.json();
            setAuthData(data);
        } catch (err) {
            console.log('Error in fetching authData : ',  err)
            setAuthData(null);
        }
    };

    useEffect(() => {
        fetchAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ authData }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};  
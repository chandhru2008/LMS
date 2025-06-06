// AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { IAuthContextType, IAuthData } from '../types';



const AuthContext = createContext<IAuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {

    const [authData, setAuthData] = useState<IAuthData | null>(null);
    const [login, setLogin] = useState<boolean>(false);

    const fetchAuth = async () => {
        try {
            const res = await fetch('https://lms-zwod.onrender.com/check-auth', {
                method: 'GET',
                credentials: 'include'
            });
            if (!res.ok) {
                setLogin(false)
            } else {
                const data = await res.json();
                setLogin(true);
                setAuthData(data);
            }

        } catch (err) {
            console.log('Error in fetching authData : ', err)
            setAuthData(null);
        }
    };

    useEffect(() => {
        fetchAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ authData, login, setLogin, setAuthData, fetchAuth }} >
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
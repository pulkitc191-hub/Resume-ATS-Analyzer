import { createContext, useEffect, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext(null);

export default function AppContextProvider({ children }) {
    const backendURL = "/resumeAnalyser/entry/v1";
    const serviceURL = "/resumeAnalyserCore/service/v1";
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasPreviousReport, setHasPreviousReport] = useState(false);
    const [userName, setUserName] = useState("");
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    useEffect(() => {
        fetch(`${serviceURL}/isValid`, { method: "POST", credentials: "include" })
            .then(response => response.ok ? response.json() : null)
            .then(data => {
                if (data) {
                    setUserName(data.username);
                    setHasPreviousReport(data.isPrevious);
                    setIsLoggedIn(true);
                }
            })
            .catch(() => undefined)
            .finally(() => setIsAuthChecked(true));
    }, []);

    return (
        <AppContext.Provider value={{
            backendURL, serviceURL, isLoggedIn, setIsLoggedIn,
            hasPreviousReport, setHasPreviousReport, userName, setUserName,
            isAuthChecked,
        }}>
            {children}
        </AppContext.Provider>
    );
}

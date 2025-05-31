import React ,{createContext,useState,useEffect,useContext}from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [CurrentUser, setCurrentUser] = useState(null);
    useEffect(() => {
        const userId = JSON.parse(localStorage.getItem('userId'));
        if (userId) {
            setCurrentUser(userId);
        }
    },[])

    const value={
        CurrentUser,
        setCurrentUser
    }
    return<AuthContext.Provider value={value}>
        {children}</AuthContext.Provider>

}
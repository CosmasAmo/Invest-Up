/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "./AppContext.jsx";

// Separate component for the provider
export const AppContextProvider = (props) => {

    axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedin, setIsLoggedin] = useState(false)
    const [userData, setUserData] = useState(false)

    const getAuthState = async () => {
        try {
            axios.defaults.withCredentials = true;
            const {data} = await axios.get(`${backendUrl}/api/user/data`);
            if(data.success){
                setIsLoggedin(true)
                setUserData(data.userData)
            }
        } catch (error) {
            setIsLoggedin(false)
            setUserData(null)
            console.error('Auth check failed:', error)
        }
    }

    const getUserData = async () => {
        try {
            axios.defaults.withCredentials = true;
            const {data} = await axios.get(`${backendUrl}/api/user/data`);
            
            if (data.success) {
                setUserData(data.userData);
                setIsLoggedin(true)
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message);
        }
    }

    useEffect(()=>{
        getAuthState();
    },[])

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData
    }

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    );
}




import React ,{useEffect}from 'react'
import { useNavigate, useRoutes } from 'react-router-dom'

//pages
import Profile from './components/user/Profile'
import Dashboard from './components/dashboard/Dashboard'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'

//authcontext
import { useAuth } from './authContext'

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth()
    const navigate = useNavigate()

   useEffect(()=>{
    const userIdFromStorage = localStorage.getItem('userId')

    if (userIdFromStorage) {
        setCurrentUser(userIdFromStorage)
    } 
    if (!userIdFromStorage&&["/auth","/signup"].includes(window.location.pathname))
    {
        navigate('/auth')
    }
    if(!userIdFromStorage&&window.location.pathname==="/auth")
    {
        navigate('/')
    }
   },[currentUser, setCurrentUser, navigate])

   let element = useRoutes([
        {
            path: '/',
            element: <Dashboard />
        },
        {
            path: '/auth',
            element: <Login />
        },
        {
            path: '/signup',
            element: <Signup />
        },
        {
            path: '/profile',
            element: <Profile />
        },
    ])
    return element
}

export default ProjectRoutes

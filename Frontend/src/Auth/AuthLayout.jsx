import React from 'react'
import { Outlet } from 'react-router-dom'
import logo from '../assets/Logo.png'

const AuthLayout = () => {

    

    return (
        <div className='flex flex-col items-center'>
            <div className="flex bg-[#C8E0FC] w-full px-6 py-4">
                <div className="flex items-center gap-3 cursor-default">
                    <img src={logo} alt="" className='h-10' />
                    <p className="text-3xl font-medium font text-blue-500">MediFind</p>
                </div>
            </div>
            {/* pages within the parent route, where this pharmacist layout is applied, are opened in the outlet below */}
            <Outlet />
        </div>
    )
}

export default AuthLayout
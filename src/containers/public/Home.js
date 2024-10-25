// Home.js
import React from 'react';
import GardenList from './GardenList'; 

const Home = () => {
    return (
        <div className='flex flex-col items-center p-6'>
            <h1 className='text-3xl font-bold mb-4'>Chào Mừng Đến Với Ứng Dụng Quản Lý Khu Vườn</h1>
            <GardenList /> 
        </div>
    );
};

export default Home;

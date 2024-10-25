import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimedb } from '../../firebaseConfig';
import { Link } from 'react-router-dom';

const GardenList = () => {
    const [gardens, setGardens] = useState([]);

    useEffect(() => {
        const gardensRef = ref(realtimedb, 'gardens');
        onValue(gardensRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const gardensArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setGardens(gardensArray);
            }
        });
    }, []);

    return (
        <div className='flex flex-col items-center min-h-screen bg-gray-100 py-8'>
            <h1 className='text-3xl font-extrabold mb-6 text-gray-800'>Danh Sách Khu Vườn</h1>
            <ul className='w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6 ml-40'> 
                {gardens.map(garden => (
                    <li key={garden.id} className='border p-6 rounded-lg shadow-lg bg-white transition duration-300 hover:shadow-2xl'>
                        <h2 className='text-2xl font-semibold text-gray-700 mb-2'>{garden.name}</h2>
                        <p className='text-lg text-gray-500'>Độ ẩm hiện tại: <span className='text-green-600 font-bold'>{garden.doAmDat.current}%</span></p>
    
                        <Link to={`/gardens/${garden.id}`}>
                            <button className='mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200'>
                                Xem chi tiết
                            </button>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
    
};

export default GardenList;

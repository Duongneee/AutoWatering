import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { realtimedb } from '../../firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';
import a from '../../asset/1.jpg';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";

const GardenList = () => {
    const [gardens, setGardens] = useState([]);
    const navigate = useNavigate();
    // const [devices, setDevices] = useState({});
    // const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const gardensRef = ref(realtimedb, 'gardens');

    //     onValue(gardensRef, (snapshot) => {
    //         const data = snapshot.val();
    //         if (data) {
    //             const gardensArray = Object.keys(data).map(key => ({
    //                 id: key,
    //                 ...data[key]
    //             }));
    //             setGardens(gardensArray);
    //         }
    //     });
    // }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userGardensRef = ref(realtimedb, `users/${user.uid}/gardens`);
                onValue(userGardensRef, (snapshot) => {
                    const gardenIds = snapshot.val() || {};
                    const gardensRef = ref(realtimedb, "gardens");
                    onValue(gardensRef, (snapshot) => {
                        const allGardens = snapshot.val() || {};
                        const linkedGardens = Object.keys(gardenIds).reduce((acc, id) => {
                            if (gardenIds[id] && allGardens[id]) { // Chỉ thêm nếu giá trị là true
                                acc.push({ id, ...allGardens[id] });
                            }
                            return acc;
                        }, []);
                        setGardens(linkedGardens);
                        // setLoading(false);
                    });
                });
            } else {
                console.log("User not logged in");
                // setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);





    const handleLogout = () => {
        // Xử lý đăng xuất, ví dụ xóa token hoặc thông tin người dùng
        localStorage.removeItem('token'); // Giả sử bạn lưu token trong localStorage
        navigate('/'); // Điều hướng về trang đăng nhập
    };

    return (
        <div className="flex flex-col items-center py-8 bg-gradient-to-br from-green-50 to-green-100">
            {/* Nút Đăng xuất */}
            <div className="w-full flex justify-end px-8">
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 font-medium shadow-md"
                >
                    Đăng xuất
                </button>
            </div>

            <div className='flex flex-col items-center min-h-screen bg-gray-100 py-8'>
                <h1 className='text-3xl font-extrabold mb-6 text-gray-800'>Danh Sách Khu Vườn</h1>

                <ul className='w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {gardens.map(garden => (
                        <li key={garden.id} className='border p-6 rounded-lg shadow-lg bg-white hover:shadow-2xl transform transition duration-300 hover:scale-105'>
                            <div className='mb-4'>
                                <img
                                    src={a}
                                    alt='a'
                                    className='w-full h-48 object-cover rounded-lg'
                                />
                            </div>
                            <h2 className='text-2xl font-semibold text-gray-700 mb-2'>{garden.name}</h2>
                            <p className='text-lg text-gray-500'>Độ ẩm hiện tại: <span className='text-green-600 font-bold'>{garden.doAmDat.current}%</span></p>

                            <Link to={`/gardens/${garden.id}`}>
                                <button className='mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-900 transition duration-200'>
                                    Xem chi tiết
                                </button>
                            </Link>
                        </li>
                    ))}
                </ul>

                <Link to={`/add-garden`}>
                    <button className='mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-900 transition duration-200'>
                        Thêm khu vườn
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default GardenList;

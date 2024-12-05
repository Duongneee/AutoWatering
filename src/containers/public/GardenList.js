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
                            if (gardenIds[id] && allGardens[id]) {
                                acc.push({ id, ...allGardens[id] });
                            }
                            return acc;
                        }, []);
                        setGardens(linkedGardens);
                    });
                });
            } else {
                console.log("User not logged in");
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-teal-50 to-blue-100">
            {/* Nút Đăng xuất */}
            <div className="w-full flex justify-end px-8 py-4">
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-5 py-2 rounded-md hover:bg-red-600 transition-all duration-200 font-medium shadow-lg"
                >
                    Đăng xuất
                </button>
            </div>

            {/* Tiêu đề */}
            <h1 className="text-4xl font-extrabold text-blue-800 mt-6 mb-10 text-center">
                Danh Sách Khu Vườn
            </h1>

            {/* Danh sách khu vườn */}
            <div className="grid w-full max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
                {gardens.map(garden => (
                    <div
                        key={garden.id}
                        className="border border-gray-300 rounded-lg shadow-lg bg-white hover:shadow-2xl transform transition-all duration-300 hover:scale-105"
                    >
                        <img
                            src={a}
                            alt="Garden"
                            className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="p-5">
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">{garden.name}</h2>
                            <p className="text-gray-600 text-base">
                                Độ ẩm hiện tại:{' '}
                                <span className="text-green-600 font-bold">
                                    {garden.doAmDat.current}%
                                </span>
                            </p>
                            <Link to={`/gardens/${garden.id}`}>
                                <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200">
                                    Xem chi tiết
                                </button>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {/* Nút thêm khu vườn */}
            <div className="mt-10">
                <Link to={`/add-garden`}>
                    <button className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg transition-all duration-200">
                        Thêm khu vườn
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default GardenList;

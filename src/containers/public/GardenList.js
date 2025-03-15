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

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-100 via-green-50 to-blue-200 px-6 py-12 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-7xl flex justify-between items-center mb-16">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent text-center mx-auto animate-fadeIn">
                    Danh Sách Khu Vườn
                </h1>
            </div>

            {/* Garden Grid - Centered */}
            <div className="w-full max-w-7xl flex justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {gardens.map(garden => (
                        <div
                            key={garden.id}
                            className="relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-3xl group border border-teal-100"
                        >
                            <div className="relative">
                                <img
                                    src={a}
                                    alt={garden.name}
                                    className="w-full h-60 object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            <div className="p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4 truncate group-hover:text-teal-600 transition-colors duration-300">
                                    {garden.name}
                                </h2>
                                <p className="text-gray-700 text-sm flex items-center gap-2 mb-4">
                                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Độ ẩm hiện tại: <span className="text-teal-700 font-semibold">{garden.doAmDat.current}%</span>
                                </p>
                                <Link to={`/gardens/${garden.id}`}>
                                    <button className="mt-4 w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-3 rounded-lg shadow-lg hover:from-teal-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                        </svg>
                                        Xem chi tiết
                                    </button>
                                </Link>
                            </div>
                            {/* Decorative Badge */}
                            <div className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg transform rotate-12 group-hover:scale-110 transition-all duration-300">
                                Active
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Animation Keyframes */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out;
                }
            `}</style>
        </div>
    );
};

export default GardenList;
import React, { useState, useEffect } from 'react';
import anonAvatar from '../../asset/anon-avatar.png';
import { useSelector } from 'react-redux';
import menuUser from '../../untils/menuUser';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { AiOutlineLogout } from 'react-icons/ai';
import { ref, onValue } from 'firebase/database';
import { realtimedb, auth } from '../../firebaseConfig';

const Sidebar = () => {
    const navigate = useNavigate();
    const { currentData } = useSelector((state) => state.user);
    const { gardenId } = useParams();
    const [gardenName, setGardenName] = useState('');
    const [userEmail, setUserEmail] = useState(''); // State mới để lưu email

    // Fetch garden name from Firebase
    useEffect(() => {
        if (!gardenId) return;

        const nameRef = ref(realtimedb, `gardens/${gardenId}/name`);
        const unsubscribe = onValue(nameRef, (snapshot) => {
            const name = snapshot.val();
            setGardenName(name || 'Khu vườn chưa có tên');
        });

        return () => unsubscribe();
    }, [gardenId]);

    // Fetch user email from Firebase
    useEffect(() => {
        const userId = auth.currentUser?.uid; // Lấy userId từ Firebase Auth
        if (!userId) return;

        const emailRef = ref(realtimedb, `users/${userId}/email`);
        const unsubscribe = onValue(emailRef, (snapshot) => {
            const email = snapshot.val();
            setUserEmail(email || 'Không có email');
        });

        return () => unsubscribe();
    }, []);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="w-[300px] h-screen bg-white shadow-2xl rounded-2xl p-6 flex flex-col items-center">
            {/* User Info */}
            <div className="w-full flex flex-col items-center mb-8">
                <img
                    src={currentData?.avatar || anonAvatar}
                    alt="avatar"
                    className="w-24 h-24 rounded-full border-4 border-green-200 shadow-md object-cover transition-transform duration-300 hover:scale-105"
                />
                <h2 className="mt-4 text-xl font-bold text-green-700">
                    {userEmail || currentData?.email || 'Người dùng'} {/* Hiển thị email */}
                </h2>
                {gardenId && (
                    <p className="text-green-600 text-sm mt-2 italic">
                        Khu vườn: <span className="font-semibold">{gardenName}</span>
                    </p>
                )}
            </div>

            {/* Menu */}
            <nav className="w-full flex flex-col gap-3">
                {menuUser.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item?.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive
                                ? 'bg-green-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-green-100 hover:text-green-700'
                            }`
                        }
                    >
                        <span className="text-xl">{item?.icon}</span>
                        <span className="font-medium">{item.text}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="mt-auto w-full flex items-center gap-3 px-4 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300"
            >
                <AiOutlineLogout size={22} />
                <span className="font-medium">Thoát</span>
            </button>
        </div>
    );
};

export default Sidebar;
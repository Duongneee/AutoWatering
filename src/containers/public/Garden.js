import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update, set } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AddGarden = () => {
    const [key, setKey] = useState('');
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                alert('Bạn cần đăng nhập để thực hiện chức năng này.');
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleSave = async () => {
        try {
            if (!userId) {
                alert('Không tìm thấy thông tin người dùng.');
                return;
            }

            const db = getDatabase();
            const keyRef = ref(db, `keys/${key}`);
            const keySnapshot = await get(keyRef);

            if (!keySnapshot.exists()) {
                alert('Key không hợp lệ hoặc không tồn tại.');
                return;
            }

            const gardenId = keySnapshot.val();
            const userGardensRef = ref(db, `users/${userId}/gardens/${gardenId}`);
            const userGardensSnapshot = await get(userGardensRef);

            if (userGardensSnapshot.exists()) {
                const gardenStatus = userGardensSnapshot.val();

                if (gardenStatus === true) {
                    alert('Khu vườn này đã tồn tại trong danh sách của bạn.');
                    return;
                } else if (gardenStatus === false) {
                    await set(userGardensRef, true);
                    alert('Khu vườn đã được kích hoạt lại thành công!');
                }
            } else {
                const updates = {};
                updates[`users/${userId}/gardens/${gardenId}`] = true;
                await update(ref(db), updates);

                alert('Khu vườn đã được thêm thành công vào danh sách của bạn!');
            }

            navigate('/gardens');
        } catch (error) {
            console.error('Lỗi khi thêm khu vườn:', error);
            alert('Có lỗi xảy ra khi thêm khu vườn.');
        }
    };

    const handleBack = () => {
        navigate('/gardens');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 flex items-center justify-center px-4 py-12">
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all hover:shadow-3xl animate-fade-in">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-extrabold text-center mt-8 mb-6 bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent tracking-tight">
                    Thêm Khu Vườn Mới
                </h1>

                {/* Form Content */}
                <div className="space-y-6">
                    <div className="relative group">
                        <label className="block text-sm font-medium text-gray-700 mb-1 transition-all duration-300 group-focus-within:text-teal-600">
                            Nhập key khu vườn
                        </label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-300 placeholder-gray-400 shadow-sm hover:shadow-md"
                            placeholder="Nhập key khu vườn"
                        />
                        <svg
                            className="absolute right-3 top-10 w-5 h-5 text-gray-400 group-focus-within:text-teal-500 transition-colors duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-3 9c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"></path>
                        </svg>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-4">
                        <button
                            onClick={handleSave}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:from-green-600 hover:to-teal-600 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Lưu
                        </button>

                        <button
                            onClick={handleBack}
                            className="w-full bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 py-3 rounded-xl font-semibold text-lg shadow-md hover:from-gray-400 hover:to-gray-500 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Trở về
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddGarden;

// Add this CSS to your global stylesheet or a <style> tag in your app
<style jsx global>{`
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fade-in {
        animation: fadeIn 0.5s ease-out forwards;
    }
`}</style>
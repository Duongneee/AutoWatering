// ... các import giữ nguyên
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update, set } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AddDevice = () => {
    const [key, setKey] = useState('');
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);
        try {
            if (!userId) {
                alert('Không tìm thấy thông tin người dùng.');
                setIsLoading(false);
                return;
            }

            const db = getDatabase();
            const keyRef = ref(db, `keys/${key}`);
            const keySnapshot = await get(keyRef);

            if (!keySnapshot.exists()) {
                alert('Key không hợp lệ hoặc không tồn tại.');
                setIsLoading(false);
                return;
            }

            const deviceId = keySnapshot.val();

            // Kiểm tra xem thiết bị đã được thêm bởi người dùng khác chưa
            const usersRef = ref(db, 'users');
            const usersSnapshot = await get(usersRef);
            let isDeviceTaken = false;

            if (usersSnapshot.exists()) {
                const users = usersSnapshot.val();
                for (const uid in users) {
                    const userDevices = users[uid].devices;
                    if (userDevices && userDevices[deviceId] === true) {
                        isDeviceTaken = true;
                        break;
                    }
                }
            }

            if (isDeviceTaken) {
                alert('Thiết bị này đã được thêm bởi một người dùng khác.');
                setIsLoading(false);
                return;
            }

            // Kiểm tra thiết bị trong danh sách của người dùng hiện tại
            const userDevicesRef = ref(db, `users/${userId}/devices/${deviceId}`);
            const userDevicesSnapshot = await get(userDevicesRef);

            if (userDevicesSnapshot.exists()) {
                const deviceStatus = userDevicesSnapshot.val();
                if (deviceStatus === true) {
                    alert('Thiết bị này đã tồn tại trong danh sách của bạn.');
                } else if (deviceStatus === false) {
                    await set(userDevicesRef, true);
                    alert('Thiết bị đã được kích hoạt lại thành công!');
                }
            } else {
                await set(userDevicesRef, true);
                alert('Thiết bị đã được thêm thành công vào danh sách của bạn!');
            }

            setIsLoading(false);
            navigate('/devices'); // Đổi đường dẫn điều hướng nếu cần
        } catch (error) {
            console.error('Lỗi khi thêm thiết bị:', error);
            alert('Có lỗi xảy ra khi thêm thiết bị.');
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/devices');
    };

    return (
        <div className="min-h-screen bg-green-100 flex items-center justify-center px-4 py-12">
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all hover:shadow-3xl animate-fade-in">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </div>

                <h1 className="text-3xl font-extrabold text-center mt-8 mb-6 bg-gradient-to-r from-green-500 to-teal-600 bg-clip-text text-transparent tracking-tight">
                    Thêm Thiết Bị Mới
                </h1>

                <div className="space-y-6">
                    <div className="relative group">
                        <label className="block text-sm font-medium text-gray-700 mb-1 transition-all duration-300 group-focus-within:text-teal-600">
                            Nhập key thiết bị
                        </label>
                        <input
                            type="text"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-300 placeholder-gray-400 shadow-sm hover:shadow-md"
                            placeholder="Nhập key thiết bị"
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

                    <div className="space-y-4">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className={`w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:from-green-600 hover:to-teal-600 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Đang xử lý...' : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Lưu
                                </>
                            )}
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

export default AddDevice;

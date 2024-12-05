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
        <div className='flex flex-col items-center min-h-screen bg-gradient-to-br from-green-200 to-blue-100 py-10'>
            <div className='bg-white shadow-2xl rounded-lg p-8 w-full max-w-lg'>
                <h1 className='text-2xl font-bold text-gray-700 mb-6 text-center'>
                    Thêm Khu Vườn Mới
                </h1>
                <div className='mb-4'>
                    <label className='block text-gray-600 font-medium mb-2'>
                        Nhập key khu vườn:
                    </label>
                    <input
                        type='text'
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className='w-full px-4 py-2 rounded-lg border focus:ring focus:ring-green-300 focus:outline-none'
                        placeholder='Nhập key khu vườn'
                    />
                </div>
                <button
                    onClick={handleSave}
                    className='w-full bg-green-500 text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-green-600 transition-transform transform hover:scale-105 mb-4'
                >
                    Lưu
                </button>
                <button
                    onClick={handleBack}
                    className='w-full bg-gray-400 text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-gray-500 transition-transform transform hover:scale-105'
                >
                    Trở về trang danh sách
                </button>
            </div>
        </div>
    );
};

export default AddGarden;

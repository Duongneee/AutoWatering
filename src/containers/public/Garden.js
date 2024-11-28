import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get, update, set } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AddGarden = () => {
    const [key, setKey] = useState('');
    const [userId, setUserId] = useState(null); // Lưu userId từ thông tin xác thực
    const navigate = useNavigate();

    // Lấy thông tin người dùng hiện tại
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid); // Lưu userId nếu người dùng đã đăng nhập
            } else {
                alert('Bạn cần đăng nhập để thực hiện chức năng này.');
                navigate('/login'); // Chuyển hướng về trang đăng nhập nếu chưa đăng nhập
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    // Hàm xử lý khi người dùng bấm nút Lưu
    const handleSave = async () => {
        try {
            if (!userId) {
                alert('Không tìm thấy thông tin người dùng.');
                return;
            }

            const db = getDatabase();

            // Kiểm tra key trong Firebase
            const keyRef = ref(db, `keys/${key}`);
            const keySnapshot = await get(keyRef);

            if (!keySnapshot.exists()) {
                alert('Key không hợp lệ hoặc không tồn tại.');
                return;
            }

            // Lấy gardenId từ key
            const gardenId = keySnapshot.val();

            // Kiểm tra xem khu vườn đã được thêm vào danh sách của user chưa
            const userGardensRef = ref(db, `users/${userId}/gardens/${gardenId}`);
            const userGardensSnapshot = await get(userGardensRef);

            if (userGardensSnapshot.exists()) {
                const gardenStatus = userGardensSnapshot.val(); // Lấy trạng thái khu vườn

                if (gardenStatus === true) {
                    // Nếu khu vườn đã tồn tại và đang ở trạng thái true
                    alert('Khu vườn này đã tồn tại trong danh sách của bạn.');
                    return;
                } else if (gardenStatus === false) {
                    // Nếu khu vườn tồn tại nhưng trạng thái là false, cập nhật thành true
                    await set(userGardensRef, true);
                    alert('Khu vườn đã được kích hoạt lại thành công!');
                }
            } else {
                // Nếu khu vườn chưa tồn tại, thêm khu vườn vào danh sách và gán trạng thái là true
                const updates = {};
                updates[`users/${userId}/gardens/${gardenId}`] = true;
                await update(ref(db), updates);

                alert('Khu vườn đã được thêm thành công vào danh sách của bạn!');
            }

            navigate('/gardens'); // Chuyển về trang danh sách khu vườn
        } catch (error) {
            console.error('Lỗi khi thêm khu vườn:', error);
            alert('Có lỗi xảy ra khi thêm khu vườn.');
        }
    };

    // Hàm xử lý khi nhấn nút "Trở về trang danh sách"
    const handleBack = () => {
        navigate('/gardens'); // Điều hướng về trang danh sách khu vườn
    };

    return (
        <div className='flex flex-col items-center min-h-screen bg-gray-100 py-8'>
            <h1 className='text-3xl font-extrabold mb-6 text-gray-800'>Thêm Khu Vườn Mới</h1>

            <div className='w-full max-w-md bg-white p-6 rounded-lg shadow-lg'>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2'>
                        Nhập key:
                    </label>
                    <input
                        type='text'
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        className='w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500'
                        placeholder='Nhập key khu vườn'
                    />
                </div>

                <button
                    onClick={handleSave}
                    className='w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 mb-4'
                >
                    Lưu
                </button>
                <button
                    onClick={handleBack}
                    className='w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition duration-200'
                >
                    Trở về trang danh sách
                </button>
            </div>
        </div>
    );
};

export default AddGarden;

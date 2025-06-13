import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { realtimedb } from '../../firebaseConfig';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { path } from '../../untils/constant';

const GroupOverview = () => {
    const { groupId } = useParams();
    const [devices, setDevices] = useState([]);
    const [groups, setGroups] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                console.log("User not logged in");
                setError("Vui lòng đăng nhập để xem tổng quan");
                setLoading(false);
                return;
            }

            setLoading(true);
            const userRef = ref(realtimedb, `users/${user.uid}`);
            onValue(userRef, (snapshot) => {
                const userData = snapshot.val() || {};
                const loadedGroups = userData.groups || {};
                console.log("Loaded groups:", loadedGroups); // Debug: Kiểm tra dữ liệu groups
                setGroups(loadedGroups);

                const devicesRef = ref(realtimedb, "devices");
                onValue(devicesRef, (snapshot) => {
                    const allDevices = snapshot.val() || {};
                    console.log("All devices from Firebase:", allDevices); // Debug: Kiểm tra tất cả devices
                    if (loadedGroups[groupId]) {
                        const groupDeviceIds = loadedGroups[groupId].devices || {};
                        console.log("Group device IDs:", groupDeviceIds); // Debug: Kiểm tra device IDs trong group
                        const linkedDevices = Object.keys(groupDeviceIds)
                            .filter((id) => groupDeviceIds[id] && allDevices[id])
                            .map((id) => ({ id, ...allDevices[id] }));
                        console.log("Linked devices:", linkedDevices); // Debug: Kiểm tra thiết bị được liên kết
                        setDevices(linkedDevices);
                    } else {
                        console.log(`Group ${groupId} not found`);
                        setDevices([]);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching devices:", error); // Debug: Ghi lỗi nếu có
                    setError("Lỗi khi tải dữ liệu thiết bị: " + error.message);
                    setLoading(false);
                });
            }, (error) => {
                console.error("Error fetching user data:", error); // Debug: Ghi lỗi nếu có
                setError("Lỗi khi tải dữ liệu người dùng: " + error.message);
                setLoading(false);
            });
        });

        return () => unsubscribe();
    }, [groupId]);

    const getPumpStatus = (status) => {
        switch (status) {
            case 1: return 'Bật';
            case 0: return 'Tắt';
            case 20: return 'Tự động - Tắt';
            case 21: return 'Tự động - Bật';
            default: return 'Không xác định';
        }
    };

    const getLatestTimestamp = (history) => {
        if (!history) return 'Chưa có dữ liệu';
        const timestamps = Object.values(history);
        if (timestamps.length === 0) return 'Chưa có dữ liệu';
        const latest = timestamps.reduce((latest, current) =>
            new Date(current.time) > new Date(latest.time) ? current : latest
        );
        return new Date(latest.time).toLocaleString('vi-VN');
    };

    if (loading) {
        return <div className="text-center text-gray-600">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="text-center text-red-600">{error}</div>;
    }

    if (!groups || !groups[groupId]) {
        return <div className="text-center text-red-600">Khu vực không tồn tại hoặc dữ liệu chưa tải</div>;
    }

    const group = groups[groupId];
    const groupDevices = devices; // Đã lọc trong useEffect

    return (
        <div className="min-h-screen bg-green-50 px-8 py-12 flex flex-col items-center">
            <div className="w-full max-w-7xl">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent text-center mb-8">
                    Tổng quan khu vực: {group.name}
                </h1>
                {groupDevices.length === 0 ? (
                    <p className="text-center text-gray-600">Không có thiết bị nào trong khu vực này.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {groupDevices.map(device => (
                            <div key={device.id} className="bg-white rounded-3xl shadow-md p-6 border border-teal-100">
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">{device.name}</h3>
                                <p className="text-gray-600 mb-2">
                                    Độ ẩm hiện tại: <span className="text-teal-700 font-medium">{device.doAmDat?.current ?? 'N/A'}%</span>
                                </p>
                                <p className="text-gray-600 mb-2">
                                    Độ ẩm tối đa: <span className="text-teal-700 font-medium">{device.doAmDat?.max ?? 'N/A'}%</span>
                                </p>
                                <p className="text-gray-600 mb-2">
                                    Độ ẩm tối thiểu: <span className="text-teal-700 font-medium">{device.doAmDat?.min ?? 'N/A'}%</span>
                                </p>
                                <p className="text-gray-600 mb-2">
                                    Thời gian gửi dữ liệu: <span className="text-teal-700 font-medium">{getLatestTimestamp(device.doAmDat?.history)}</span>
                                </p>
                                <p className="text-gray-600 mb-2">
                                    Trạng thái máy bơm: <span className="text-teal-700 font-medium">{getPumpStatus(device.mayBom?.trangThai)}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-8 text-center">
                    <Link to={path.DEVICELIST}>
                        <button className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300">
                            Quay lại danh sách thiết bị
                        </button>
                    </Link>
                </div>
            </div>
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

export default GroupOverview;
import React, { useEffect, useState } from "react";
import { ref, onValue, set, remove, update } from "firebase/database";
import { realtimedb } from "../../firebaseConfig";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom"; // Import Link để điều hướng
import a from "../../asset/1.jpg"; // Hình ảnh khu vườn

const AdminPage = () => {
    const [users, setUsers] = useState({});
    const [gardens, setGardens] = useState({});
    const [selectedTab, setSelectedTab] = useState("users");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [currentUser, setCurrentUser] = useState(null);

    // Kiểm tra quyền admin
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                console.log("Admin logged in:", user.uid);
            } else {
                setCurrentUser(null);
                console.log("No user logged in");
            }
        });
        return () => unsubscribe();
    }, []);

    // Lấy dữ liệu từ Firebase
    useEffect(() => {
        const usersRef = ref(realtimedb, "users");
        const gardensRef = ref(realtimedb, "gardens");

        onValue(usersRef, (snapshot) => setUsers(snapshot.val() || {}));
        onValue(gardensRef, (snapshot) => setGardens(snapshot.val() || {}));
    }, []);

    // Thêm người dùng mới
    const addUser = () => {
        const newUserId = `user_${Date.now()}`;
        set(ref(realtimedb, `users/${newUserId}`), {
            email: formData.email || "newuser@example.com",
            gardens: {},
        });
        setShowModal(false);
        setFormData({});
    };

    // Thêm khu vườn mới
    const addGarden = (userId) => {
        const newGardenId = `garden_${Date.now()}`;
        const gardenData = {
            name: formData.name || "Khu Vườn Mới",
            doAmDat: { current: 50, max: 95, min: 70 },
            mayBom: { trangThai: "Tắt" },
        };

        set(ref(realtimedb, `gardens/${newGardenId}`), gardenData);
        set(ref(realtimedb, `users/${userId}/gardens/${newGardenId}`), true);
        setShowModal(false);
        setFormData({});
    };

    // Xóa người dùng
    const deleteUser = (userId) => {
        remove(ref(realtimedb, `users/${userId}`));
    };

    // Xóa khu vườn
    const deleteGarden = (gardenId, userId) => {
        remove(ref(realtimedb, `gardens/${gardenId}`));
        if (userId) {
            remove(ref(realtimedb, `users/${userId}/gardens/${gardenId}`));
        }
    };

    // Cập nhật trạng thái máy bơm
    const togglePump = (gardenId, currentStatus) => {
        update(ref(realtimedb, `gardens/${gardenId}/mayBom`), {
            trangThai: currentStatus === "Bật" ? "Tắt" : "Bật",
        });
    };

    // Render danh sách khu vườn của user (dạng list trong tab Users)
    const renderUserGardens = (userGardens, userId) => {
        if (!userGardens) return <span className="text-gray-500">Chưa có khu vườn</span>;
        return Object.keys(userGardens).map((gardenId) => {
            const garden = gardens[gardenId];
            return garden ? (
                <div key={gardenId} className="p-3 bg-green-50 rounded-lg mb-2 flex justify-between items-center shadow-sm">
                    <div>
                        <p className="font-semibold text-green-700">{garden.name}</p>
                        <p className="text-sm text-gray-600">Độ ẩm: {garden.doAmDat.current}%</p>
                        <p className="text-sm text-gray-600">Máy bơm: {garden.mayBom.trangThai}</p>
                    </div>
                    <button
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition duration-200"
                        onClick={() => deleteGarden(gardenId, userId)}
                    >
                        Xóa
                    </button>
                </div>
            ) : null;
        });
    };

    if (!currentUser) {
        return <div className="text-center p-8 text-gray-600">Vui lòng đăng nhập để truy cập trang Admin.</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-64 bg-green-100 text-green-800 p-6 fixed h-full shadow-lg">
                <h2 className="text-2xl font-bold mb-10 text-green-700">Admin Panel</h2>
                <ul>
                    <li
                        className={`py-3 px-4 mb-2 cursor-pointer rounded-lg transition duration-200 ${
                            selectedTab === "users" ? "bg-green-200 text-green-900" : "hover:bg-green-200"
                        }`}
                        onClick={() => setSelectedTab("users")}
                    >
                        Quản Lý Người Dùng
                    </li>
                    <li
                        className={`py-3 px-4 cursor-pointer rounded-lg transition duration-200 ${
                            selectedTab === "gardens" ? "bg-green-200 text-green-900" : "hover:bg-green-200"
                        }`}
                        onClick={() => setSelectedTab("gardens")}
                    >
                        Quản Lý Khu Vườn
                    </li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="ml-64 p-8 w-full">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-green-700">
                        {selectedTab === "users" ? "Quản Lý Người Dùng" : "Quản Lý Khu Vườn"}
                    </h1>
                    <button
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200 shadow-md"
                        onClick={() => setShowModal(true)}
                    >
                        Thêm {selectedTab === "users" ? "Người Dùng" : "Khu Vườn"}
                    </button>
                </div>

                {/* Users Tab */}
                {selectedTab === "users" && (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-green-100 text-green-800">
                                <tr>
                                    <th className="py-4 px-6 text-left font-semibold">ID</th>
                                    <th className="py-4 px-6 text-left font-semibold">Email</th>
                                    <th className="py-4 px-6 text-left font-semibold">Khu Vườn</th>
                                    <th className="py-4 px-6 text-left font-semibold">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(users).map(([uid, user]) => (
                                    <tr key={uid} className="border-b hover:bg-green-50 transition duration-100">
                                        <td className="py-4 px-6 text-gray-700">{uid.slice(0, 8)}...</td>
                                        <td className="py-4 px-6 text-gray-700">{user.email}</td>
                                        <td className="py-4 px-6">{renderUserGardens(user.gardens, uid)}</td>
                                        <td className="py-4 px-6 flex space-x-2">
                                            <button
                                                className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 transition duration-200"
                                                onClick={() => {
                                                    setFormData({ userId: uid });
                                                    setShowModal(true);
                                                }}
                                            >
                                                Thêm Khu Vườn
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition duration-200"
                                                onClick={() => deleteUser(uid)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Gardens Tab - Grid Layout */}
                {selectedTab === "gardens" && (
                    <div className="w-full flex justify-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {Object.entries(gardens).map(([gardenId, garden]) => (
                                <div
                                    key={gardenId}
                                    className="relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-3xl group border border-green-100"
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
                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 truncate group-hover:text-green-600 transition-colors duration-300">
                                            {garden.name}
                                        </h2>
                                        <p className="text-gray-700 text-sm flex items-center gap-2 mb-4">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            Độ ẩm hiện tại: <span className="text-green-700 font-semibold">{garden.doAmDat.current}%</span>
                                        </p>
                                        <div className="flex flex-col space-y-3">
                                            <div className="flex justify-between items-center">
                                                <button
                                                    className={`px-4 py-2 rounded-lg text-white font-semibold transition duration-200 ${
                                                        garden.mayBom.trangThai === "Bật" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                                                    }`}
                                                    onClick={() => togglePump(gardenId, garden.mayBom.trangThai)}
                                                >
                                                    {garden.mayBom.trangThai}
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200"
                                                    onClick={() => deleteGarden(gardenId, Object.keys(users).find(uid => users[uid]?.gardens?.[gardenId]))}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                            <Link to={`/gardens/${gardenId}`}>
                                                <button className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-lg shadow-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-1">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                    </svg>
                                                    Xem chi tiết
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                    {/* Decorative Badge */}
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg transform rotate-12 group-hover:scale-110 transition-all duration-300">
                                        {garden.mayBom.trangThai === "Bật" ? "Active" : "Inactive"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-xl w-96 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-green-700">
                            {selectedTab === "users" && !formData.userId ? "Thêm Người Dùng" : "Thêm Khu Vườn"}
                        </h2>
                        <input
                            type="text"
                            placeholder={selectedTab === "users" && !formData.userId ? "Email" : "Tên khu vườn"}
                            className="w-full p-3 mb-6 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200"
                            value={formData.email || formData.name || ""}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    [selectedTab === "users" && !formData.userId ? "email" : "name"]: e.target.value,
                                })
                            }
                        />
                        <div className="flex justify-end space-x-4">
                            <button
                                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500 transition duration-200"
                                onClick={() => setShowModal(false)}
                            >
                                Hủy
                            </button>
                            <button
                                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200"
                                onClick={() => (selectedTab === "users" && !formData.userId ? addUser() : addGarden(formData.userId))}
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

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

export default AdminPage;
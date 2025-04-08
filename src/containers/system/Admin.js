import React, { useEffect, useState } from "react";
import { ref, onValue, set, remove, update } from "firebase/database";
import { realtimedb } from "../../firebaseConfig";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import a from "../../asset/1.jpg"; // Garden image

const AdminPage = () => {
    const [users, setUsers] = useState({});
    const [gardens, setGardens] = useState({});
    const [keys, setKeys] = useState({});
    const [selectedTab, setSelectedTab] = useState("users");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [gardenToDelete, setGardenToDelete] = useState(null);
    const [inputKey, setInputKey] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                console.log("Admin logged in:", user.uid);
            } else {
                setCurrentUser(null);
                console.log("No user logged in");
                navigate("/");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        const usersRef = ref(realtimedb, "users");
        const gardensRef = ref(realtimedb, "gardens");
        const keysRef = ref(realtimedb, "keys");

        onValue(usersRef, (snapshot) => setUsers(snapshot.val() || {}));
        onValue(gardensRef, (snapshot) => setGardens(snapshot.val() || {}));
        onValue(keysRef, (snapshot) => setKeys(snapshot.val() || {}));
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };

    const getKeyFromGardenId = (gardenId) => {
        return Object.entries(keys).find(([_, value]) => value === gardenId)?.[0] || "N/A";
    };

    const addGarden = () => {
        const newGardenId = formData.gardenId || `garden_${Date.now()}`;
        const newKey = formData.key || `key_${Object.keys(keys).length + 1}`;
        const currentTime = new Date().toISOString();
        const gardenData = {
            location: {
                Latitude: formData.latitude || 21.028511,
                Longitude: formData.longitude || 105.83416,
            },
            doAmDat: {
                current: formData.currentHumidity || 50,
                history: {
                    timestamp01: {
                        time: "2024-10-20T10:00:00Z",
                        value: 80,
                    },
                    timestamp02: {
                        time: "2024-10-21T10:00:00Z",
                        value: 85,
                    },
                    timestamp03: {
                        time: currentTime,
                        value: formData.currentHumidity || 50,
                    },
                },
                max: formData.maxHumidity || 95,
                min: formData.minHumidity || 70,
            },
            mayBom: {
                trangThai: "Tắt",
            },
            name: formData.name || "New Garden",
            time: formData.time || 30,
        };

        set(ref(realtimedb, `gardens/${newGardenId}`), gardenData);
        set(ref(realtimedb, `keys/${newKey}`), newGardenId);

        setShowModal(false);
        setFormData({});
    };

    const deleteUser = (userId) => {
        remove(ref(realtimedb, `users/${userId}`));
    };

    const handleDeleteGarden = (gardenId, userId) => {
        setGardenToDelete({ gardenId, userId });
        setShowDeleteConfirm(true);
    };

    const confirmDeleteGarden = () => {
        if (!gardenToDelete) return;

        const { gardenId, userId } = gardenToDelete;
        const correctKey = getKeyFromGardenId(gardenId);

        if (inputKey === correctKey) {
            remove(ref(realtimedb, `gardens/${gardenId}`));
            if (userId) {
                remove(ref(realtimedb, `users/${userId}/gardens/${gardenId}`));
            }
            const keyToDelete = Object.entries(keys).find(([_, value]) => value === gardenId)?.[0];
            if (keyToDelete) {
                remove(ref(realtimedb, `keys/${keyToDelete}`));
            }
            setShowDeleteConfirm(false);
            setInputKey("");
            setGardenToDelete(null);
        } else {
            alert("Key không đúng. Vui lòng nhập lại!");
        }
    };

    const togglePump = (gardenId, currentStatus) => {
        update(ref(realtimedb, `gardens/${gardenId}/mayBom`), {
            trangThai: currentStatus === "On" ? "Off" : "On",
        });
    };

    const viewGardenDetail = (gardenId) => {
        navigate(`/garden/${gardenId}`);
    };

    if (!currentUser) {
        return <div className="text-center p-8 text-gray-600">Please log in to access the Admin page.</div>;
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
            <div className="w-72 bg-gradient-to-b from-green-600 to-green-800 text-white p-6 fixed h-full shadow-2xl flex flex-col">
                <h2 className="text-3xl font-extrabold mb-10 text-white tracking-tight flex items-center gap-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zm0 8c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path>
                    </svg>
                    Admin Dashboard
                </h2>
                <ul className="space-y-6 flex-grow">
                    <li
                        className={`py-3 px-4 cursor-pointer rounded-lg transition duration-300 flex items-center gap-3 ${selectedTab === "users" ? "bg-white text-green-800 shadow-md" : "hover:bg-green-700"}`}
                        onClick={() => setSelectedTab("users")}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        <span className="font-semibold">Manage Users</span>
                    </li>
                    <li
                        className={`py-3 px-4 cursor-pointer rounded-lg transition duration-300 flex items-center gap-3 ${selectedTab === "gardens" ? "bg-white text-green-800 shadow-md" : "hover:bg-green-700"}`}
                        onClick={() => setSelectedTab("gardens")}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 11h18m-9 4v5m-4-5h8m-8 0v5m4-5v5"></path>
                        </svg>
                        <span className="font-semibold">Manage Gardens</span>
                    </li>
                    <li
                        className={`py-3 px-4 cursor-pointer rounded-lg transition duration-300 flex items-center gap-3 hover:bg-green-700`}
                        onClick={() => setShowModal(true)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                        <span className="font-semibold">Add Garden</span>
                    </li>
                </ul>
                <div className="mt-auto">
                    <button
                        className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 flex items-center justify-center gap-3 shadow-md"
                        onClick={handleLogout}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        <span className="font-semibold">Logout</span>
                    </button>
                </div>
            </div>

            <div className="ml-72 p-10 w-full">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-extrabold text-green-800 tracking-tight">
                        {selectedTab === "users" ? "User Management" : "Garden Management"}
                    </h1>
                </div>

                {selectedTab === "users" && (
                    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                                <tr>
                                    <th className="py-4 px-6 text-left font-semibold">ID</th>
                                    <th className="py-4 px-6 text-left font-semibold">Email</th>
                                    <th className="py-4 px-6 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(users)
                                    .filter(([_, user]) => user.role !== 1)
                                    .map(([uid, user]) => (
                                        <tr key={uid} className="border-b hover:bg-green-50 transition duration-200">
                                            <td className="py-4 px-6 text-gray-700">{uid.slice(0, 8)}...</td>
                                            <td className="py-4 px-6 text-gray-700">{user.email}</td>
                                            <td className="py-4 px-6">
                                                <button
                                                    className="bg-red-500 text-white px-4 py-1 rounded-full hover:bg-red-600 transition duration-200 shadow-md"
                                                    onClick={() => deleteUser(uid)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {selectedTab === "gardens" && (
                    <div className="w-full">
                        <div className="space-y-10">
                            {Object.entries(users)
                                .filter(([_, user]) => user.role !== 1)
                                .map(([userId, user]) => (
                                    <div key={userId} className="bg-white rounded-xl shadow-xl p-6">
                                        <h2 className="text-2xl font-bold text-green-700 mb-6">
                                            {user.email} <span className="text-sm text-gray-500">({userId.slice(0, 8)}...)</span>
                                        </h2>
                                        {user.gardens && Object.keys(user.gardens).length > 0 ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {Object.entries(user.gardens)
                                                    .filter(([_, status]) => status === true)
                                                    .map(([gardenId]) => {
                                                        const garden = gardens[gardenId];
                                                        const key = getKeyFromGardenId(gardenId);
                                                        return garden ? (
                                                            <div
                                                                key={gardenId}
                                                                className="relative bg-gray-50 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-green-100 cursor-pointer"
                                                                onClick={() => viewGardenDetail(gardenId)}
                                                            >
                                                                <div className="relative">
                                                                    <img
                                                                        src={a}
                                                                        alt={garden.name}
                                                                        className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                                                </div>
                                                                <div className="p-5">
                                                                    <h3 className="text-xl font-semibold text-gray-900 mb-3 truncate">
                                                                        {garden.name}
                                                                    </h3>
                                                                    <p className="text-gray-600 text-sm mb-2">
                                                                        Key: <span className="font-semibold text-green-600">{key}</span>
                                                                    </p>
                                                                    <p className="text-gray-600 text-sm mb-2">
                                                                        Garden ID: <span className="font-semibold text-green-600">{gardenId}</span>
                                                                    </p>
                                                                    <p className="text-gray-600 text-sm mb-2">
                                                                        Humidity: <span className="font-semibold text-green-600">{garden.doAmDat.current}%</span>
                                                                    </p>
                                                                    <div className="flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                                                                        <button
                                                                            className={`px-3 py-1 rounded-full text-white text-sm font-medium transition duration-200 shadow-md ${garden.mayBom.trangThai === "On" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                                                                            onClick={() => togglePump(gardenId, garden.mayBom.trangThai)}
                                                                        >
                                                                            {garden.mayBom.trangThai}
                                                                        </button>
                                                                        <button
                                                                            className="bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600 transition duration-200 shadow-md"
                                                                            onClick={() => handleDeleteGarden(gardenId, userId)}
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="absolute top-3 right-3 bg-gradient-to-r from-green-400 to-teal-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                                                                    {garden.mayBom.trangThai === "On" ? "Active" : "Inactive"}
                                                                </div>
                                                            </div>
                                                        ) : null;
                                                    })}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">No gardens assigned to this user.</p>
                                        )}
                                    </div>
                                ))}

                            <div className="bg-white rounded-xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold text-green-700 mb-6">Unassigned Gardens</h2>
                                {Object.entries(gardens).length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {Object.entries(gardens)
                                            .filter(([gardenId]) => {
                                                return !Object.values(users).some(user => user.gardens && user.gardens[gardenId]);
                                            })
                                            .map(([gardenId, garden]) => {
                                                const key = getKeyFromGardenId(gardenId);
                                                return (
                                                    <div
                                                        key={gardenId}
                                                        className="relative bg-gray-50 rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-green-100 cursor-pointer"
                                                        onClick={() => viewGardenDetail(gardenId)}
                                                    >
                                                        <div className="relative">
                                                            <img
                                                                src={a}
                                                                alt={garden.name}
                                                                className="w-full h-48 object-cover transition-transform duration-500 hover:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                                        </div>
                                                        <div className="p-5">
                                                            <h3 className="text-xl font-semibold text-gray-900 mb-3 truncate">{garden.name}</h3>
                                                            <p className="text-gray-600 text-sm mb-2">
                                                                Key: <span className="font-semibold text-green-600">{key}</span>
                                                            </p>
                                                            <p className="text-gray-600 text-sm mb-2">
                                                                Garden ID: <span className="font-semibold text-green-600">{gardenId}</span>
                                                            </p>
                                                            <p className="text-gray-600 text-sm mb-2">
                                                                Humidity: <span className="font-semibold text-green-600">{garden.doAmDat.current}%</span>
                                                            </p>
                                                            <div className="flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                                                                <button
                                                                    className={`px-3 py-1 rounded-full text-white text-sm font-medium transition duration-200 shadow-md ${garden.mayBom.trangThai === "On" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                                                                    onClick={() => togglePump(gardenId, garden.mayBom.trangThai)}
                                                                >
                                                                    {garden.mayBom.trangThai}
                                                                </button>
                                                                <button
                                                                    className="bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600 transition duration-200 shadow-md"
                                                                    onClick={() => handleDeleteGarden(gardenId, null)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="absolute top-3 right-3 bg-gradient-to-r from-green-400 to-teal-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                                                            {garden.mayBom.trangThai === "On" ? "Active" : "Inactive"}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No unassigned gardens.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl w-96 shadow-2xl transform transition-all duration-300 scale-100 hover:scale-105">
                        <h2 className="text-2xl font-bold mb-6 text-green-700 tracking-tight">Add New Garden</h2>
                        <input
                            type="text"
                            placeholder="Key (e.g., key_4)"
                            className="w-full p-3 mb-4 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-gray-50"
                            value={formData.key || ""}
                            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Garden ID (e.g., gardenId4)"
                            className="w-full p-3 mb-4 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-gray-50"
                            value={formData.gardenId || ""}
                            onChange={(e) => setFormData({ ...formData, gardenId: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Garden Name"
                            className="w-full p-3 mb-4 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-gray-50"
                            value={formData.name || ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Latitude"
                            className="w-full p-3 mb-4 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-gray-50"
                            value={formData.latitude || ""}
                            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                        />
                        <input
                            type="number"
                            placeholder="Longitude"
                            className="w-full p-3 mb-4 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-gray-50"
                            value={formData.longitude || ""}
                            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                        />
                        <input
                            type="number"
                            placeholder="Current Humidity"
                            className="w-full p-3 mb-4 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-gray-50"
                            value={formData.currentHumidity || ""}
                            onChange={(e) => setFormData({ ...formData, currentHumidity: parseInt(e.target.value) })}
                        />
                        <input
                            type="number"
                            placeholder="Max Humidity"
                            className="w-full p-3 mb-4 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-gray-50"
                            value={formData.maxHumidity || ""}
                            onChange={(e) => setFormData({ ...formData, maxHumidity: parseInt(e.target.value) })}
                        />
                        <input
                            type="number"
                            placeholder="Min Humidity"
                            className="w-full p-3 mb-4 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-gray-50"
                            value={formData.minHumidity || ""}
                            onChange={(e) => setFormData({ ...formData, minHumidity: parseInt(e.target.value) })}
                        />
                        <input
                            type="number"
                            placeholder="Time (minutes)"
                            className="w-full p-3 mb-4 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200 bg-gray-50"
                            value={formData.time || ""}
                            onChange={(e) => setFormData({ ...formData, time: parseInt(e.target.value) })}
                        />
                        <div className="flex justify-end space-x-4">
                            <button
                                className="bg-gray-400 text-white px-6 py-2 rounded-full hover:bg-gray-500 transition duration-200 shadow-md"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-2 rounded-full hover:from-green-600 hover:to-teal-700 transition duration-200 shadow-md"
                                onClick={addGarden}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl w-96 shadow-2xl transform transition-all duration-300 scale-100 hover:scale-105">
                        <h2 className="text-2xl font-bold mb-6 text-red-700 tracking-tight">Xác nhận xóa khu vườn</h2>
                        <p className="text-gray-600 mb-4">
                            Vui lòng nhập key của khu vườn <span className="font-semibold">{gardenToDelete?.gardenId}</span> để xác nhận xóa:
                        </p>
                        <input
                            type="text"
                            placeholder="Nhập key (e.g., key_1)"
                            className="w-full p-3 mb-4 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-200 bg-gray-50"
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                        />
                        <div className="flex justify-end space-x-4">
                            <button
                                className="bg-gray-400 text-white px-6 py-2 rounded-full hover:bg-gray-500 transition duration-200 shadow-md"
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setInputKey("");
                                    setGardenToDelete(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 text-white px-6 py-2 rounded-full hover:bg-red-600 transition duration-200 shadow-md"
                                onClick={confirmDeleteGarden}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
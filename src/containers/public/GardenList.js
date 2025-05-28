import React, { useState, useEffect } from 'react';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { realtimedb } from '../../firebaseConfig';
import { Link } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import a from '../../asset/1.jpg';

const DeviceCard = ({ device, onRemoveDeviceFromGroup, groupId }) => (
    <div className="relative bg-white rounded-3xl shadow-md overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-xl group border border-teal-100">
        <div className="relative">
            <img
                src={a}
                alt={device.name}
                className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 truncate group-hover:text-teal-600 transition-colors duration-300">
                {device.name}
            </h2>
            <p className="text-gray-600 text-sm flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Độ ẩm: <span className="text-teal-700 font-medium">{device.doAmDat?.current ?? 'N/A'}%</span>
            </p>
            <div className="flex gap-3">
                <Link to={`/devices/${device.id}`} className="flex-1">
                    <button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:from-teal-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                        Xem chi tiết
                    </button>
                </Link>
                {groupId && onRemoveDeviceFromGroup && (
                    <button
                        onClick={() => onRemoveDeviceFromGroup(groupId, device.id)}
                        className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-all duration-300"
                    >
                        Xóa
                    </button>
                )}
            </div>
        </div>
        <div className="absolute top-3 right-3 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-md group-hover:scale-105 transition-all duration-300">
            Active
        </div>
    </div>
);

const AddDeviceToGroupForm = ({ groupId, devices, groups, onAddDeviceToGroup }) => {
    const [selectedDevice, setSelectedDevice] = useState('');

    const unassignedDevices = devices.filter(device => {
        return !Object.values(groups).some(group => group.devices && group.devices[device.id]);
    });

    const handleAdd = () => {
        if (!selectedDevice) return;
        onAddDeviceToGroup(groupId, selectedDevice);
        setSelectedDevice('');
    };

    return (
        <div className="mt-4 bg-white p-5 rounded-xl shadow-md border border-teal-100">
            <div className="flex gap-4">
                <select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200 bg-gray-50"
                >
                    <option value="">Chọn thiết bị</option>
                    {unassignedDevices.map(device => (
                        <option key={device.id} value={device.id}>{device.name}</option>
                    ))}
                </select>
                <button
                    onClick={handleAdd}
                    className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300"
                >
                    Thêm
                </button>
            </div>
            {unassignedDevices.length === 0 && (
                <p className="text-gray-600 text-sm mt-2">Không có thiết bị nào chưa được phân nhóm.</p>
            )}
        </div>
    );
};

const GroupSection = ({ group, groupId, devices, groups, onAddDeviceToGroup, onDeleteGroup, onRemoveDeviceFromGroup }) => {
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div className="mb-12">
            <div className="flex flex-col items-center mb-6 bg-teal-50 p-5 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-teal-800 mb-4">{group.name}</h2>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-teal-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300"
                    >
                        {showAddForm ? 'Ẩn' : 'Thêm thiết bị'}
                    </button>
                    <Link to={`/overview/${groupId}`}>
                        <button
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300"
                        >
                            Xem tổng quan
                        </button>
                    </Link>
                    <button
                        onClick={() => onDeleteGroup(groupId)}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-600 transition-all duration-300"
                    >
                        Xóa nhóm
                    </button>
                </div>
            </div>
            {showAddForm && (
                <AddDeviceToGroupForm
                    groupId={groupId}
                    devices={devices}
                    groups={groups}
                    onAddDeviceToGroup={onAddDeviceToGroup}
                />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {devices
                    .filter(device => group.devices && group.devices[device.id])
                    .map(device => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            groupId={groupId}
                            onRemoveDeviceFromGroup={onRemoveDeviceFromGroup}
                        />
                    ))}
            </div>
        </div>
    );
};

const UnassignedDevicesSection = ({ devices, groups }) => {
    const unassignedDevices = devices.filter(device => {
        return !Object.values(groups).some(group => group.devices && group.devices[device.id]);
    });

    if (unassignedDevices.length === 0) return null;

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-teal-800 mb-6 bg-teal-50 p-5 rounded-xl shadow-sm text-center">Thiết Bị Chưa Được Phân Nhóm</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {unassignedDevices.map(device => (
                    <DeviceCard key={device.id} device={device} />
                ))}
            </div>
        </div>
    );
};

const AddGroupForm = ({ newGroupName, setNewGroupName, onAddGroup, isOpen, setIsOpen }) => (
    <div className="w-full max-w-7xl mb-12 flex justify-center">
        {!isOpen ? (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-10 py-4 rounded-xl shadow-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 flex items-center gap-2"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Thêm Nhóm Mới
            </button>
        ) : (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-teal-100 transform transition-all duration-300 animate-slideIn w-full max-w-lg">
                <h2 className="text-3xl font-bold text-teal-800 mb-6 text-center">Thêm Nhóm Mới</h2>
                <div className="flex gap-4 items-center">
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Nhập tên nhóm"
                        className="flex-1 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-700 placeholder-gray-400 transition-all duration-200 bg-gray-50"
                    />
                    <button
                        onClick={onAddGroup}
                        className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-8 py-4 rounded-lg shadow-md hover:from-teal-600 hover:to-teal-700 transition-all duration-300"
                    >
                        Thêm
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-4 rounded-lg shadow-md hover:bg-gray-400 transition-all duration-300"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        )}
    </div>
);

const DeviceList = () => {
    const [devices, setDevices] = useState([]);
    const [groups, setGroups] = useState({});
    const [newGroupName, setNewGroupName] = useState('');
    const [error, setError] = useState(null);
    const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                console.log("User not logged in");
                setError("Vui lòng đăng nhập để xem danh sách thiết bị");
                setLoading(false);
                return;
            }

            setLoading(true);
            const userRef = ref(realtimedb, `users/${user.uid}`);
            onValue(userRef, (snapshot) => {
                const userData = snapshot.val() || {};
                const loadedGroups = userData.groups || {};
                const userDeviceIds = userData.devices || {};
                console.log("Loaded groups:", loadedGroups); // Debug: Kiểm tra groups
                console.log("User device IDs:", userDeviceIds); // Debug: Kiểm tra device IDs của user
                setGroups(loadedGroups);

                const devicesRef = ref(realtimedb, "devices");
                onValue(devicesRef, (snapshot) => {
                    const allDevices = snapshot.val() || {};
                    console.log("All devices:", allDevices); // Debug: Kiểm tra tất cả devices
                    // Lấy tất cả thiết bị của user từ userData.devices
                    const linkedDevices = Object.keys(userDeviceIds)
                        .filter(id => allDevices[id])
                        .map(id => ({ id, ...allDevices[id] }));
                    console.log("Linked devices:", linkedDevices); // Debug: Kiểm tra thiết bị được liên kết
                    setDevices(linkedDevices);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching devices:", error);
                    setError("Lỗi khi tải dữ liệu thiết bị: " + error.message);
                    setLoading(false);
                });
            }, (error) => {
                console.error("Error fetching user data:", error);
                setError("Lỗi khi tải dữ liệu người dùng: " + error.message);
                setLoading(false);
            });
        });

        return () => unsubscribe();
    }, []);

    const handleAddGroup = () => {
        if (!newGroupName.trim()) {
            setError("Tên nhóm không được để trống");
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        const newGroupRef = ref(realtimedb, `users/${user.uid}/groups/${Date.now()}`);
        set(newGroupRef, {
            name: newGroupName,
            devices: {}
        })
            .then(() => {
                setNewGroupName('');
                setIsAddGroupOpen(false);
                setError(null);
            })
            .catch(error => setError("Lỗi khi thêm nhóm: " + error.message));
    };

    const handleAddDeviceToGroup = (groupId, deviceId) => {
        const user = auth.currentUser;
        if (!user) return;

        const groupDeviceRef = ref(realtimedb, `users/${user.uid}/groups/${groupId}/devices`);
        update(groupDeviceRef, { [deviceId]: true })
            .then(() => setError(null))
            .catch(error => setError("Lỗi khi thêm thiết bị: " + error.message));
    };

    const handleDeleteGroup = (groupId) => {
        const user = auth.currentUser;
        if (!user) return;

        const groupRef = ref(realtimedb, `users/${user.uid}/groups/${groupId}`);
        remove(groupRef)
            .then(() => setError(null))
            .catch(error => setError("Lỗi khi xóa nhóm: " + error.message));
    };

    const handleRemoveDeviceFromGroup = (groupId, deviceId) => {
        const user = auth.currentUser;
        if (!user) return;

        const deviceRef = ref(realtimedb, `users/${user.uid}/groups/${groupId}/devices/${deviceId}`);
        remove(deviceRef)
            .then(() => {
                // Cập nhật state groups để phản ánh thay đổi
                const updatedGroups = { ...groups };
                if (updatedGroups[groupId] && updatedGroups[groupId].devices) {
                    delete updatedGroups[groupId].devices[deviceId];
                    setGroups(updatedGroups);
                }
                setError(null);
            })
            .catch(error => setError("Lỗi khi xóa thiết bị khỏi nhóm: " + error.message));
    };

    if (loading) {
        return <div className="text-center text-gray-600">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50 px-8 py-12 flex flex-col items-center">
            <div className="w-full max-w-7xl flex justify-between items-center mb-12">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent text-center mx-auto animate-fadeIn">
                    Danh Sách Thiết Bị
                </h1>
            </div>

            {error && (
                <div className="w-full max-w-7xl mb-8 p-4 bg-red-50 text-red-600 rounded-xl shadow-md border border-red-100">
                    {error}
                </div>
            )}

            <AddGroupForm
                newGroupName={newGroupName}
                setNewGroupName={setNewGroupName}
                onAddGroup={handleAddGroup}
                isOpen={isAddGroupOpen}
                setIsOpen={setIsAddGroupOpen}
            />

            <div className="w-full max-w-7xl">
                {Object.entries(groups).map(([groupId, group]) => (
                    <GroupSection
                        key={groupId}
                        group={group}
                        groupId={groupId}
                        devices={devices}
                        groups={groups}
                        onAddDeviceToGroup={handleAddDeviceToGroup}
                        onDeleteGroup={handleDeleteGroup}
                        onRemoveDeviceFromGroup={handleRemoveDeviceFromGroup}
                    />
                ))}
                <UnassignedDevicesSection devices={devices} groups={groups} />
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out;
                }
                .animate-slideIn {
                    animation: slideIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default DeviceList;
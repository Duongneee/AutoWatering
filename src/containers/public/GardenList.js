import React, { useState, useEffect } from 'react';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { realtimedb } from '../../firebaseConfig';
import { Link } from 'react-router-dom';
import { auth } from '../../firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import a from '../../asset/1.jpg';

const GardenCard = ({ garden, onRemoveGardenFromGroup, groupId }) => (
    <div className="relative bg-white rounded-3xl shadow-md overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-xl group border border-teal-100">
        <div className="relative">
            <img
                src={a}
                alt={garden.name}
                className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 truncate group-hover:text-teal-600 transition-colors duration-300">
                {garden.name}
            </h2>
            <p className="text-gray-600 text-sm flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Độ ẩm: <span className="text-teal-700 font-medium">{garden.doAmDat.current}%</span>
            </p>
            <div className="flex gap-3">
                <Link to={`/gardens/${garden.id}`} className="flex-1">
                    <button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white py-2 px-4 rounded-lg shadow-md hover:from-teal-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                        Xem chi tiết
                    </button>
                </Link>
                {groupId && (
                    <button
                        onClick={() => onRemoveGardenFromGroup(groupId, garden.id)}
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

const AddGardenToGroupForm = ({ groupId, gardens, onAddGardenToGroup }) => {
    const [selectedGarden, setSelectedGarden] = useState('');

    const handleAdd = () => {
        if (!selectedGarden) return;
        onAddGardenToGroup(groupId, selectedGarden);
        setSelectedGarden('');
    };

    return (
        <div className="mt-4 bg-white p-5 rounded-xl shadow-md border border-teal-100">
            <div className="flex gap-4">
                <select
                    value={selectedGarden}
                    onChange={(e) => setSelectedGarden(e.target.value)}
                    className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all duration-200 bg-gray-50"
                >
                    <option value="">Chọn khu vườn</option>
                    {gardens.map(garden => (
                        <option key={garden.id} value={garden.id}>{garden.name}</option>
                    ))}
                </select>
                <button
                    onClick={handleAdd}
                    className="bg-teal-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 transition-all duration-300"
                >
                    Thêm
                </button>
            </div>
        </div>
    );
};

const GroupSection = ({ group, groupId, gardens, onAddGardenToGroup, onDeleteGroup, onRemoveGardenFromGroup }) => {
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
                        {showAddForm ? 'Ẩn' : 'Thêm vườn'}
                    </button>
                    <button
                        onClick={() => onDeleteGroup(groupId)}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-red-600 transition-all duration-300"
                    >
                        Xóa khu vực
                    </button>
                </div>
            </div>
            {showAddForm && (
                <AddGardenToGroupForm
                    groupId={groupId}
                    gardens={gardens}
                    onAddGardenToGroup={onAddGardenToGroup}
                />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {gardens
                    .filter(garden => group.gardens && group.gardens[garden.id])
                    .map(garden => (
                        <GardenCard
                            key={garden.id}
                            garden={garden}
                            groupId={groupId}
                            onRemoveGardenFromGroup={onRemoveGardenFromGroup}
                        />
                    ))}
            </div>
        </div>
    );
};

const UnassignedGardensSection = ({ gardens, groups }) => {
    const unassignedGardens = gardens.filter(garden => {
        return !Object.values(groups).some(group => group.gardens && group.gardens[garden.id]);
    });

    if (unassignedGardens.length === 0) return null;

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-teal-800 mb-6 bg-teal-50 p-5 rounded-xl shadow-sm text-center">Khu Vườn Chưa Được Phân Khu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {unassignedGardens.map(garden => (
                    <GardenCard key={garden.id} garden={garden} />
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
                Thêm Khu Vực Mới
            </button>
        ) : (
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-teal-100 transform transition-all duration-300 animate-slideIn w-full max-w-lg">
                <h2 className="text-3xl font-bold text-teal-800 mb-6 text-center">Thêm Khu Vực Mới</h2>
                <div className="flex gap-4 items-center">
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Nhập tên khu vực"
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

const GardenList = () => {
    const [gardens, setGardens] = useState([]);
    const [groups, setGroups] = useState({});
    const [newGroupName, setNewGroupName] = useState('');
    const [error, setError] = useState(null);
    const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                console.log("User not logged in");
                return;
            }

            const userRef = ref(realtimedb, `users/${user.uid}`);
            onValue(userRef, (snapshot) => {
                const userData = snapshot.val() || {};
                const gardenIds = userData.gardens || {};
                setGroups(userData.groups || {});

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
                }, (error) => setError(error.message));
            }, (error) => setError(error.message));
        });

        return () => unsubscribe();
    }, []);

    const handleAddGroup = () => {
        if (!newGroupName.trim()) {
            setError("Tên khu vực không được để trống");
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        const newGroupRef = ref(realtimedb, `users/${user.uid}/groups/${Date.now()}`);
        set(newGroupRef, {
            name: newGroupName,
            gardens: {}
        })
            .then(() => {
                setNewGroupName('');
                setIsAddGroupOpen(false);
                setError(null);
            })
            .catch(error => setError("Lỗi khi thêm khu vực: " + error.message));
    };

    const handleAddGardenToGroup = (groupId, gardenId) => {
        const user = auth.currentUser;
        if (!user) return;

        const groupGardenRef = ref(realtimedb, `users/${user.uid}/groups/${groupId}/gardens`);
        update(groupGardenRef, { [gardenId]: true })
            .then(() => setError(null))
            .catch(error => setError("Lỗi khi thêm vườn: " + error.message));
    };

    const handleDeleteGroup = (groupId) => {
        const user = auth.currentUser;
        if (!user) return;

        const groupRef = ref(realtimedb, `users/${user.uid}/groups/${groupId}`);
        remove(groupRef)
            .then(() => setError(null))
            .catch(error => setError("Lỗi khi xóa khu vực: " + error.message));
    };

    const handleRemoveGardenFromGroup = (groupId, gardenId) => {
        const user = auth.currentUser;
        if (!user) return;

        const gardenRef = ref(realtimedb, `users/${user.uid}/groups/${groupId}/gardens/${gardenId}`);
        remove(gardenRef)
            .then(() => setError(null))
            .catch(error => setError("Lỗi khi xóa vườn khỏi khu vực: " + error.message));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50 px-8 py-12 flex flex-col items-center">
            <div className="w-full max-w-7xl flex justify-between items-center mb-12">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-blue-700 bg-clip-text text-transparent text-center mx-auto animate-fadeIn">
                    Danh Sách Khu Vườn
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
                        gardens={gardens}
                        onAddGardenToGroup={handleAddGardenToGroup}
                        onDeleteGroup={handleDeleteGroup}
                        onRemoveGardenFromGroup={handleRemoveGardenFromGroup}
                    />
                ))}
                <UnassignedGardensSection gardens={gardens} groups={groups} />
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

export default GardenList;
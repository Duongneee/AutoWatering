import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, set, remove } from 'firebase/database';
import { realtimedb } from '../../firebaseConfig';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

const AdminDeviceDetail = () => {
    const { deviceId } = useParams();
    const [soilMoisture, setSoilMoisture] = useState(0);
    const [pumpStatus, setPumpStatus] = useState('');
    const [historyData, setHistoryData] = useState([]);
    const [deviceName, setDeviceName] = useState('');
    const [minMoisture, setMinMoisture] = useState('');
    const [maxMoisture, setMaxMoisture] = useState('');
    const [time, setTime] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('Chưa gán');
    const [keys, setKeys] = useState({});
    const [users, setUsers] = useState({});
    const [editingName, setEditingName] = useState(false);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [inputKey, setInputKey] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!deviceId) return;

        const deviceRef = ref(realtimedb, `devices/${deviceId}`);
        const keysRef = ref(realtimedb, 'keys');
        const usersRef = ref(realtimedb, 'users');

        // Lấy thông tin thiết bị
        onValue(deviceRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setDeviceName(data.name || '');
                setNewDeviceName(data.name || '');
                setSoilMoisture(data.doAmDat?.current || 0);
                setPumpStatus(data.mayBom?.trangThai || '');
                setMinMoisture(data.doAmDat?.min || '');
                setMaxMoisture(data.doAmDat?.max || '');
                setTime(data.time || '');

                const history = data.doAmDat?.history;
                if (history) {
                    const historyArray = Object.keys(history).map((key) => ({
                        time: new Date(history[key].time).getTime(),
                        value: parseFloat(history[key].value),
                    }));
                    setHistoryData(historyArray.sort((a, b) => a.time - b.time));
                }
            }
        });

        // Lấy danh sách keys
        onValue(keysRef, (snapshot) => setKeys(snapshot.val() || {}));

        // Lấy danh sách users và xác định chủ sở hữu qua groups
        onValue(usersRef, (snapshot) => {
            const usersData = snapshot.val() || {};
            setUsers(usersData);
            let foundOwner = 'Chưa gán';
            Object.values(usersData).forEach((user) => {
                Object.values(user.groups || {}).forEach((group) => {
                    if (group.devices && group.devices[deviceId] === true) {
                        foundOwner = user.email;
                    }
                });
            });
            setOwnerEmail(foundOwner);
        });
    }, [deviceId]);

    const handlePumpControl = (status) => {
        set(ref(realtimedb, `devices/${deviceId}/mayBom/trangThai`), status)
            .catch((error) => console.error("Lỗi khi cập nhật trạng thái máy bơm:", error));
    };

    const handleEditName = () => setEditingName(true);
    const handleSaveName = () => {
        set(ref(realtimedb, `devices/${deviceId}/name`), newDeviceName)
            .then(() => {
                setDeviceName(newDeviceName);
                setEditingName(false);
            })
            .catch((error) => console.error("Lỗi khi cập nhật tên thiết bị:", error));
    };
    const handleCancelEdit = () => {
        setNewDeviceName(deviceName);
        setEditingName(false);
    };

    const handleMinMoistureChange = (e) => {
        const newMin = parseInt(e.target.value, 10);
        if (!isNaN(newMin)) {
            setMinMoisture(newMin);
            set(ref(realtimedb, `devices/${deviceId}/doAmDat/min`), newMin);
        }
    };

    const handleMaxMoistureChange = (e) => {
        const newMax = parseInt(e.target.value, 10);
        if (!isNaN(newMax)) {
            setMaxMoisture(newMax);
            set(ref(realtimedb, `devices/${deviceId}/doAmDat/max`), newMax);
        }
    };

    const handleTimeChange = (e) => {
        const newTime = parseInt(e.target.value, 10);
        if (!isNaN(newTime)) {
            setTime(newTime);
            set(ref(realtimedb, `devices/${deviceId}/time`), newTime);
        }
    };

    const handleDelete = () => setShowDeleteModal(true);

    const confirmDelete = () => {
        const correctKey = Object.entries(keys).find(([_, value]) => value === deviceId)?.[0];
        if (inputKey === correctKey) {
            remove(ref(realtimedb, `devices/${deviceId}`));
            Object.values(users).forEach((user) => {
                Object.values(user.groups || {}).forEach((group) => {
                    if (group.devices && group.devices[deviceId]) {
                        const groupId = Object.keys(user.groups).find(key => user.groups[key] === group);
                        remove(ref(realtimedb, `users/${user.uid}/groups/${groupId}/devices/${deviceId}`));
                    }
                });
            });
            const keyToDelete = correctKey;
            if (keyToDelete) remove(ref(realtimedb, `keys/${keyToDelete}`));
            setShowDeleteModal(false);
            navigate('/admin');
        } else {
            alert("Key không đúng. Vui lòng nhập lại!");
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setInputKey('');
    };

    const options = {
        title: { text: 'Lịch sử độ ẩm đất', style: { color: '#15803d', fontWeight: 'bold' } },
        xAxis: { type: 'datetime', title: { text: 'Thời gian' } },
        yAxis: { title: { text: 'Độ ẩm (%)' }, min: 0, max: 100 },
        navigator: { enabled: true },
        series: [{ name: 'Độ ẩm đất', type: 'line', data: historyData.map((item) => [item.time, item.value]), color: '#16a34a' }],
        credits: { enabled: false },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-green-200 p-6 flex items-center justify-center">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl p-8 transform transition-all hover:scale-[1.01]">
                {/* Header */}
                <div className="flex items-center justify-center mb-8 relative">
                    {editingName ? (
                        <div className="flex items-center w-full gap-4">
                            <input
                                type="text"
                                value={newDeviceName}
                                onChange={(e) => setNewDeviceName(e.target.value)}
                                className="flex-1 px-4 py-2 text-lg border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                placeholder="Nhập tên thiết bị"
                            />
                            <button
                                onClick={handleSaveName}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                            >
                                Lưu
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
                            >
                                Hủy
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-green-700 text-center">
                                {deviceName || 'Thiết bị của bạn'} (Admin View)
                            </h1>
                            <div className="absolute right-0 flex gap-2">
                                <button
                                    onClick={handleEditName}
                                    className="p-2 text-green-600 hover:text-green-800 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4M3 7h18" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Owner Info */}
                    <div className="p-4 bg-green-50 rounded-lg shadow-sm">
                        <p className="text-xl font-medium text-gray-800">
                            Chủ sở hữu: <span className="text-green-700 font-bold">{ownerEmail}</span>
                        </p>
                        <p className="text-xl font-medium text-gray-800 mt-2">
                            Device ID: <span className="text-green-700 font-bold">{deviceId}</span>
                        </p>
                        <p className="text-xl font-medium text-gray-800 mt-2">
                            Key: <span className="text-green-700 font-bold">{Object.entries(keys).find(([_, value]) => value === deviceId)?.[0] || 'N/A'}</span>
                        </p>
                    </div>

                    {/* Soil Moisture */}
                    <div className="p-4 bg-green-50 rounded-lg shadow-sm">
                        <p className="text-xl font-medium text-gray-800">
                            Độ ẩm đất hiện tại: <span className="text-green-700 font-bold">{soilMoisture}%</span>
                        </p>
                    </div>

                    {/* Moisture Limits */}
                    <div className="p-4 bg-green-50 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-green-700 mb-4">Giới hạn độ ẩm</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Min</label>
                                <input
                                    type="number"
                                    value={minMoisture}
                                    onChange={handleMinMoistureChange}
                                    className="w-full px-4 py-2 mt-1 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="Nhập giá trị min"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Max</label>
                                <input
                                    type="number"
                                    value={maxMoisture}
                                    onChange={handleMaxMoistureChange}
                                    className="w-full px-4 py-2 mt-1 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                    placeholder="Nhập giá trị max"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Update Time */}
                    <div className="p-4 bg-green-50 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-green-700 mb-4">Thời gian cập nhật dữ liệu</h2>
                        <input
                            type="number"
                            value={time}
                            onChange={handleTimeChange}
                            className="w-full px-4 py-2 border-2 border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            placeholder="Nhập thời gian (giây)"
                        />
                    </div>

                    {/* Pump Control */}
                    <div className="p-4 bg-green-50 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-green-700 mb-4">Điều khiển máy bơm</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => handlePumpControl('On')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pumpStatus === 'On' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-500 hover:text-white'}`}
                            >
                                Bật
                            </button>
                            <button
                                onClick={() => handlePumpControl('Off')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pumpStatus === 'Off' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white'}`}
                            >
                                Tắt
                            </button>
                            <button
                                onClick={() => handlePumpControl('Auto')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${pumpStatus === 'Auto' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white'}`}
                            >
                                Tự động
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                            Trạng thái: <span className="font-semibold text-green-700">
                                {pumpStatus === 'Auto' ? 'Tự động' : pumpStatus}
                            </span>
                        </p>
                    </div>

                    {/* History Chart */}
                    <div className="p-4 bg-green-50 rounded-lg shadow-sm">
                        <HighchartsReact highcharts={Highcharts} options={options} />
                    </div>

                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/admin')}
                        className="w-full py-3 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition-all duration-200"
                    >
                        Trở về trang quản trị
                    </button>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Xác nhận xóa thiết bị</h3>
                            <p className="text-gray-600 mb-4">
                                Nhập key của thiết bị <span className="font-bold text-green-700">{deviceId}</span> để xác nhận xóa hoàn toàn:
                            </p>
                            <input
                                type="text"
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                className="w-full px-4 py-2 mb-4 border-2 border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                placeholder="Nhập key (e.g., key_1)"
                            />
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200"
                                >
                                    Xóa hoàn toàn
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDeviceDetail;
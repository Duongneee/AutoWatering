import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { realtimedb } from '../../firebaseConfig';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../firebaseConfig";  // Lấy thông tin người dùng





const GardenId = () => {
    const { gardenId } = useParams();
    const [soilMoisture, setSoilMoisture] = useState(0);
    const [pumpStatus, setPumpStatus] = useState(0); // 0: Tắt, 1: Bật, 20: Tự động (Tắt), 21: Tự động (Bật)
    const [historyData, setHistoryData] = useState([]);
    const [gardenName, setGardenName] = useState('');
    const [minMoisture, setMinMoisture] = useState('');
    const [maxMoisture, setMaxMoisture] = useState('');
    const [time, setTime] = useState('');
    const navigate = useNavigate();
    const [editingName, setEditingName] = useState(false); // Trạng thái sửa tên
    const [newGardenName, setNewGardenName] = useState('');

    useEffect(() => {
        if (!gardenId) return;

        const moistureRef = ref(realtimedb, `gardens/${gardenId}/doAmDat`);
        const pumpStatusRef = ref(realtimedb, `gardens/${gardenId}/mayBom/trangThai`);
        const historyRef = ref(realtimedb, `gardens/${gardenId}/doAmDat/history`);
        const nameRef = ref(realtimedb, `gardens/${gardenId}/name`);
        const minRef = ref(realtimedb, `gardens/${gardenId}/doAmDat/min`);
        const maxRef = ref(realtimedb, `gardens/${gardenId}/doAmDat/max`);
        const timeRef = ref(realtimedb, `gardens/${gardenId}/time`);


        // Lấy dữ liệu từ Firebase
        onValue(nameRef, (snapshot) => {
            const name = snapshot.val();
            setGardenName(name || '');
            setNewGardenName(name || ''); // Cập nhật giá trị mặc định
        });

        onValue(nameRef, (snapshot) => setGardenName(snapshot.val() || ''));
        onValue(moistureRef, (snapshot) => setSoilMoisture(snapshot.val()?.current || 0));
        onValue(pumpStatusRef, (snapshot) => setPumpStatus(snapshot.val() || 0));
        onValue(historyRef, (snapshot) => {
            const history = snapshot.val();
            if (history) {
                const historyArray = Object.keys(history).map((key) => ({
                    time: new Date(history[key].time).getTime(),
                    value: parseFloat(history[key].value),
                }));
                setHistoryData(historyArray);
            }
        });
        onValue(minRef, (snapshot) => setMinMoisture(snapshot.val() || ''));
        onValue(maxRef, (snapshot) => setMaxMoisture(snapshot.val() || ''));
        onValue(timeRef, (snapshot) => setTime(snapshot.val() || ''));
    }, [gardenId]);

    const handlePumpControl = (status) => {
        const pumpStatusRef = ref(realtimedb, `gardens/${gardenId}/mayBom/trangThai`);
        set(pumpStatusRef, status).catch((error) =>
            console.error("Lỗi khi cập nhật trạng thái máy bơm:", error)
        );
    };

    const handleEditName = () => {
        setEditingName(true); // Bật chế độ sửa
    };

    const handleDelete = async () => {
        const user = auth.currentUser;

        if (!user) {
            console.error("Người dùng chưa đăng nhập!");
            return;
        }
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa khu vườn này?");

        if (!confirmDelete) {
            console.log("Người dùng đã hủy thao tác xóa.");
            return;
        }

        const userId = user.uid;
        const userGardenRef = ref(realtimedb, `users/${userId}/gardens/${gardenId}`);


        set(userGardenRef, false).catch((error) =>
            console.error("Lỗi khi xóa khu vườn:", error)
        );
        console.log("Khu vườn đã được xóa");
        navigate('/gardens')
    }


    const handleSaveName = () => {
        const nameRef = ref(realtimedb, `gardens/${gardenId}/name`);
        set(nameRef, newGardenName)
            .then(() => {
                setGardenName(newGardenName);
                setEditingName(false); // Thoát chế độ sửa
            })
            .catch((error) => console.error("Lỗi khi cập nhật tên khu vườn:", error));
    };

    const handleCancelEdit = () => {
        setNewGardenName(gardenName); // Khôi phục tên cũ
        setEditingName(false); // Thoát chế độ sửa
    };

    const handleMinMoistureChange = (e) => {
        const value = e.target.value;
        const newMin = parseInt(value, 10)
        if (!isNaN(newMin)) {
            setMinMoisture(newMin); // Cập nhật state với giá trị mới  
            const minRef = ref(realtimedb, `gardens/${gardenId}/doAmDat/min`);
            set(minRef, newMin) // Cập nhật Firebase với giá trị số nguyên  
                .then(() => console.log("Cập nhật giá trị min thành công:", newMin))
                .catch((error) =>
                    console.error("Lỗi khi cập nhật giá trị min:", error)
                );
        } else {
            console.error("Giá trị không hợp lệ:", newMin); // Thông báo nếu giá trị nhập không hợp lệ  
        }
    };

    const handleMaxMoistureChange = (e) => {
        const value = e.target.value; // Lấy giá trị từ ô nhập  
        const newMax = parseInt(value, 10); // Chuyển đổi giá trị nhập thành số nguyên  

        // Kiểm tra xem giá trị mới có hợp lệ không  
        if (!isNaN(newMax)) {
            setMaxMoisture(newMax); // Cập nhật state với giá trị mới  
            const maxRef = ref(realtimedb, `gardens/${gardenId}/doAmDat/max`);
            set(maxRef, newMax) // Cập nhật Firebase với giá trị số nguyên  
                .then(() => console.log("Cập nhật giá trị max thành công:", newMax))
                .catch((error) =>
                    console.error("Lỗi khi cập nhật giá trị max:", error)
                );
        } else {
            console.error("Giá trị không hợp lệ:", newMax); // Thông báo nếu giá trị nhập không hợp lệ  
        }
    };

    const handleTimeChange = (e) => {
        const value = e.target.value; // Lấy giá trị từ ô nhập  
        const newTime = parseInt(value, 10); // Chuyển đổi giá trị nhập thành số nguyên  

        // Kiểm tra xem giá trị mới có hợp lệ không  
        if (!isNaN(newTime)) {
            setTime(newTime); // Cập nhật state với giá trị mới  
            const timeRef = ref(realtimedb, `gardens/${gardenId}/time`);
            set(timeRef, newTime) // Cập nhật Firebase với giá trị số nguyên  
                .then(() => console.log("Cập nhật thời gian thành công:", newTime))
                .catch((error) =>
                    console.error("Lỗi khi cập nhật thời gian vào Firebase:", error)
                );
        } else {
            console.error("Giá trị không hợp lệ:", newTime); // Thông báo nếu giá trị nhập không hợp lệ  
        }
    };


    const options = {
        title: { text: 'Lịch sử độ ẩm đất' },
        xAxis: {
            type: 'datetime',
            title: { text: 'Thời gian' },
            dateTimeLabelFormats: {
                day: '%e %b %Y',
                month: '%b %Y',
            },
        },
        yAxis: {
            title: { text: 'Độ ẩm (%)' },
            min: 0,
            max: 100,
        },
        navigator: {
            enabled: true,
            adaptToUpdatedData: true,
            series: {
                color: '#666666',
                lineWidth: 1,
            },
        },
        series: [
            {
                name: 'Độ ẩm đất',
                type: 'line',
                data: historyData.map((item) => [item.time, item.value]),
                tooltip: { valueSuffix: ' %' },
            },
        ],
        credits: { enabled: false },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
            <div className="bg-white shadow-lg rounded-lg w-full max-w-3xl p-6">
                {/* <h1 className="text-3xl font-bold text-center text-green-600 mb-6">
                        {gardenName || 'Khu vườn của bạn'}
                    </h1> */}
                <div className="flex flex-col justify-between items-center mb-6">
                    {editingName ? (
                        <div className="flex items-center w-full">
                            <input
                                type="text"
                                value={newGardenName}
                                onChange={(e) => setNewGardenName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                            />
                            <button
                                onClick={handleSaveName}
                                className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transform transition-transform duration-200 hover:scale-110"
                            >
                                Lưu
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transform transition-transform duration-200 hover:scale-110"
                            >
                                Hủy
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <h1 className="text-3xl font-bold text-green-600">
                                {gardenName || 'Khu vườn của bạn'}
                            </h1>
                            <button
                                onClick={handleEditName}
                                className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transform transition-transform duration-200 hover:scale-110"
                            >
                                Sửa tên
                            </button>
                            <button
                                className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-green-600 transform transition-transform duration-200 hover:scale-110"
                                onClick={handleDelete}
                            >
                                Xóa
                            </button>
                        </div>

                    )}
                    <div className="garden-item">

                    </div>

                </div>
                <div className="space-y-6">
                    <div>
                        <p className="text-2xl font-medium">
                            Độ ẩm đất hiện tại: <span className="text-green-700">{soilMoisture}%</span>
                        </p>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-green-600 mb-2">Giới hạn độ ẩm</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xl text-gray-700">Min:</label>
                                <input
                                    type="number"
                                    value={minMoisture}
                                    onChange={handleMinMoistureChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                                    placeholder="Nhập giá trị min"
                                />
                            </div>
                            <div>
                                <label className="block text-xl text-gray-700">Max:</label>
                                <input
                                    type="number"
                                    value={maxMoisture}
                                    onChange={handleMaxMoistureChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                                    placeholder="Nhập giá trị max"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-green-600 mb-2">
                            Thời gian cập nhật dữ liệu
                        </h2>
                        <div>
                            <input
                                type="number"
                                value={time}
                                onChange={handleTimeChange}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
                                placeholder="Nhập thời gian"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-green-600">Điều khiển máy bơm</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => handlePumpControl(1)}
                                className={`px-4 py-2 rounded-lg text-xl font-medium transform transition duration-300 hover:scale-105 ${pumpStatus === 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
                                    }`}
                            >
                                Bật máy bơm
                            </button>
                            <button
                                onClick={() => handlePumpControl(0)}
                                className={`px-4 py-2 rounded-lg text-xl font-medium transform transition duration-300 hover:scale-105 ${pumpStatus === 0 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-700'
                                    }`}
                            >
                                Tắt máy bơm
                            </button>
                            <button
                                onClick={() => handlePumpControl(20)}
                                className={`px-4 py-2 rounded-lg text-xl font-medium transform transition duration-300 hover:scale-105 ${pumpStatus === 20 || pumpStatus === 21
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-300 text-gray-700'
                                    }`}
                            >
                                Tự động
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 text-xl">
                            Trạng thái hiện tại:{' '}
                            <span className="font-semibold text-green-700">
                                {pumpStatus === 20
                                    ? 'Tự động: Máy bơm đang Tắt'
                                    : pumpStatus === 21
                                        ? 'Tự động: Máy bơm đang Bật'
                                        : pumpStatus === 1
                                            ? 'Bật'
                                            : 'Tắt'}
                            </span>
                        </p>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-green-600 mb-4">
                            Lịch sử độ ẩm đất
                        </h2>
                        <HighchartsReact highcharts={Highcharts} options={options} />
                    </div>
                    <button
                        onClick={() => navigate('/gardens')}
                        className="mx-auto block px-6 py-3 bg-green-500 text-white text-lg font-medium rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all duration-300 transform"
                    >
                        Trở về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GardenId;

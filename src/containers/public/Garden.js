import React, { useState, useEffect } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { realtimedb } from '../../firebaseConfig';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const Garden = () => {
    const [soilMoisture, setSoilMoisture] = useState(0);
    const [pumpStatus, setPumpStatus] = useState('Tắt');
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        const moistureRef = ref(realtimedb, 'gardens/gardenId1/doAmDat');
        const pumpStatusRef = ref(realtimedb, 'gardens/gardenId1/mayBom/trangThai');
        const historyRef = ref(realtimedb, 'gardens/gardenId1/doAmDat/history');

        // Lắng nghe thay đổi độ ẩm đất
        onValue(moistureRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.current !== undefined) {
                setSoilMoisture(data.current);
            }
        });

        // Lắng nghe thay đổi trạng thái máy bơm
        onValue(pumpStatusRef, (snapshot) => {
            const status = snapshot.val();
            if (status !== null) {
                setPumpStatus(status);
            }
        });

        // Lấy dữ liệu lịch sử độ ẩm đất
        onValue(historyRef, (snapshot) => {
            const history = snapshot.val();
            if (history) {
                const historyArray = Object.keys(history).map(key => ({
                    time: new Date(history[key].time).getTime(),
                    value: parseFloat(history[key].value)
                }));
                setHistoryData(historyArray);
            }
        });
    }, []);

    // Điều khiển máy bơm
    const handlePumpControl = (status) => {
        const pumpStatusRef = ref(realtimedb, 'gardens/gardenId1/mayBom/trangThai');
        set(pumpStatusRef, status);
    };

    // Cấu hình biểu đồ lịch sử độ ẩm đất
    const options = {
        title: {
            text: 'Lịch sử độ ẩm đất'
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Thời gian'
            },
        },
        yAxis: {
            title: {
                text: 'Độ ẩm (%)'
            },
            min: 0,
            max: 100,
        },
        series: [{
            name: 'Độ ẩm đất',
            type: 'line',
            data: historyData.map(item => [item.time, item.value]),
            tooltip: {
                valueSuffix: ' %'
            }
        }],
        credits: {
            enabled: false
        }
    };

    return (
        <div className='flex items-center justify-center h-screen bg-gray-100'>
            <div className='bg-white shadow-md rounded-lg w-1/3 p-6'>
                <h1 className='text-2xl font-bold text-center mb-4'>Điều khiển Khu vườn 1</h1>

                <div className='mb-4'>
                    <p>Độ ẩm đất hiện tại: <strong>{soilMoisture}%</strong></p>
                </div>

                <div className='flex gap-4'>
                    <button
                        onClick={() => handlePumpControl('Bật')}
                        className={`px-4 py-2 ${pumpStatus === 'Bật' ? 'bg-green-500' : 'bg-gray-500'} text-white rounded-md`}
                    >
                        Bật máy bơm
                    </button>
                    <button
                        onClick={() => handlePumpControl('Tắt')}
                        className={`px-4 py-2 ${pumpStatus === 'Tắt' ? 'bg-red-500' : 'bg-gray-500'} text-white rounded-md`}
                    >
                        Tắt máy bơm
                    </button>
                    <button
                        onClick={() => handlePumpControl('Tự động')}
                        className={`px-4 py-2 ${pumpStatus === 'Tự động' ? 'bg-blue-500' : 'bg-gray-500'} text-white rounded-md`}
                    >
                        Chế độ tự động
                    </button>
                </div>

                <div className='mt-4'>
                    <p>Trạng thái máy bơm hiện tại: <strong>{pumpStatus}</strong></p>
                </div>

                {/* Biểu đồ lịch sử độ ẩm đất */}
                <div className='mt-6'>
                    <HighchartsReact
                        highcharts={Highcharts}
                        options={options}
                    />
                </div>
            </div>
        </div>
    );
};

export default Garden;

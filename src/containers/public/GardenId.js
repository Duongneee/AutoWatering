import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { realtimedb } from '../../firebaseConfig';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const GardenId = () => {
    const { gardenId } = useParams();
    const [soilMoisture, setSoilMoisture] = useState(0);
    const [pumpStatus, setPumpStatus] = useState(0); // 0: Tắt, 1: Bật, 2: Tự động, 20 là tự động đang tắt, 21 là tự động đang bật.
    const [actualPumpStatus, setActualPumpStatus] = useState('Đang tắt'); // Trạng thái thực tế khi ở chế độ tự động
    const [historyData, setHistoryData] = useState([]);
    const [gardenName, setGardenName] = useState('');

    useEffect(() => {
        if (!gardenId) return;

        const moistureRef = ref(realtimedb, `gardens/${gardenId}/doAmDat`);
        const pumpStatusRef = ref(realtimedb, `gardens/${gardenId}/mayBom/trangThai`);
        const historyRef = ref(realtimedb, `gardens/${gardenId}/doAmDat/history`);
        const nameRef = ref(realtimedb, `gardens/${gardenId}/name`);

        onValue(nameRef, (snapshot) => {
            const name = snapshot.val();
            if (name) {
                setGardenName(name);
            }
        });

        onValue(moistureRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.current !== undefined) {
                setSoilMoisture(data.current);
            }
        });

        onValue(pumpStatusRef, (snapshot) => {
            const status = snapshot.val();
            if (status !== null) {
                setPumpStatus(status);
            }
        });

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
    }, [gardenId]);

    const handlePumpControl = (status) => {
        const pumpStatusRef = ref(realtimedb, `gardens/${gardenId}/mayBom/trangThai`);
        set(pumpStatusRef, status);
    };

    const options = {
        title: { text: 'Lịch sử độ ẩm đất' },
        xAxis: { type: 'datetime', title: { text: 'Thời gian' } },
        yAxis: { title: { text: 'Độ ẩm (%)' }, min: 0, max: 100 },
        series: [{
            name: 'Độ ẩm đất',
            type: 'line',
            data: historyData.map(item => [item.time, item.value]),
            tooltip: { valueSuffix: ' %' }
        }],
        credits: { enabled: false }
    };

    return (
        <div className='flex items-center justify-center h-screen bg-gray-100'>
            <div className='bg-white shadow-md rounded-lg w-1/3 p-6'>
                <h1 className='text-2xl font-bold text-center mb-4'>Điều khiển {gardenName}</h1>

                <div className='mb-4'>
                    <p>Độ ẩm đất hiện tại: <strong>{soilMoisture}%</strong></p>
                </div>

                <div className='flex gap-4'>
                    <button
                        onClick={() => handlePumpControl(1)}
                        className={`px-4 py-2 ${pumpStatus === 1 ? 'bg-green-500' : 'bg-gray-500'} text-white rounded-md`}
                    >
                        Bật máy bơm
                    </button>
                    <button
                        onClick={() => handlePumpControl(0)}
                        className={`px-4 py-2 ${pumpStatus === 0 ? 'bg-red-500' : 'bg-gray-500'} text-white rounded-md`}
                    >
                        Tắt máy bơm
                    </button>
                    <button
                        onClick={() => handlePumpControl(20)}
                        className={`px-4 py-2 ${pumpStatus === 20 || pumpStatus === 21 ? 'bg-blue-500' : 'bg-gray-500'} text-white rounded-md`}
                    >
                        Chế độ tự động
                    </button>
                </div>

                <div className='mt-4'>
                    <p>Trạng thái máy bơm hiện tại: <strong>{
                        pumpStatus === 20 ? 'Trạng thái tự động: Máy bơm đang Tắt' :
                            pumpStatus === 21 ? 'Trạng thái tự động: Máy bơm đang Bật' :
                                (pumpStatus === 1 ? 'Bật' : 'Tắt')
                    }</strong></p>
                </div>

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

export default GardenId;

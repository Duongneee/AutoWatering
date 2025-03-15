import React, { useEffect, useState } from "react";
import { WiHumidity, WiStrongWind, WiThermometer } from "react-icons/wi"; // Icon từ react-icons
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const Weather = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [city, setCity] = useState("");
    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

    // Hàm lấy thời tiết theo tọa độ
    const fetchWeatherByCoords = async (lat, lon) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=vi`
            );
            const data = await response.json();
            if (data.cod === 200) setWeather(data);
            else setError("Không tìm thấy dữ liệu thời tiết.");
            setLoading(false);
        } catch (err) {
            setError("Có lỗi khi lấy dữ liệu thời tiết.");
            setLoading(false);
        }
    };

    // Hàm lấy thời tiết theo tên thành phố
    const fetchWeatherByCity = async (cityName) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=vi`
            );
            const data = await response.json();
            if (data.cod === 200) setWeather(data);
            else setError("Không tìm thấy thành phố này.");
            setLoading(false);
        } catch (err) {
            setError("Có lỗi khi tìm kiếm thời tiết.");
            setLoading(false);
        }
    };

    // Lấy vị trí hiện tại khi component mount
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => fetchWeatherByCoords(position.coords.latitude, position.coords.longitude),
            () => {
                setError("Vui lòng bật GPS hoặc nhập tên thành phố.");
                setLoading(false);
            }
        );
    }, []);

    // Xử lý tìm kiếm
    const handleSearch = (e) => {
        e.preventDefault();
        if (city.trim()) {
            fetchWeatherByCity(city);
            setCity("");
        }
    };

    // Hàm lấy icon thời tiết từ OpenWeatherMap
    const getWeatherIcon = (iconCode) => {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-teal-100 to-cyan-200 flex items-center justify-center p-6">
            <div className="relative bg-white bg-opacity-90 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-lg transform transition-all hover:shadow-3xl border border-gray-100">
                {/* Tiêu đề */}
                <h2 className="text-4xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-8">
                    Thời Tiết Hiện Tại
                </h2>

                {/* Form tìm kiếm */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Nhập tên thành phố (VD: Hanoi)"
                            className="w-full px-5 py-3 bg-gray-100 border border-gray-300 rounded-full focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-300 placeholder-gray-500 text-gray-800 shadow-sm"
                        />
                        <button
                            type="submit"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600 transition-all duration-300"
                        >
                            <FaSearch size={18} />
                        </button>
                    </div>
                </form>

                {/* Trạng thái tải và lỗi */}
                {loading && (
                    <p className="text-center text-gray-600 flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                        </svg>
                        Đang tải...
                    </p>
                )}
                {error && <p className="text-center text-red-500 font-medium">{error}</p>}

                {/* Hiển thị dữ liệu thời tiết */}
                {weather && !loading && !error && (
                    <div className="text-center space-y-6">
                        <h3 className="text-3xl font-semibold text-gray-800 flex items-center justify-center gap-2">
                            <FaMapMarkerAlt className="text-teal-600" /> {weather.name}
                        </h3>
                        <div className="flex justify-center">
                            <img
                                src={getWeatherIcon(weather.weather[0].icon)}
                                alt="Weather Icon"
                                className="w-20 h-20 animate-bounce-slow"
                            />
                        </div>
                        <p className="text-xl text-gray-600 capitalize">{weather.weather[0].description}</p>
                        <p className="text-5xl font-bold text-teal-700 flex items-center justify-center gap-2">
                        <WiThermometer className="text-teal-600" /> {weather.main.temp.toFixed(1)}°C
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-gray-700">
                            <p className="flex items-center justify-center gap-2">
                                <WiHumidity className="text-blue-500 text-2xl" />
                                Độ ẩm: <span className="font-bold text-teal-600">{weather.main.humidity}%</span>
                            </p>
                            <p className="flex items-center justify-center gap-2">
                                <WiStrongWind className="text-blue-500 text-2xl" />
                                Gió: <span className="font-bold text-teal-600">{weather.wind.speed} m/s</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Nút lấy vị trí hiện tại */}
                <button
                    onClick={() =>
                        navigator.geolocation.getCurrentPosition(
                            (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
                            () => setError("Không thể lấy vị trí hiện tại.")
                        )
                    }
                    className="mt-8 w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 rounded-full shadow-lg hover:from-teal-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 text-lg font-medium"
                >
                    <FaMapMarkerAlt size={20} />
                    Thời tiết tại vị trí của bạn
                </button>
            </div>
        </div>
    );
};

// CSS tùy chỉnh để tạo hiệu ứng bounce nhẹ cho icon thời tiết
const customStyles = `
    .animate-bounce-slow {
        animation: bounce 3s infinite;
    }
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
`;
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = customStyles;
document.head.appendChild(styleSheet);

export default Weather;
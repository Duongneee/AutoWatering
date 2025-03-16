import React, { useState } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";

// Giả lập dữ liệu vị trí được gửi về từ API
const fetchLocationFromApi = async () => {
  // Đây là dữ liệu giả lập, thay bằng API thực tế của bạn
  return new Promise((resolve) =>
    setTimeout(() => resolve({ city: "Hà Nội", lat: 21.0285, lng: 105.8542 }), 1000)
  );
};

const MapScreen = () => {
  const [location, setLocation] = useState({
    city: "Hà Nội",
    lat: 21.0285,
    lng: 105.8542,
  }); // Vị trí mặc định: Hà Nội
  const [loading, setLoading] = useState(false);

  // Cập nhật vị trí từ API
  const updateLocation = async () => {
    setLoading(true);
    try {
      const newLocation = await fetchLocationFromApi(); // Gọi API để lấy vị trí
      setLocation(newLocation);
    } catch (error) {
      console.error("Lỗi khi lấy vị trí:", error);
    } finally {
      setLoading(false);
    }
  };

  // URL iframe dựa trên vị trí
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    location.city
  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-gray-50">
      {/* Header */}
      <div className="bg-green-700 text-white py-4 px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <FaMapMarkerAlt className="text-2xl" />
          <h1 className="text-xl font-bold">Map Viewer</h1>
        </div>
        <button
          onClick={updateLocation}
          className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-300 disabled:bg-gray-400"
          disabled={loading}
        >
          <FaSearch />
          {loading ? "Đang tải..." : "Lấy vị trí mới"}
        </button>
      </div>

      {/* Map Container */}
      <div className="flex-1 p-4">
        <div className="mapouter h-full w-full max-w-7xl mx-auto">
          <div className="gmap_canvas h-full w-full rounded-xl shadow-xl overflow-hidden border border-gray-200">
            <iframe
              id="gmap_canvas"
              src={mapUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              title="Google Map"
            ></iframe>
          </div>
        </div>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50">
            <span className="text-gray-700 text-lg font-semibold animate-pulse">
              Đang tải vị trí...
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white p-4 shadow-inner border-t border-gray-200 flex justify-center">
        <p className="text-sm text-gray-600">
          Vị trí hiện tại: {location.city} (Lat: {location.lat.toFixed(4)}, Lng:{" "}
          {location.lng.toFixed(4)})
        </p>
      </div>
    </div>
  );
};

export default MapScreen;
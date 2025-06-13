// import React, { useState, useEffect, useRef } from "react";
// import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
// import { FaMapMarkerAlt } from "react-icons/fa";
// import { ref, onValue } from 'firebase/database';
// import { realtimedb } from '../../firebaseConfig';

// // Kích thước bản đồ
// const mapStyles = {
//   height: "100vh",
//   width: "100%",
// };

// const defaultCenter = {
//   lat: 21.028511,
//   lng: 105.83416,
// };

// const MapScreen = () => {
//   const [gardens, setGardens] = useState({}); // Lưu danh sách khu vườn từ Firebase
//   const [selectedGarden, setSelectedGarden] = useState(null); // Khu vườn được chọn
//   const [loading, setLoading] = useState(true);
//   const mapRef = useRef(null); // Ref để điều chỉnh viewport

//   // Lấy dữ liệu từ Firebase khi component mount
//   useEffect(() => {
//     const gardensRef = ref(realtimedb, "gardens");
//     onValue(gardensRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setGardens(data);
//       }
//       setLoading(false);
//     }); // Xóa `onlyOnce: true` để cập nhật theo thời gian thực
//   }, []);

//   // Cập nhật viewport để hiển thị tất cả các khu vườn
//   useEffect(() => {
//     if (mapRef.current && Object.keys(gardens).length > 0) {
//       const bounds = new window.google.maps.LatLngBounds();
//       Object.values(gardens).forEach((garden) => {
//         if (garden.location?.Latitude && garden.location?.Longitude) {
//           bounds.extend(new window.google.maps.LatLng(garden.location.Latitude, garden.location.Longitude));
//         }
//       });
//       mapRef.current.fitBounds(bounds);
//     }
//   }, [gardens]);

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen bg-green-50">
//         {/* Biểu tượng động */}
//         <div className="relative flex justify-center items-center">
//           <div className="w-16 h-16 bg-green-400 rounded-full animate-bounce flex items-center justify-center">
//             🌱
//           </div>
//           <div className="absolute w-24 h-24 bg-green-300 rounded-full opacity-50 animate-ping"></div>
//         </div>

//         {/* Văn bản loading */}
//         <span className="mt-4 text-green-700 text-lg font-semibold animate-pulse">
//           Đang tải dữ liệu ... 🌿 Xin vui lòng chờ!!!
//         </span>

//         {/* Hiệu ứng nước */}
//         <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
//           <svg className="relative block w-full h-20 fill-green-400" viewBox="0 0 1440 320">
//             <path fillOpacity="1" d="M0,224L80,218.7C160,213,320,203,480,213.3C640,224,800,256,960,240C1120,224,1280,160,1360,128L1440,96V320H0Z"></path>
//           </svg>
//         </div>
//       </div>
//     );
//   }


//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-green-50 to-gray-50">
//       {/* Header */}
//       <div className="bg-green-700 text-white py-4 px-6 flex items-center justify-between shadow-lg">
//         <div className="flex items-center gap-3">
//           <FaMapMarkerAlt className="text-2xl" />
//           <h1 className="text-xl font-bold">Garden Map Viewer</h1>
//         </div>
//       </div>

//       {/* Map Container */}
//       <div className="flex-1 p-4">
//         <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
//           <GoogleMap
//             mapContainerStyle={mapStyles}
//             zoom={13}
//             center={defaultCenter}
//             onLoad={(map) => (mapRef.current = map)} // Lưu ref bản đồ
//           >
//             {Object.keys(gardens).map((gardenId) => {
//               const garden = gardens[gardenId];
//               if (!garden.location?.Latitude || !garden.location?.Longitude) return null;

//               return (
//                 <Marker
//                   key={gardenId}
//                   position={{
//                     lat: garden.location.Latitude,
//                     lng: garden.location.Longitude,
//                   }}
//                   onClick={() => setSelectedGarden(gardenId)}
//                 >
//                   {selectedGarden === gardenId && (
//                     <InfoWindow onCloseClick={() => setSelectedGarden(null)}>
//                       <div>
//                         <h3 className="font-bold">{garden.name}</h3>
//                         <p>
//                           Lat: {garden.location.Latitude.toFixed(4)}, Lng: {garden.location.Longitude.toFixed(4)}
//                         </p>
//                       </div>
//                     </InfoWindow>
//                   )}
//                 </Marker>
//               );
//             })}
//           </GoogleMap>
//         </LoadScript>
//       </div>

//       {/* Footer */}
//       <div className="bg-white p-4 shadow-inner border-t border-gray-200 flex justify-center">
//         <p className="text-sm text-gray-600">
//           Hiển thị {Object.keys(gardens).length} khu vườn
//         </p>
//       </div>
//     </div>
//   );
// };

// export default MapScreen;



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
    <div className="flex flex-col h-screen bg-green-100">
      {/* Header */}
      <div className="bg-green-100 text-white py-4 px-6 flex items-center justify-between shadow-lg">
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
import { Routes, Route, Navigate } from "react-router-dom";
import { Garden, Home, Login, GardenId, GardenList, Register, Chatbot, Weather, MapScreen } from './containers/public';
import { AdminPage,GardenDetail } from './containers/system'
import { path } from './untils/constant';
// Trang điều khiển

function App() {
  return (
    <div className="h-screen w-screen bg-primary">
      <Routes>

        <Route path={path.LOGIN} element={<Login />} />
        <Route path={path.REGISTER} element={<Register />} />

        {/* Home sẽ bao bọc các trang khác */}
        <Route path="/" element={<Home />}>
          <Route element={<Navigate to={path.GARDENLIST} />} /> {/* Mặc định chuyển đến danh sách vườn */}
          <Route path={path.GARDENLIST} element={<GardenList />} />
          <Route path={path.GARDENID} element={<GardenId />} />
          <Route path={path.GARDEN} element={<Garden />} />
          <Route path={path.CHATBOT} element={<Chatbot />} />
          <Route path={path.WEATHER} element={<Weather />} />
          <Route path={path.MAP} element={<MapScreen />} />
        </Route>

        <Route path={path.ADMIN} element={<AdminPage />} />
        <Route path="/garden/:gardenId" element={<GardenDetail />} />

      </Routes>
    </div>
  );
}

export default App;

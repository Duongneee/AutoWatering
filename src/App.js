import { Routes, Route, Navigate } from "react-router-dom";
import { AddDevice, Home, Login, DeviceId, DeviceList, Register, Chatbot, Weather, MapScreen, Overview } from './containers/public';
import { AdminPage, DeviceDetail } from './containers/system';
import { path } from './untils/constant';

function App() {
  return (
    <div className="h-screen w-screen bg-primary">
      <Routes>
        <Route path={path.LOGIN} element={<Login />} />
        <Route path={path.REGISTER} element={<Register />} />

        {/* Home sẽ bao bọc các trang khác */}
        <Route path="/" element={<Home />}>
          <Route element={<Navigate to={path.DEVICELIST} />} /> {/* Mặc định chuyển đến danh sách thiết bị */}
          <Route path={path.DEVICELIST} element={<DeviceList />} />
          <Route path={path.DEVICEID} element={<DeviceId />} />
          <Route path={path.DEVICE} element={<AddDevice />} />
          <Route path={path.CHATBOT} element={<Chatbot />} />
          <Route path={path.WEATHER} element={<Weather />} />
          <Route path={path.MAP} element={<MapScreen />} />
          <Route path={path.OVERVIEW} element={<Overview />} />
        </Route>

        <Route path={path.ADMIN} element={<AdminPage />} />
        <Route path="/devices/:deviceId" element={<DeviceDetail />} />
      </Routes>
    </div>
  );
}

export default App;
import { Routes, Route, Navigate } from 'react-router-dom';
import { Garden, Home, Login,GardenId,GardenList } from './containers/public';
import { path } from './untils/constant';
// Trang điều khiển

function App() {
  return (
    <div className="h-screen w-screen bg-primary">
      <Routes>
        <Route path={path.GARDENLIST} element={<GardenList />} /> 
        <Route path={path.GARDENID} element={<GardenId />} /> 
        <Route path={path.LOGIN} element={<Login />} />
        <Route path={path.GARDEN} element={<Garden />} />
        <Route path={path.HOME} element={<Home />}>
        `</Route>
      </Routes>
    </div>
  );
}

export default App;

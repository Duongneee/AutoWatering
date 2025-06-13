import icons from './icon'

const { ImPencil2, MdOutlineLibraryBooks, RiRobot3Line, TiWeatherPartlySunny } = icons

const menuUser = [
    {
        id: 1,
        text: 'Danh sách thiết bị',
        path: '/devices',
        icon: <MdOutlineLibraryBooks />
    },
    {
        id: 2,
        text: 'Thêm thiết bị',
        path: '/add-device',
        icon: <ImPencil2 />
    },
    {
        id: 3,
        text: 'Chatbot',
        path: '/chatbot',
        icon: <RiRobot3Line />
    },
    {
        id: 4,
        text: 'Dự báo thời tiết',
        path: '/weather',
        icon: <TiWeatherPartlySunny />
    }
]

export default menuUser
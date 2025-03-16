import icons from './icon'

const { ImPencil2, MdOutlineLibraryBooks, RiRobot3Line, TiWeatherPartlySunny, GrMap } = icons

const menuUser = [
    {
        id: 1,
        text: 'Danh sách khu vườn',
        path: '/gardens',
        icon: <MdOutlineLibraryBooks />
    },
    {
        id: 2,
        text: 'Map',
        path: '/map',
        icon: <GrMap />
    },
    {
        id: 3,
        text: 'Thêm khu vườn',
        path: '/add-garden',
        icon: <ImPencil2 />
    },
    {
        id: 4,
        text: 'Chatbot',
        path: '/chatbot',
        icon: <RiRobot3Line />
    },
    {
        id: 5,
        text: 'Dự báo thời tiết',
        path: '/weather',
        icon: <TiWeatherPartlySunny />
    }
]

export default menuUser
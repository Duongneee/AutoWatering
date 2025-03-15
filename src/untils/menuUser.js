import icons from './icon'

const { ImPencil2, MdOutlineLibraryBooks, LiaMoneyBillWaveSolid, BsBookmarkStarFill, RiRobot3Line, TiWeatherPartlySunny  } = icons

const menuUser = [
    {
        id: 1,
        text: 'Danh sách khu vườn',
        path: '/gardens',
        icon: <MdOutlineLibraryBooks />
    },
    {
        id: 2,
        text: 'Thêm khu vườn',
        path: '/add-garden',
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
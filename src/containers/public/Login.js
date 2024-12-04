import React, { useState } from 'react';
import { InputForm, Button } from '../../components';
import { useNavigate } from 'react-router-dom';
import { path } from '../../untils/constant';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log("User logged in");
            navigate(path.GARDENLIST); 
        } catch (error) {
            setError(error.message); 
            console.error("Login failed:", error.message);
        }
    };

    return (
        <div className='flex items-center justify-center h-screen bg-primary'>
            <div className='bg-white w-[600px] p-[30px] pb-[100px] rounded-md shadow-sm'>
                <h3 className='font-semibold text-2xl mb-3'>Welcome to Smart Garden</h3>
                <div className='w-full flex flex-col gap-3'>
                    <InputForm label={'Tên đăng nhập'} value={email} setValue={setEmail} />
                    <InputForm label={'Mật khẩu'} type="password" value={password} setValue={setPassword} />
                    <Button
                        text='Đăng nhập'
                        bgColor='bg-secondary1'
                        textColor='text-white'
                        fullWidth
                        onClick={handleLogin}
                    />
                </div>
                {error && <h5 className='mt-4 text-red-500'>{error}</h5>} {/* Hiển thị thông báo lỗi nếu có */}
                <h5 className='mt-4 text-blue-500'>Bạn quên mật khẩu? Hãy liên hệ Admin nhé</h5>
            </div>
        </div>
    );
}

export default Login;

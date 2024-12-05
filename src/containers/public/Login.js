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
            console.log('User logged in');
            navigate(path.GARDENLIST);
        } catch (error) {
            setError(error.message);
            console.error('Login failed:', error.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-300 via-blue-200 to-purple-300">
            <div className="bg-white w-[400px] p-8 rounded-lg shadow-lg">
                <h3 className="text-3xl font-bold text-center text-green-600 mb-4">
                    Smart Garden
                </h3>
                <p className="text-center text-gray-500 mb-6">
                    Đăng nhập để quản lý vườn thông minh của bạn
                </p>
                <form className="space-y-5" onSubmit={handleLogin}>
                    <InputForm
                        label={'Tên đăng nhập'}
                        value={email}
                        setValue={setEmail}
                        placeholder="Nhập email của bạn"
                    />
                    <InputForm
                        label={'Mật khẩu'}
                        type="password"
                        value={password}
                        setValue={setPassword}
                        placeholder="Nhập mật khẩu"
                    />
                    {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                    <Button
                        text="Đăng nhập"
                        bgColor="bg-green-500 hover:bg-green-600"
                        textColor="text-white"
                        fullWidth
                        type="submit"
                        onClick={handleLogin}
                    />
                </form>
                <div className="flex justify-between items-center mt-6 text-sm">
                    <p>
                        Chưa có tài khoản?{' '}
                        <span
                            className="text-blue-500 cursor-pointer hover:underline"
                            onClick={() => navigate(path.REGISTER)}
                        >
                            Đăng ký ngay
                        </span>
                    </p>
                    <p>
                        <span
                            className="text-blue-500 cursor-pointer hover:underline"
                            onClick={() => alert('Hãy liên hệ Admin!')}
                        >
                            Quên mật khẩu?
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

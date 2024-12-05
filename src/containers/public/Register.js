import React, { useState } from 'react';
import { InputForm, Button } from '../../components';
import { useNavigate } from 'react-router-dom';
import { path } from '../../untils/constant';
import { auth } from '../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp!');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log('User registered successfully');
            navigate(path.LOGIN);
        } catch (error) {
            setError(error.message);
            console.error('Registration failed:', error.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-200 to-purple-300">
            <div className="bg-white w-[400px] p-8 rounded-lg shadow-lg">
                <h3 className="text-3xl font-bold text-center text-purple-600 mb-4">
                    Đăng ký tài khoản
                </h3>
                <p className="text-center text-gray-500 mb-6">
                    Tạo tài khoản mới để quản lý vườn thông minh của bạn
                </p>
                <form className="space-y-5" onSubmit={handleRegister}>
                    <InputForm
                        label={'Email'}
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
                    <InputForm
                        label={'Xác nhận mật khẩu'}
                        type="password"
                        value={confirmPassword}
                        setValue={setConfirmPassword}
                        placeholder="Xác nhận mật khẩu"
                    />
                    {error && (
                        <p className="text-red-500 text-sm mt-1">{error}</p>
                    )}
                    <Button
                        text="Đăng ký"
                        bgColor="bg-purple-500 hover:bg-purple-600"
                        textColor="text-white"
                        fullWidth
                        type="submit"
                        onClick={handleRegister}
                    />
                </form>
                <div className="flex justify-between items-center mt-6 text-sm">
                    <p>
                        Đã có tài khoản?{' '}
                        <span
                            className="text-blue-500 cursor-pointer hover:underline"
                            onClick={() => navigate(path.LOGIN)}
                        >
                            Đăng nhập ngay
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;

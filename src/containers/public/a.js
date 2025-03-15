import React, { useState } from 'react';
import { InputForm, Button } from '../../components';
import { useNavigate } from 'react-router-dom';
import { path } from '../../untils/constant';
import { auth } from '../../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const Register = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({ email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    // Hàm kiểm tra email hợp lệ
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Hàm kiểm tra form trước khi submit
    const validateForm = () => {
        let valid = true;
        const newErrors = { email: '', password: '', confirmPassword: '' };

        if (!email) {
            newErrors.email = 'Email không được để trống!';
            valid = false;
        } else if (!isValidEmail(email)) {
            newErrors.email = 'Email không hợp lệ!';
            valid = false;
        }

        if (!password) {
            newErrors.password = 'Mật khẩu không được để trống!';
            valid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
            valid = false;
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu!';
            valid = false;
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu không khớp!';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleRegister = async (e) => {
        console.log('handleRegister triggered');
        e.preventDefault();
        setErrors({ email: '', password: '', confirmPassword: '' }); 
        setIsLoading(true);

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await sendEmailVerification(user);
            setVerificationSent(true);
            console.log('User registered successfully and verification email sent:', user.email);

        } catch (error) {
            console.error('Registration failed:', error.code, error.message);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setErrors({ ...errors, email: 'Email này đã được sử dụng!' });
                    break;
                case 'auth/invalid-email':
                    setErrors({ ...errors, email: 'Email không hợp lệ!' });
                    break;
                case 'auth/weak-password':
                    setErrors({ ...errors, password: 'Mật khẩu quá yếu!' });
                    break;
                default:
                    setErrors({ ...errors, email: error.message });
            }
        } finally {
            setIsLoading(false);
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

                {verificationSent ? (
                    <div className="text-center">
                        <p className="text-green-500 mb-4">
                            Email xác minh đã được gửi đến {email}. 
                            Vui lòng kiểm tra hộp thư và xác minh tài khoản trước khi đăng nhập!
                        </p>
                        <Button
                            text="Quay lại đăng nhập"
                            bgColor="bg-blue-500 hover:bg-blue-600"
                            textColor="text-white"
                            fullWidth
                            onClick={() => navigate(path.LOGIN)}
                        />
                    </div>
                ) : (
                    <form className="space-y-5" onSubmit={handleRegister}>
                        <div>
                            <InputForm
                                label={'Email'}
                                value={email}
                                setValue={setEmail}
                                placeholder="Nhập email của bạn"
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <InputForm
                                label={'Mật khẩu'}
                                type="password"
                                value={password}
                                setValue={setPassword}
                                placeholder="Nhập mật khẩu"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>
                        <div>
                            <InputForm
                                label={'Xác nhận mật khẩu'}
                                type="password"
                                value={confirmPassword}
                                setValue={setConfirmPassword}
                                placeholder="Xác nhận mật khẩu"
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>
                        <Button
                            text={isLoading ? "Đang xử lý..." : "Đăng ký"}
                            bgColor="bg-purple-500 hover:bg-purple-600"
                            textColor="text-white"
                            fullWidth
                            type="submit"
                            disabled={isLoading}
                            onClick={handleRegister}
                        />
                    </form>
                )}

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
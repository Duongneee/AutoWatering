import React, { memo } from 'react';

const InputForm = ({ label, type = 'text', value, setValue }) => {
    return (
        <div className="flex flex-col mb-4">
            <label htmlFor='input' className='text-sm font-semibold mb-1'>
                {label}
            </label>
            <input
                type={type} // Sử dụng thuộc tính type
                id='input' // Sửa lại id để không bị trùng lặp
                value={value} // Truyền giá trị
                onChange={(e) => setValue(e.target.value)} // Xử lý sự kiện thay đổi
                className='outline-none bg-[#e8f0fe] p-2 rounded-md w-full'
            />
        </div>
    );
}

export default memo(InputForm);

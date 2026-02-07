
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
            <h1 className="text-4xl font-bold mb-4 text-red-600">403 - Unauthorized</h1>
            <p className="text-lg mb-8">Bạn không có quyền truy cập vào trang này.</p>
            <button 
                onClick={() => navigate(-1)} 
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
                Quay lại
            </button>
        </div>
    );
};

export default Unauthorized;

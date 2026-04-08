import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const resultCode = searchParams.get('resultCode');
        const orderId = searchParams.get('orderId');

        console.log('Payment callback:', { resultCode, orderId });

        if (resultCode === '0') {
            // Thanh toán thành công
            toast.success('Payment successful!');
            navigate(`/track-order/${orderId}`);
        } else {
            // Thanh toán thất bại
            toast.error('Payment failed. Please try again.');
            navigate('/cart');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Processing payment...</p>
            </div>
        </div>
    );
};

export default PaymentCallback;
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { clearCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { TicketIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CheckoutPage = () => {
    const { items, restaurant } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        delivery_address: user?.address || '',
        payment_method: 'cash',
        notes: '',
    });

    // Voucher state
    const [vouchers, setVouchers] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [voucherCode, setVoucherCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [showVoucherList, setShowVoucherList] = useState(false);
    const [applyingVoucher, setApplyingVoucher] = useState(false);

    // Tính tổng tiền từ items
    const calculatedTotal = items.reduce((sum, item) => {
        return sum + (item.quantity * parseFloat(item.unit_price));
    }, 0);

    useEffect(() => {
        if (items.length === 0) {
            navigate('/cart');
        }
        fetchAvailableVouchers();
    }, [items, navigate]);

    const fetchAvailableVouchers = async () => {
        try {
            const response = await api.get('/vouchers/available');
            setVouchers(response.data.vouchers || []);
        } catch (error) {
            console.error('Fetch vouchers error:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Apply voucher by code
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            toast.error('Please enter voucher code');
            return;
        }

        setApplyingVoucher(true);
        try {
            const response = await api.post('/vouchers/apply', {
                code: voucherCode,
                subtotal: calculatedTotal
            });

            if (response.data.success) {
                setSelectedVoucher(response.data.voucher);
                setDiscount(response.data.voucher.discount_amount);
                toast.success('Voucher applied successfully!');
                setVoucherCode('');
            }
        } catch (error) {
            console.error('Apply voucher error:', error);
            toast.error(error.response?.data?.message || 'Invalid voucher code');
        } finally {
            setApplyingVoucher(false);
        }
    };

    // Apply voucher from list
    const handleSelectVoucher = (voucher) => {
        setSelectedVoucher(voucher);
        setDiscount(voucher.discount_amount);
        setShowVoucherList(false);
        toast.success(`Voucher ${voucher.code} applied!`);
    };

    // Remove voucher
    const handleRemoveVoucher = () => {
        setSelectedVoucher(null);
        setDiscount(0);
        toast.success('Voucher removed');
    };

    // Tạo đơn hàng (dùng chung)
    const createOrder = async (paymentMethod) => {
        setLoading(true);
        try {
            const response = await api.post('/orders', {
                delivery_address: formData.delivery_address,
                payment_method: paymentMethod,
                notes: formData.notes,
                voucher_id: selectedVoucher?.id,
                discount_amount: discount
            });

            if (response.data.success) {
                return response.data.order;
            }
        } catch (error) {
            console.error('Create order error:', error);
            toast.error(error.response?.data?.message || 'Failed to create order');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Xử lý thanh toán tiền mặt
    const handleCashOrder = async () => {
        if (!formData.delivery_address) {
            toast.error('Please enter delivery address');
            return;
        }

        const order = await createOrder('cash');
        if (order) {
            toast.success('Order placed successfully!');
            dispatch(clearCart());
            navigate(`/track-order/${order.id}`);
        }
    };

    // Xử lý thanh toán MoMo
    const handleMomoPayment = async () => {
        if (!formData.delivery_address) {
            toast.error('Please enter delivery address');
            return;
        }

        setLoading(true);
        try {
            const order = await createOrder('momo');
            if (!order) return;

            const response = await api.post('/payments/momo', {
                orderId: order.id
            });

            if (response.data.success && response.data.payUrl) {
                window.location.href = response.data.payUrl;
            } else {
                toast.error('Failed to create payment');
            }
        } catch (error) {
            console.error('MoMo payment error:', error);
            toast.error('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const deliveryFee = 15000;
    const subtotal = calculatedTotal;
    const grandTotal = subtotal + deliveryFee - discount;

    // Get discount text
    const getDiscountText = () => {
        if (!selectedVoucher) return '';
        if (selectedVoucher.discount_type === 'percentage') {
            return `${selectedVoucher.discount_value}% OFF`;
        }
        return `${selectedVoucher.discount_value.toLocaleString()}đ OFF`;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            {/* Delivery Address */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
                                <textarea
                                    name="delivery_address"
                                    required
                                    rows="3"
                                    value={formData.delivery_address}
                                    onChange={handleChange}
                                    placeholder="Enter your full delivery address"
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Voucher Section */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Voucher / Promo Code</h2>
                                    {vouchers.length > 0 && (
                                        <button
                                            onClick={() => setShowVoucherList(!showVoucherList)}
                                            className="text-primary text-sm hover:text-orange-600"
                                        >
                                            {showVoucherList ? 'Hide' : 'Available Vouchers'}
                                        </button>
                                    )}
                                </div>

                                {/* Applied Voucher */}
                                {selectedVoucher && (
                                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <TicketIcon className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium text-green-800">{selectedVoucher.name}</p>
                                                <p className="text-xs text-green-600">{getDiscountText()}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveVoucher}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}

                                {/* Voucher Input */}
                                {!selectedVoucher && (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={voucherCode}
                                            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                            placeholder="Enter voucher code"
                                            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <button
                                            onClick={handleApplyVoucher}
                                            disabled={applyingVoucher || !voucherCode.trim()}
                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                                        >
                                            {applyingVoucher ? 'Applying...' : 'Apply'}
                                        </button>
                                    </div>
                                )}

                                {/* Available Vouchers List */}
                                {showVoucherList && vouchers.length > 0 && !selectedVoucher && (
                                    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                                        {vouchers.map((voucher) => (
                                            <div
                                                key={voucher.id}
                                                onClick={() => handleSelectVoucher(voucher)}
                                                className="p-3 border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{voucher.name}</p>
                                                        <p className="text-sm text-primary">
                                                            {voucher.discount_type === 'percentage'
                                                                ? `${voucher.discount_value}% OFF`
                                                                : `${voucher.discount_value.toLocaleString()}đ OFF`}
                                                        </p>
                                                        {voucher.min_order_amount > 0 && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Min order: {voucher.min_order_amount.toLocaleString()}đ
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-400 mt-1">{voucher.description}</p>
                                                    </div>
                                                    <button className="text-primary text-sm">Apply</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="cash"
                                            checked={formData.payment_method === 'cash'}
                                            onChange={handleChange}
                                            className="mr-3"
                                        />
                                        <div>
                                            <p className="font-medium">Cash on Delivery</p>
                                            <p className="text-sm text-gray-500">Pay when you receive your order</p>
                                        </div>
                                    </label>

                                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="momo"
                                            checked={formData.payment_method === 'momo'}
                                            onChange={handleChange}
                                            className="mr-3"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium">MoMo Wallet</p>
                                            <p className="text-sm text-gray-500">Pay with MoMo e-wallet</p>
                                        </div>
                                        <img
                                            src="https://developers.momo.vn/img/logo/momo-logo.png"
                                            alt="MoMo"
                                            className="h-8"
                                        />
                                    </label>

                                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 opacity-50">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="stripe"
                                            disabled
                                            className="mr-3"
                                        />
                                        <div>
                                            <p className="font-medium">Credit Card / Stripe</p>
                                            <p className="text-sm text-gray-500">Coming soon</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Special Instructions */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-lg font-semibold mb-4">Special Instructions</h2>
                                <textarea
                                    name="notes"
                                    rows="2"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    placeholder="Any special requests? (e.g., no onions, extra sauce, etc.)"
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>

                            {/* Action Buttons */}
                            {formData.payment_method === 'cash' && (
                                <button
                                    onClick={handleCashOrder}
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                                >
                                    {loading ? <LoadingSpinner /> : `Place Order • ${grandTotal.toLocaleString()}đ`}
                                </button>
                            )}

                            {formData.payment_method === 'momo' && (
                                <button
                                    onClick={handleMomoPayment}
                                    disabled={loading}
                                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    {loading ? <LoadingSpinner /> : `Pay with MoMo • ${grandTotal.toLocaleString()}đ`}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                            <h2 className="text-xl font-semibold mb-4">Your Order</h2>

                            {restaurant && (
                                <div className="flex items-center space-x-3 pb-4 mb-4 border-b">
                                    <img
                                        src={restaurant.image_url || 'https://via.placeholder.com/50'}
                                        alt={restaurant.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm">{restaurant.name}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span>{item.quantity}x {item.menu_item?.name}</span>
                                        <span>{(item.quantity * parseFloat(item.unit_price)).toLocaleString()}đ</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t mt-4 pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>{subtotal.toLocaleString()}đ</span>
                                </div>

                                {/* Discount Line */}
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Discount</span>
                                        <span>- {discount.toLocaleString()}đ</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span>{deliveryFee.toLocaleString()}đ</span>
                                </div>

                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span className="text-primary">{grandTotal.toLocaleString()}đ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
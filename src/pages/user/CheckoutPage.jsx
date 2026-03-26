import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { clearCart } from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CheckoutPage = () => {
    const { items, restaurant, totalPrice } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        delivery_address: user?.address || '',
        payment_method: 'cash',
        notes: '',
    });

    React.useEffect(() => {
        if (items.length === 0) {
            navigate('/cart');
        }
    }, [items, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.delivery_address) {
            toast.error('Please enter delivery address');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/orders', {
                delivery_address: formData.delivery_address,
                payment_method: formData.payment_method,
                notes: formData.notes,
            });

            if (response.data.success) {
                toast.success('Order placed successfully!');
                dispatch(clearCart());
                navigate(`/track-order/${response.data.order.id}`);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const deliveryFee = 15000;
    const subtotal = totalPrice;
    const grandTotal = subtotal + deliveryFee;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                            >
                                {loading ? <LoadingSpinner /> : `Place Order • ${grandTotal.toLocaleString()}đ`}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                            <h2 className="text-xl font-semibold mb-4">Your Order</h2>

                            {/* Restaurant Info */}
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

                            {/* Items */}
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
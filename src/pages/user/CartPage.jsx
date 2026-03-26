import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart
} from '../../store/slices/cartSlice';
import toast from 'react-hot-toast';

const CartPage = () => {
    const { items, restaurant, totalItems, totalPrice } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleUpdateQuantity = async (itemId, currentQuantity, delta) => {
        const newQuantity = currentQuantity + delta;
        if (newQuantity < 1) {
            handleRemoveItem(itemId);
            return;
        }
        try {
            await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
            dispatch(fetchCart());
        } catch (error) {
            toast.error('Failed to update quantity');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await dispatch(removeFromCart(itemId)).unwrap();
            toast.success('Item removed from cart');
        } catch (error) {
            toast.error('Failed to remove item');
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Are you sure you want to clear your cart?')) {
            try {
                await dispatch(clearCart()).unwrap();
                toast.success('Cart cleared');
            } catch (error) {
                toast.error('Failed to clear cart');
            }
        }
    };

    const handleCheckout = () => {
        if (!user) {
            toast.error('Please login to checkout');
            navigate('/login');
            return;
        }
        navigate('/checkout');
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
                        <p className="text-gray-600 mb-6">
                            Looks like you haven't added any items to your cart yet.
                        </p>
                        <Link
                            to="/restaurants"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-orange-600"
                        >
                            Browse Restaurants
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const deliveryFee = 15000;
    const subtotal = totalPrice;
    const grandTotal = subtotal + deliveryFee;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Restaurant Info */}
                        {restaurant && (
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={restaurant.image_url || 'https://via.placeholder.com/60'}
                                        alt={restaurant.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold">{restaurant.name}</p>
                                        <p className="text-sm text-gray-500">{restaurant.address}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cart Items List */}
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow-md p-4">
                                <div className="flex gap-4">
                                    <img
                                        src={item.menu_item?.image_url || 'https://via.placeholder.com/80'}
                                        alt={item.menu_item?.name}
                                        className="w-20 h-20 rounded-lg object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="font-semibold">{item.menu_item?.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {item.menu_item?.discount_price ? (
                                                        <>
                                                            <span className="text-primary">
                                                                {parseFloat(item.menu_item.discount_price).toLocaleString()}đ
                                                            </span>
                                                            <span className="ml-2 line-through">
                                                                {parseFloat(item.menu_item.price).toLocaleString()}đ
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span>{parseFloat(item.unit_price).toLocaleString()}đ</span>
                                                    )}
                                                </p>
                                                {item.special_instructions && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Note: {item.special_instructions}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-primary">
                                                    {(item.quantity * parseFloat(item.unit_price)).toLocaleString()}đ
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mt-3">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                                    className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                                    className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="text-red-500 text-sm hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Clear Cart Button */}
                        <button
                            onClick={handleClearCart}
                            className="text-red-500 text-sm hover:text-red-700"
                        >
                            Clear Cart
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>{subtotal.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span>{deliveryFee.toLocaleString()}đ</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span className="text-primary">{grandTotal.toLocaleString()}đ</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
                            >
                                Proceed to Checkout
                            </button>

                            <Link
                                to={`/restaurant/${restaurant?.id}`}
                                className="block text-center mt-4 text-primary hover:text-orange-600 text-sm"
                            >
                                ← Add More Items
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
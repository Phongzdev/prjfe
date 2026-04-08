import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const ReviewModal = ({ order, isOpen, onClose, onSuccess }) => {
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/reviews', {
                order_id: order.id,
                rating,
                comment,
                images
            });

            toast.success('Review submitted successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Submit review error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Review Your Order</h2>
                    <p className="text-gray-600 mb-4">Order #{order.order_number}</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Rating Stars */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Rating *
                            </label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="focus:outline-none"
                                    >
                                        {(hoverRating || rating) >= star ? (
                                            <StarIcon className="h-8 w-8 text-yellow-400" />
                                        ) : (
                                            <StarOutlineIcon className="h-8 w-8 text-gray-300" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review
                            </label>
                            <textarea
                                rows="4"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your experience with this restaurant..."
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Submit Review'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
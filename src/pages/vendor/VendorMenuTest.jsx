import React, { useState } from 'react';

const VendorMenuTest = () => {
    const [showModal, setShowModal] = useState(false);

    // Giả lập có restaurant
    const restaurant = { id: 1, name: 'Nhà hàng cá mòi' };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Menu Management</h1>
                            <p className="text-gray-600 mt-1">Restaurant: {restaurant.name}</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-orange-500 text-white px-5 py-2 rounded-lg font-semibold text-lg"
                        >
                            ➕ Add New Item
                        </button>
                    </div>

                    <div className="mt-8 text-center text-gray-500">
                        No menu items yet. Click "Add New Item" to get started.
                    </div>

                    {showModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg">
                                <h2 className="text-xl font-bold mb-4">Add Menu Item</h2>
                                <input type="text" placeholder="Item name" className="border p-2 w-full mb-2" />
                                <input type="number" placeholder="Price" className="border p-2 w-full mb-4" />
                                <div className="flex gap-2">
                                    <button className="bg-orange-500 text-white px-4 py-2 rounded">Save</button>
                                    <button onClick={() => setShowModal(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorMenuTest;
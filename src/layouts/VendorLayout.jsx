import React from 'react';
import { Outlet } from 'react-router-dom';
import VendorSidebar from '../components/vendor/VendorSidebar';

const VendorLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <VendorSidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default VendorLayout;

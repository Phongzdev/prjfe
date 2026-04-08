import React from 'react';
import { TicketIcon } from '@heroicons/react/24/outline';

const VoucherCard = ({ voucher, onApply, isSelected }) => {
    const getDiscountText = () => {
        if (voucher.discount_type === 'percentage') {
            return `${voucher.discount_value}% OFF`;
        }
        return `${voucher.discount_value.toLocaleString()}đ OFF`;
    };

    return (
        <div
            onClick={() => onApply(voucher)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-gray-200 hover:border-primary hover:shadow-md'
                }`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary' : 'bg-gray-100'}`}>
                    <TicketIcon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-primary'}`} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-semibold text-gray-900">{voucher.name}</p>
                            <p className="text-sm text-primary font-medium mt-1">{getDiscountText()}</p>
                        </div>
                        {isSelected && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Applied
                            </span>
                        )}
                    </div>
                    {voucher.min_order_amount > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                            Min order: {voucher.min_order_amount.toLocaleString()}đ
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{voucher.description}</p>
                </div>
            </div>
        </div>
    );
};

export default VoucherCard;
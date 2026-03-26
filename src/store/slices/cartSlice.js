import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
    const response = await api.get('/cart');
    return response.data;
});

export const addToCart = createAsyncThunk('cart/add', async (item) => {
    const response = await api.post('/cart/items', item);
    return response.data;
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }) => {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data;
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId) => {
    await api.delete(`/cart/items/${itemId}`);
    return itemId;
});

export const clearCart = createAsyncThunk('cart/clear', async () => {
    await api.delete('/cart/clear');
    return;
});

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        restaurant: null,
        totalItems: 0,
        totalPrice: 0,
        isLoading: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.items = action.payload.items || [];
                state.restaurant = action.payload.cart?.restaurant || null;
                state.totalItems = action.payload.total_items || 0;
                state.totalPrice = action.payload.total_price || 0;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                // Cập nhật totalItems từ response
                state.totalItems = action.payload.cart.total_items;
                // Thêm item mới
                state.items.push(action.payload.cartItem);
                // Tính lại totalPrice
                state.totalPrice = state.items.reduce((sum, i) => sum + (parseFloat(i.unit_price) * i.quantity), 0);
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                const index = state.items.findIndex(i => i.id === action.payload.cartItem.id);
                if (index !== -1) {
                    state.items[index] = action.payload.cartItem;
                }
                state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
                state.totalPrice = state.items.reduce((sum, i) => sum + (parseFloat(i.unit_price) * i.quantity), 0);
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.items = state.items.filter(i => i.id !== action.payload);
                state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
                state.totalPrice = state.items.reduce((sum, i) => sum + (parseFloat(i.unit_price) * i.quantity), 0);
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.items = [];
                state.restaurant = null;
                state.totalItems = 0;
                state.totalPrice = 0;
            });
    },
});

export default cartSlice.reducer;
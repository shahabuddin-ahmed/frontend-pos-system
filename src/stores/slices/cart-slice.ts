import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '@/types';

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: []
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find((item) => item.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
        return;
      }
      state.items.push(action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find((entry) => entry.id === action.payload.id);
      if (!item) return;
      item.quantity = action.payload.quantity;
      state.items = state.items.filter((entry) => entry.quantity > 0);
    },
    clearCart: (state) => {
      state.items = [];
    }
  }
});

export const { addItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

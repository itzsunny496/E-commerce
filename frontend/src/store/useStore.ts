import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface StoreState {
  user: User | null;
  setUser: (user: User | null) => void;

  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  // cartCount is derived via selector — see useCartCount() helper below

  wishlist: string[];
  toggleWishlist: (id: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),

      cart: [],
      addToCart: (item) => {
        const existing = get().cart.find(c => c.id === item.id);
        if (existing) {
          set({
            cart: get().cart.map(c =>
              c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
            ),
          });
        } else {
          set({ cart: [...get().cart, { ...item, quantity: 1 }] });
        }
      },
      removeFromCart: (id) =>
        set({ cart: get().cart.filter(c => c.id !== id) }),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ cart: get().cart.filter(c => c.id !== id) });
        } else {
          set({
            cart: get().cart.map(c =>
              c.id === id ? { ...c, quantity } : c
            ),
          });
        }
      },
      clearCart: () => set({ cart: [] }),

      wishlist: [],
      toggleWishlist: (id) => {
        const current = get().wishlist;
        set({
          wishlist: current.includes(id)
            ? current.filter(w => w !== id)
            : [...current, id],
        });
      },
    }),
    {
      name: 'nextgen-store',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        user: state.user,
      }),
    }
  )
);

// Convenient selector hooks
export const useCartCount = () =>
  useStore(state => state.cart.reduce((sum, c) => sum + c.quantity, 0));

export const useWishlistCount = () =>
  useStore(state => state.wishlist.length);

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    menuItemId: string;
}

export interface CartRestaurant {
    id: string;
    name: string;
    whatsappNumber: string | null;
    deliveryFee: number | null;
}

interface CartState {
    items: CartItem[];
    restaurant: CartRestaurant | null;
    isEnabled: boolean;
}

interface CartContextValue extends CartState {
    addItem: (item: Omit<CartItem, "quantity">, restaurant: CartRestaurant) => void;
    removeItem: (menuItemId: string) => void;
    updateQuantity: (menuItemId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    getItemQuantity: (menuItemId: string) => number;
    getTotalItems: () => number;
    getSubtotal: () => number;
    getTotal: () => number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const CART_STORAGE_KEY = "maqla_cart";

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<CartState>({
        items: [],
        restaurant: null,
        isEnabled: false,
    });

    // Load cart from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as CartState;
                setState(parsed);
            } catch (error) {
                console.error("Failed to parse cart from localStorage:", error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const addItem = (item: Omit<CartItem, "quantity">, restaurant: CartRestaurant) => {
        setState((prev) => {
            // If adding item from different restaurant, clear cart
            if (prev.restaurant && prev.restaurant.id !== restaurant.id) {
                return {
                    ...prev,
                    items: [{ ...item, quantity: 1 }],
                    restaurant,
                };
            }

            // Check if item already exists
            const existingIndex = prev.items.findIndex((i) => i.menuItemId === item.menuItemId);

            if (existingIndex >= 0) {
                // Increment quantity
                const newItems = [...prev.items];
                newItems[existingIndex] = {
                    ...newItems[existingIndex]!,
                    quantity: newItems[existingIndex]!.quantity + 1,
                };
                return { ...prev, items: newItems };
            }

            // Add new item
            return {
                ...prev,
                items: [...prev.items, { ...item, quantity: 1 }],
                restaurant,
            };
        });
    };

    const removeItem = (menuItemId: string) => {
        setState((prev) => {
            const newItems = prev.items.filter((item) => item.menuItemId !== menuItemId);
            return {
                ...prev,
                items: newItems,
                // Clear restaurant if no items left
                restaurant: newItems.length === 0 ? null : prev.restaurant,
            };
        });
    };

    const updateQuantity = (menuItemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(menuItemId);
            return;
        }

        setState((prev) => {
            const newItems = prev.items.map((item) =>
                item.menuItemId === menuItemId ? { ...item, quantity } : item
            );
            return { ...prev, items: newItems };
        });
    };

    const clearCart = () => {
        setState({
            items: [],
            restaurant: null,
            isEnabled: state.isEnabled,
        });
    };

    const toggleCart = () => {
        setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
    };

    const getItemQuantity = (menuItemId: string): number => {
        const item = state.items.find((i) => i.menuItemId === menuItemId);
        return item?.quantity ?? 0;
    };

    const getTotalItems = (): number => {
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const getSubtotal = (): number => {
        return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    const getTotal = (): number => {
        const subtotal = getSubtotal();
        const deliveryFee = state.restaurant?.deliveryFee ?? 0;
        return subtotal + deliveryFee;
    };

    const value: CartContextValue = {
        ...state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        getItemQuantity,
        getTotalItems,
        getSubtotal,
        getTotal,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

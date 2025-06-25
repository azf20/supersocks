import { create } from "zustand";
import { persist } from "zustand/middleware";
import scaffoldConfig from "~~/scaffold.config";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

export interface BasketItem {
  sockId: string; // Store as string for serialization
  count: number;
  sockData: {
    svgString: string;
    metadata?: any;
    isValid: boolean;
    errors?: string;
  };
}

export interface Basket {
  items: BasketItem[];
  totalItems: number;
}

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type GlobalState = {
  nativeCurrency: {
    price: number;
    isFetching: boolean;
  };
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  setIsNativeCurrencyFetching: (newIsNativeCurrencyFetching: boolean) => void;
  targetNetwork: ChainWithAttributes;
  setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => void;
  // Basket state
  basket: Basket;
  addToBasket: (item: Omit<BasketItem, "count">) => void;
  updateBasketItemQuantity: (sockId: string, count: number) => void;
  removeFromBasket: (sockId: string) => void;
  clearBasket: () => void;
};

export const useGlobalState = create<GlobalState>()(
  persist(
    set => ({
      nativeCurrency: {
        price: 0,
        isFetching: true,
      },
      setNativeCurrencyPrice: (newValue: number): void =>
        set(state => ({ nativeCurrency: { ...state.nativeCurrency, price: newValue } })),
      setIsNativeCurrencyFetching: (newValue: boolean): void =>
        set(state => ({ nativeCurrency: { ...state.nativeCurrency, isFetching: newValue } })),
      targetNetwork: scaffoldConfig.targetNetworks[0],
      setTargetNetwork: (newTargetNetwork: ChainWithAttributes) => set(() => ({ targetNetwork: newTargetNetwork })),
      // Basket state
      basket: {
        items: [],
        totalItems: 0,
      },
      addToBasket: (item: Omit<BasketItem, "count">) => {
        set(state => {
          const existingItem = state.basket.items.find(basketItem => basketItem.sockId === item.sockId);

          if (existingItem) {
            // Update existing item quantity
            const updatedItems = state.basket.items.map(basketItem =>
              basketItem.sockId === item.sockId ? { ...basketItem, count: basketItem.count + 1 } : basketItem,
            );

            return {
              basket: {
                ...state.basket,
                items: updatedItems,
                totalItems: state.basket.totalItems + 1,
              },
            };
          } else {
            // Add new item
            const newItem: BasketItem = { ...item, count: 1 };
            return {
              basket: {
                ...state.basket,
                items: [...state.basket.items, newItem],
                totalItems: state.basket.totalItems + 1,
              },
            };
          }
        });
      },
      updateBasketItemQuantity: (sockId: string, count: number) => {
        set(state => {
          if (count <= 0) {
            // Remove item if count is 0 or negative
            const itemToRemove = state.basket.items.find(item => item.sockId === sockId);
            const updatedItems = state.basket.items.filter(item => item.sockId !== sockId);

            return {
              basket: {
                ...state.basket,
                items: updatedItems,
                totalItems: state.basket.totalItems - (itemToRemove?.count || 0),
              },
            };
          }

          const updatedItems = state.basket.items.map(basketItem =>
            basketItem.sockId === sockId ? { ...basketItem, count } : basketItem,
          );

          const totalItems = updatedItems.reduce((sum, item) => sum + item.count, 0);

          return {
            basket: {
              ...state.basket,
              items: updatedItems,
              totalItems,
            },
          };
        });
      },
      removeFromBasket: (sockId: string) => {
        set(state => {
          const itemToRemove = state.basket.items.find(item => item.sockId === sockId);
          const updatedItems = state.basket.items.filter(item => item.sockId !== sockId);

          return {
            basket: {
              ...state.basket,
              items: updatedItems,
              totalItems: state.basket.totalItems - (itemToRemove?.count || 0),
            },
          };
        });
      },
      clearBasket: () => {
        set(() => ({
          basket: {
            items: [],
            totalItems: 0,
          },
        }));
      },
    }),
    {
      name: "super-socks-basket",
      partialize: state => ({ basket: state.basket }),
    },
  ),
);
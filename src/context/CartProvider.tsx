import { ReactElement, createContext, useMemo, useReducer } from "react";

export type CartItemType = {
  sku: string;
  name: string;
  price: number;
  qty: number;
};

type CartStateType = { cart: CartItemType[] };

const initCartState: CartStateType = { cart: [] };

const REDUCER_ACTION_TYPE = {
  ADD: "ADD",
  REMOVE: "REMOVE",
  QUANTITY: "QUANTITY",
  SUBMIT: "SUBMIT",
};

export type ReducerActionType = typeof REDUCER_ACTION_TYPE;

export type ReducerAction = {
  type: string;
  payload?: CartItemType;
};

const reducer = (
  state: CartStateType,
  action: ReducerAction
): CartStateType => {
  switch (action.type) {
    case REDUCER_ACTION_TYPE.ADD: {
      if (!action.payload) {
        throw new Error("Missing payload in ADD");
      }
      const { sku, name, price } = action.payload;
      const filteredCart: CartItemType[] = state.cart.filter(
        (item) => item.sku !== sku
      );
      const itemExist: CartItemType | undefined = state.cart.find(
        (item) => item.sku === sku
      );
      const qty: number = itemExist ? itemExist.qty + 1 : 1;
      return {
        ...state,
        cart: [...filteredCart, { sku, name, price, qty }],
      };
    }
    case REDUCER_ACTION_TYPE.REMOVE: {
      if (!action.payload) {
        throw new Error("Missing payload in REMOVE");
      }
      const { sku } = action.payload;
      const filteredCart: CartItemType[] = state.cart.filter(
        (item) => item.sku !== sku
      );
      return { ...state, cart: [...filteredCart] };
    }
    case REDUCER_ACTION_TYPE.QUANTITY: {
      if (!action.payload) {
        throw new Error("Missing payload in QUNATITY");
      }
      const { sku, qty } = action.payload;

      const itemExist: CartItemType | undefined = state.cart.find(
        (item) => item.sku === sku
      );

      if (!itemExist) {
        throw new Error(`Item with sku ${sku} does not exist`);
      }
      const updatedItem: CartItemType = {
        ...itemExist,
        qty: qty,
      };

      const filteredCart: CartItemType[] = state.cart.filter(
        (item) => item.sku !== sku
      );
      return { ...state, cart: [...filteredCart, updatedItem] };
    }
    case REDUCER_ACTION_TYPE.SUBMIT: {
      return { ...state, cart: [] };
    }
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const useCartContext = (initCartState: CartStateType) => {
  const [state, dispatch] = useReducer(reducer, initCartState);

  const REDUCER_ACTIONS = useMemo(() => {
    return REDUCER_ACTION_TYPE;
  }, []);

  const totalItems = state.cart.reduce((acc, item) => acc + item.qty, 0);

  const totalPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(
    state.cart.reduce(
      (prevValue, cartItem) => prevValue + cartItem.qty * cartItem.price,
      0
    )
  );
  //   const cart = state.cart.sort((a, b) => a.sku.localeCompare(b.sku));
  const cart = state.cart.sort((a, b) => {
    const itemA = Number(a.sku.slice(-4));
    const itemB = Number(b.sku.slice(-4));
    return itemA - itemB;
  });

  //   const addItemToCart = (item: CartItemType) => {
  //     dispatch({ type: REDUCER_ACTIONS.ADD, payload: item });
  //   };
  //   const removeItemFromCart = (sku: CartItemType) => {
  //     dispatch({ type: REDUCER_ACTIONS.REMOVE, payload: sku });
  //   };
  //   const updateItemQty = (item: CartItemType, qty: number) => {
  //     dispatch({ type: REDUCER_ACTIONS.QUANTITY, payload: { ...item, qty } });
  //   };
  //   const submitCart = () => {
  //     dispatch({ type: REDUCER_ACTIONS.SUBMIT });
  //   };
  return {
    dispatch,
    REDUCER_ACTIONS,
    totalItems,
    totalPrice,
    cart,
  };
};

export type UseCartContextType = ReturnType<typeof useCartContext>;

const initCartContextState: UseCartContextType = {
  dispatch: () => {},
  REDUCER_ACTIONS: REDUCER_ACTION_TYPE,
  totalItems: 0,
  totalPrice: "$0.00",
  cart: [],
};

export const CartContext =
  createContext<UseCartContextType>(initCartContextState);

type ChildrenType = { children?: ReactElement | ReactElement[] };

export const CartProvider = ({ children }: ChildrenType): ReactElement => {
  return (
    <CartContext.Provider value={useCartContext(initCartState)}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;

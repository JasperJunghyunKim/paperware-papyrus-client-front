export interface Quantity {
  totalQuantity: number;
  availableQuantity: number;
  storingQuantity: number;
  nonStoringQuantity: number;
  totalArrivalQuantity: number;
}

export interface Stock {
  warehouse: {} | null;
}

export interface QuantityCompact {
  availableQuantity: number;
  totalQuantity: number;
}

export function compact(stock: Stock, quantity: Quantity): QuantityCompact {
  return {
    availableQuantity: stock.warehouse
      ? quantity.availableQuantity
      : quantity.storingQuantity,
    totalQuantity: stock.warehouse ? quantity.totalQuantity : 0,
  };
}

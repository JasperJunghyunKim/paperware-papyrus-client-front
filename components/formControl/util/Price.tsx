import { Model } from "@/@shared";

export interface StockPriceType {
  officialPriceType: Model.Enum.OfficialPriceType;
  officialPrice: number;
  officialPriceUnit: Model.Enum.PriceUnit;
  discountType: Model.Enum.DiscountType;
  discountPrice: number;
  unitPrice: number;
  unitPriceUnit: Model.Enum.PriceUnit;
}

export function initialStockPrice(
  packagingType: Model.Enum.PackagingType
): StockPriceType {
  switch (packagingType) {
    case "ROLL":
      return {
        officialPriceType: "NONE",
        officialPrice: 0,
        officialPriceUnit: "WON_PER_TON",
        discountType: "DEFAULT",
        discountPrice: 0,
        unitPrice: 0,
        unitPriceUnit: "WON_PER_TON",
      };
    case "BOX":
      return {
        officialPriceType: "NONE",
        officialPrice: 0,
        officialPriceUnit: "WON_PER_BOX",
        discountType: "DEFAULT",
        discountPrice: 0,
        unitPrice: 0,
        unitPriceUnit: "WON_PER_BOX",
      };
    default:
      return {
        officialPriceType: "NONE",
        officialPrice: 0,
        officialPriceUnit: "WON_PER_REAM",
        discountType: "DEFAULT",
        discountPrice: 0,
        unitPrice: 0,
        unitPriceUnit: "WON_PER_REAM",
      };
  }
}

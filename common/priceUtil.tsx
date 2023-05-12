import { Model } from "@/@shared";

export interface Packaging {
  type: "ROLL" | "BOX" | "REAM" | "SKID";
  packA: number;
  packB: number;
}

export interface Spec {
  grammage: number;
  sizeX: number;
  sizeY: number;
  packaging: Packaging;
}

export const convertPrice = (p: {
  origPrice: number;
  srcUnit: Model.Enum.PriceUnit;
  dstUnit: Model.Enum.PriceUnit;
  spec: Spec;
}) => {
  const packtype = () => p.spec.packaging.type;
  const calcPackUnit = () =>
    packtype() === "BOX" ? p.spec.packaging.packA * p.spec.packaging.packB : 1;
  const calcRect = () => p.spec.sizeX * (p.spec.sizeY || 1);

  const gpr = p.spec.grammage * calcRect() * 500 * 0.001 * 0.001;
  const gpb = p.spec.grammage * calcRect() * calcPackUnit() * 0.001 * 0.001;
  const rpb = calcPackUnit() / 500;

  switch (p.srcUnit) {
    case "WON_PER_TON":
      if (p.dstUnit == "WON_PER_REAM") {
        return p.origPrice * gpr;
      } else if (p.dstUnit == "WON_PER_BOX") {
        return p.origPrice * gpb;
      }
      break;
    case "WON_PER_BOX":
      if (p.dstUnit == "WON_PER_TON") {
        return p.origPrice / gpb;
      } else if (p.dstUnit == "WON_PER_REAM") {
        return p.origPrice / rpb;
      }
      break;
    case "WON_PER_REAM":
      if (p.dstUnit == "WON_PER_TON") {
        return p.origPrice / gpr;
      } else if (p.dstUnit == "WON_PER_BOX") {
        return p.origPrice / rpb;
      }
      break;
  }

  return p.origPrice;
};

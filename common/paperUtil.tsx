export interface Packaging {
  type: "ROLL" | "BOX" | "REAM" | "SKID";
  packA: number;
  packB: number;
}

export interface QuantitySpec {
  grammage: number;
  sizeX: number;
  sizeY: number;
  packaging: Packaging;
}

export interface Quantity {
  quantity: number;
  packed: PackedQuantity | null;
  unpacked: UnpackedQuantity | null;
  grams: number;
}

export interface PackedQuantity {
  value: number;
  unit: "BOX" | "R" | "m";
}

export interface UnpackedQuantity {
  value: number;
  unit: "매" | "T";
}

export function convertQuantity(
  spec: QuantitySpec,
  quantity: number
): Quantity {
  const packtype = () => spec.packaging.type;
  const calcPackUnit = () =>
    packtype() === "BOX" ? spec.packaging.packA * spec.packaging.packB : 1;
  const calcSheets = () =>
    packtype() === "ROLL" ? 0 : quantity * calcPackUnit();
  const calcRect = () => spec.sizeX * (spec.sizeY || 1);
  const calcGrams = () =>
    packtype() === "ROLL"
      ? quantity
      : spec.grammage * calcRect() * calcSheets() * 0.001 * 0.001;
  const calcMeters = () => calcGrams() / spec.grammage / spec.sizeX / 0.001;
  const calcPacked = (): PackedQuantity | null =>
    packtype() === "ROLL"
      ? { value: calcMeters(), unit: "m" }
      : packtype() === "BOX"
      ? { value: quantity, unit: "BOX" }
      : { value: calcSheets() / 500, unit: "R" };
  const calcUnpacked = (): UnpackedQuantity | null =>
    packtype() === "REAM" || packtype() === "SKID"
      ? { value: quantity, unit: "매" }
      : packtype() === "BOX"
      ? { value: quantity * calcPackUnit(), unit: "매" }
      : null;

  return {
    quantity: quantity,
    unpacked: calcUnpacked(),
    packed: calcPacked(),
    grams: calcGrams(),
  };
}

export function convertQuantityWith(
  spec: QuantitySpec,
  unit: "매" | "R" | "BOX" | "m" | "T",
  value: number
): Quantity | null {
  const packtype = () => spec.packaging.type;
  const calcPackUnit = () =>
    packtype() === "BOX" ? spec.packaging.packA * spec.packaging.packB : 1;
  const calcQuantity = (): number | null =>
    packtype() === "BOX"
      ? unit === "매"
        ? value / calcPackUnit()
        : unit === "R"
        ? calcPackUnit() / (value * 500)
        : unit === "BOX"
        ? value
        : null
      : packtype() === "ROLL"
      ? unit === "m"
        ? spec.grammage * spec.sizeX * value * 0.001
        : unit === "T"
        ? value
        : null
      : packtype() === "REAM"
      ? unit === "매"
        ? value
        : unit === "R"
        ? value * 500
        : null
      : unit === "매"
      ? value
      : unit === "R"
      ? value * 500
      : null;

  const quantity = calcQuantity();
  return quantity ? convertQuantity(spec, quantity) : null;
}

export function recommendedPrecision(
  unit: "매" | "R" | "BOX" | "m" | "T"
): number {
  return unit === "T" || unit === "R" ? 3 : unit === "m" ? 1 : 0;
}

import { Protocol } from "@/common";
import { TbCrop, TbFilePower, TbRefresh, TbScript } from "react-icons/tb";

export type TradeIconType = "PURCHASE" | "SALES";

interface Props {
  type?: TradeIconType;
}

export default function Component(props: Props) {
  switch (props.type) {
    case "PURCHASE":
      return <TbScript />;
    case "SALES":
      return <TbFilePower />;
    default:
      return null;
  }
}

import { Model } from "@/@shared";
import {
  TbCheck,
  TbCircleMinus,
  TbPlayerPlayFilled,
  TbPlayerStop,
} from "react-icons/tb";

interface Props {
  value?: Model.Enum.OrderStatus | null;
}

export default function Component(props: Props) {
  switch (props.value) {
    case "ORDER_PREPARING":
    case "OFFER_PREPARING":
      return <TbPlayerStop />;
    case "ORDER_REQUESTED":
    case "OFFER_REQUESTED":
      return <TbPlayerPlayFilled />;
    case "ORDER_REJECTED":
    case "OFFER_REJECTED":
      return <TbCircleMinus />;
    case "ACCEPTED":
      return <TbCheck />;
    default:
      return null;
  }
}

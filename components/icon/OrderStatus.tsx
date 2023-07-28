import { Model } from "@/@shared";
import {
  TbCheck,
  TbCircleMinus,
  TbCircleX,
  TbPlayerPlayFilled,
  TbPlayerStop,
  TbX,
} from "react-icons/tb";

interface Props {
  value?: Model.Enum.OrderStatus | null;
}

export default function Component(props: Props) {
  switch (props.value) {
    case "ORDER_PREPARING":
    case "OFFER_PREPARING":
      return <TbPlayerStop size={24} />;
    case "ORDER_REQUESTED":
    case "OFFER_REQUESTED":
      return <TbPlayerPlayFilled size={24} />;
    case "ORDER_REJECTED":
    case "OFFER_REJECTED":
      return <TbCircleMinus size={24} />;
    case "ACCEPTED":
      return <TbCheck size={24} />;
    case "CANCELLED":
      return <TbX size={24} />;
    default:
      return null;
  }
}

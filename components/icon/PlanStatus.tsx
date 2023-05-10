import { Model } from "@/@shared";
import { TbCheck, TbPlayerPlayFilled, TbPlayerStop } from "react-icons/tb";

interface Props {
  value?: Model.Enum.PlanStatus | null;
}

export default function Component(props: Props) {
  switch (props.value) {
    case "PREPARING":
      return <TbPlayerStop />;
    case "PROGRESSING":
      return <TbPlayerPlayFilled />;
    case "PROGRESSED":
      return <TbCheck />;
    default:
      return null;
  }
}

import { DiscountRateMappingQuery } from "@/@shared/api/inhouse/discount-rate.request";
import { Popup } from "@/components";

type Open = DiscountRateMappingQuery | null;

interface Props {
  type: "purchase" | "sales";
  open: Open;
  onClose: (unit: false) => void;
}

export default function (props: Props) {
  return (
    <Popup.Template.Full
      title={`${props.type === "purchase" ? "매입" : "매출"}할인율 선택`}
      width="calc(100vw - 400px)"
      height="600px"
      {...props}
      open={!!props.open}
    >
      <div>todo</div>
    </Popup.Template.Full>
  );
}


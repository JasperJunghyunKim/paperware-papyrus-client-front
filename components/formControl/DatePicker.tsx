import { Util } from "@/common";
import { DatePicker } from "antd";

interface Props {
  value?: string;
  onChange?: (value: string | undefined) => void;
  disabled?: boolean;
}

export default function Component(props: Props) {
  return (
    <div className="flex flex-col gap-y-1">
      <DatePicker
        value={Util.iso8601ToDate(props.value)}
        onChange={(x) => props.onChange?.(Util.dateToIso8601(x))}
        disabled={props.disabled}
      />
    </div>
  );
}

import { Util } from "@/common";
import { DatePicker } from "antd";

interface Props {
  /**
   * value 로 하게 되면 props value mount가 되지 않으므로 defaultPickerValue 변수명 변경 처리
   */
  datePickerValue?: string;
  onChange?: (value: string | undefined) => void;
  disabled?: boolean;
}

export default function Component(props: Props) {
  return (
    <div className="flex flex-col gap-y-1">
      <DatePicker
        value={Util.iso8601ToDate(props.datePickerValue)}
        onChange={(x) => props.onChange?.(Util.dateToIso8601(x))}
        disabled={props.disabled}
      />
    </div>
  );
}

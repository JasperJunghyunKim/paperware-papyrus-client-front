import { Util } from "@/common";
import { DatePicker } from "antd";
import classNames from "classnames";

interface Props {
  value?: string;
  onChange?: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  rootClassName?: string;
}

export default function Component(props: Props) {
  return (
    <div className="flex-initial flex flex-col gap-y-1">
      <DatePicker
        value={Util.iso8601ToDate(props.value)}
        onChange={(x) => props.onChange?.(Util.dateToIso8601(x))}
        disabled={props.disabled}
        placeholder={props.placeholder}
        className={classNames("w-full", props.rootClassName)}
      />
    </div>
  );
}

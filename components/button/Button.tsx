import { Util } from "@/common";
import classNames from "classnames";
import { ReactNode, useCallback, useState } from "react";

export type ButtonType = "default" | "primary" | "secondary";

export interface Props {
  icon?: ReactNode;
  label?: string;
  type?: ButtonType;
  onClick?: Util.PromiseOrFn;
  submit?: boolean;
  hidden?: boolean;
  rootClassName?: string;
  disabled?: boolean;
}

export default function Component(props: Props) {
  const buttonType = props.type ?? "default";
  const [pending, setPending] = useState(false);

  const call = useCallback(async () => {
    if (pending) {
      return;
    }

    setPending(true);
    await Util.call(props.onClick);
    setPending(false);
  }, [props.onClick]);

  return (
    <>
      {!props.hidden && (
        <button
          className={classNames(
            "px-2 py-1.5 rounded flex flex-row justify-center border border-solid select-none disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:text-gray-600 disabled:border-gray-400 disabled:hover:border-gray-400 disabled:cursor-not-allowed",
            {
              "bg-gray-400 hover:bg-gray-400 text-gray-600 cursor-not-allowed":
                pending,
              "bg-gray-50 hover:bg-white text-gray-800 border-gray-300 hover:border-gray-600":
                !pending && buttonType === "default",
              "bg-cyan-600 hover:bg-cyan-500 text-white":
                !pending && buttonType === "primary",
              "bg-green-700 hover:bg-green-600 text-white":
                !pending && buttonType === "secondary",
            },
            props.rootClassName
          )}
          onClick={() => call()}
          type={props.submit ? "submit" : "button"}
          disabled={props.disabled}
        >
          {props.icon && (
            <div className="flex-initial text-2xl flex flex-col justify-center">
              {props.icon}
            </div>
          )}
          <div className="flex-initial px-1 -mt-px flex flex-col justify-center h-full flex-nowrap whitespace-nowrap">
            {props.label}
          </div>
        </button>
      )}
    </>
  );
}

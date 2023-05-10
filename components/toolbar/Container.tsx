import classNames from "classnames";
import { PropsWithChildren } from "react";

interface Props {
  rootClassName?: string;
}

export default function Container(props: PropsWithChildren<Props>) {
  return (
    <div
      className={classNames(
        "flex-initial flex flex-row gap-x-2",
        props.rootClassName
      )}
    >
      {props.children}
    </div>
  );
}

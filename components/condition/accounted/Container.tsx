import { PropsWithChildren } from "react";

export default function Container(props: PropsWithChildren) {
  return (
    <div className="flex flex-row w-full">{props.children}</div>
  );
}

import ImageLogo from "@/assets/logo.png";
import Image from "next/image";

export default function Component(props: { classNames?: string }) {
  return <Image src={ImageLogo} alt="PAPERWARE" className={props.classNames} />;
}

import { Util } from "@/common";
import { Select } from "antd";

interface Props {
  sizeX: number | null | undefined;
  sizeY: number | null | undefined;
  onChange: (sizeX: number, sizeY: number) => void;
}

export default function Component(props: Props) {
  const paperSize =
    props.sizeX && props.sizeY
      ? Util.findPaperSize(props.sizeX, props.sizeY)
      : null;

  return (
    <Select
      options={Util.paperSizes.map((p) => ({
        label: p.name,
        value: `${p.sizeX}x${p.sizeY}`,
      }))}
      value={paperSize ? `${paperSize.sizeX}x${paperSize.sizeY}` : undefined}
      onChange={(value) => {
        const [sizeX, sizeY] = value.split("x").map((x) => parseInt(x));
        props.onChange(sizeX, sizeY);
      }}
      placeholder="규격 없음"
    />
  );
}

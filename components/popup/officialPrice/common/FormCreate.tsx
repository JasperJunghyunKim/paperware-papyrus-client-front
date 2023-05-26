import { Api, Model } from "@/@shared";
import { OfficialPriceCreateRequest } from "@/@shared/api/inhouse/official-price.request";
import { Util } from "@/common";
import { Button, FormControl } from "@/components";
import { Number } from "@/components/formControl";
import { Form, FormInstance, Input, Select, Switch } from "antd";
import { useWatch } from "antd/lib/form/Form";

type DataType = OfficialPriceCreateRequest;
const PRICE_UNIT_OPTIONS = [
  {
    label: "/T",
    value: "WON_PER_TON" as Model.Enum.PriceUnit,
  },
  {
    label: "/BOX",
    value: "WON_PER_BOX" as Model.Enum.PriceUnit,
  },
  {
    label: "/R",
    value: "WON_PER_REAM" as Model.Enum.PriceUnit,
  },
];

interface Props {
  form: FormInstance<DataType>;
  onFinish: (values: DataType) => void;
}

export default function Component(props: Props) {
  const sizeX = useWatch("sizeX", props.form);
  const sizeY = useWatch("sizeY", props.form);

  return (
    <Form form={props.form} onFinish={props.onFinish} layout="vertical">
      <Form.Item name="productId" label="제품" rules={[{ required: true }]}>
        <FormControl.SelectProduct />
      </Form.Item>
      <Form.Item
        name="grammage"
        label="평량"
        rules={[{ required: true }]}
        rootClassName="flex-1"
      >
        <Number min={0} max={9999} precision={0} unit={Util.UNIT_GPM} />
      </Form.Item>
      <Form.Item>
        <div className="flex justify-between gap-x-2">
          <Form.Item label="규격" rootClassName="flex-1">
            <FormControl.Util.PaperSize
              sizeX={sizeX}
              sizeY={sizeY}
              onChange={(sizeX, sizeY) =>
                props.form.setFieldsValue({ sizeX, sizeY })
              }
            />
          </Form.Item>
          <Form.Item name="sizeX" label="지폭" rootClassName="flex-1">
            <Number min={0} max={9999} precision={0} unit="mm" />
          </Form.Item>
          <Form.Item name="sizeY" label="지장" rootClassName="flex-1">
            <Number min={0} max={9999} precision={0} unit="mm" />
          </Form.Item>
        </div>
      </Form.Item>
      <Form.Item name="paperColorGroupId" label="색군">
        <FormControl.SelectColorGroup />
      </Form.Item>
      <Form.Item name="paperColorId" label="색상">
        <FormControl.SelectColor />
      </Form.Item>
      <Form.Item name="paperPatternId" label="무늬">
        <FormControl.SelectPattern />
      </Form.Item>
      <Form.Item name="paperCertId" label="인증">
        <FormControl.SelectCert />
      </Form.Item>
      <Form.Item label="도가" required>
        <div className="flex gap-x-2">
          <Form.Item
            name={["wholesalePrice", "officialPrice"]}
            rootClassName="flex-1"
            rules={[{ required: true }]}
          >
            <Number min={0} max={99999999} precision={0} unit="원" />
          </Form.Item>
          <Form.Item
            name={["wholesalePrice", "officialPriceUnit"]}
            rootClassName="flex-1"
            rules={[{ required: true }]}
          >
            <Select options={PRICE_UNIT_OPTIONS} rootClassName="flex-1" />
          </Form.Item>
        </div>
      </Form.Item>
      <Form.Item label="실가" required>
        <div className="flex gap-x-2">
          <Form.Item
            name={["retailPrice", "officialPrice"]}
            rootClassName="flex-1"
            rules={[{ required: true }]}
          >
            <Number min={0} max={99999999} precision={0} unit="원" />
          </Form.Item>
          <Form.Item
            name={["retailPrice", "officialPriceUnit"]}
            rootClassName="flex-1"
            rules={[{ required: true }]}
          >
            <Select options={PRICE_UNIT_OPTIONS} rootClassName="flex-1" />
          </Form.Item>
        </div>
      </Form.Item>
      <Form.Item className="flex justify-end">
        <Button.Preset.Submit label="고시가 추가" />
      </Form.Item>
      <div className="h-16" />
    </Form>
  );
}

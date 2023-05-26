import { Api, Model } from "@/@shared";
import { OfficialPriceUpdateRequest } from "@/@shared/api/inhouse/official-price.request";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input, Select, Switch } from "antd";
import { Number } from "@/components/formControl";
import { useWatch } from "antd/lib/form/Form";
import { Util } from "@/common";

type RecordType = Model.OfficialPriceCondition;
type DataType = OfficialPriceUpdateRequest;
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
  edit: boolean;
  onEditChange: (edit: boolean) => void;
}

export default function Component(props: Props) {
  const sizeX = useWatch("sizeX", props.form);
  const sizeY = useWatch("sizeY", props.form);

  return (
    <Form
      form={props.form}
      onFinish={(values) => {
        props.onFinish(values);
      }}
      layout="vertical"
      disabled={!props.edit}
      rootClassName="flex flex-col gap-y-4"
    >
      <div className="flex flex-row justify-end gap-x-2">
        <Button.Preset.Edit
          label="내용 수정"
          onClick={() => props.onEditChange(true)}
          hidden={props.edit}
        />
        <Button.Default
          label="수정 취소"
          onClick={() => props.onEditChange(false)}
          hidden={!props.edit}
        />
        <Button.Preset.Submit label="내용 저장" hidden={!props.edit} />
      </div>
      <div className="h-px bg-gray-200" />
      <Form.Item name="productId" label="제품" rules={[{ required: true }]}>
        <FormControl.SelectProduct disabled />
      </Form.Item>
      <Form.Item
        name="grammage"
        label="평량"
        rules={[{ required: true }]}
        rootClassName="flex-1"
      >
        <Number
          min={0}
          max={9999}
          precision={0}
          unit={Util.UNIT_GPM}
          disabled
        />
      </Form.Item>
      <Form.Item>
        <div className="flex justify-between gap-x-2">
          <Form.Item label="규격" rootClassName="flex-1">
            <FormControl.Util.PaperSize
              sizeX={sizeX}
              sizeY={sizeY}
              onChange={() => {}}
              disabled
            />
          </Form.Item>
          <Form.Item name="sizeX" label="지폭" rootClassName="flex-1">
            <Number min={0} max={9999} precision={0} unit="mm" disabled />
          </Form.Item>
          <Form.Item name="sizeY" label="지장" rootClassName="flex-1">
            <Number min={0} max={9999} precision={0} unit="mm" disabled />
          </Form.Item>
        </div>
      </Form.Item>
      <Form.Item name="paperColorGroupId" label="색군">
        <FormControl.SelectColorGroup disabled />
      </Form.Item>
      <Form.Item name="paperColorId" label="색상">
        <FormControl.SelectColor disabled />
      </Form.Item>
      <Form.Item name="paperPatternId" label="무늬">
        <FormControl.SelectPattern disabled />
      </Form.Item>
      <Form.Item name="paperCertId" label="인증">
        <FormControl.SelectCert disabled />
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
      <div className="h-16" />
    </Form>
  );
}

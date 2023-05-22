import { Model } from "@/@shared";
import { DiscountRateUpdateRequest } from "@/@shared/api/inhouse/discount-rate.request";
import DiscountRateCondition from "@/@shared/models/discount-rate-condition";
import { Util } from "@/common";
import { Button, FormControl } from "@/components";
import { Number } from "@/components/formControl";
import { Form, FormInstance, Select } from "antd";
import { useWatch } from "antd/lib/form/Form";

type RecordType = DiscountRateCondition;
type DataType = DiscountRateUpdateRequest;
const PRICE_UNIT_OPTIONS: {
  label: string;
  value: Model.Enum.DiscountRateUnit;
}[] = [
  {
    label: "%",
    value: "PERCENT",
  },
  {
    label: "원/T",
    value: "WON_PER_TON",
  },
  {
    label: "원/BOX",
    value: "WON_PER_BOX",
  },
  {
    label: "원/R",
    value: "WON_PER_REAM",
  },
];

interface Props {
  form: FormInstance<DataType>;
  onFinish: (values: DataType) => void;
  edit: boolean;
  onEditChange: (edit: boolean) => void;
}

export default function Component(props: Props) {
  const basicUnit = useWatch(
    ["basicDiscountRate", "discountRateUnit"],
    props.form
  );
  const specialUnit = useWatch(
    ["specialDiscountRate", "discountRateUnit"],
    props.form
  );
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
      <Form.Item name="paperDomainId" label="제품 유형">
        <FormControl.SelectPaperDomain disabled />
      </Form.Item>
      <Form.Item name="paperGroupId" label="지군">
        <FormControl.SelectPaperGroup disabled />
      </Form.Item>
      <Form.Item name="paperTypeId" label="지종">
        <FormControl.SelectPaperType disabled />
      </Form.Item>
      <Form.Item name="manufacturerId" label="제지사">
        <FormControl.SelectManufacturer disabled />
      </Form.Item>
      <Form.Item name="packagingType" label="포장 유형">
        <FormControl.SelectPackagingType disabled />
      </Form.Item>
      <Form.Item name="grammage" label="평량" rootClassName="flex-1">
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
      <Form.Item label="기본" required>
        <div className="flex gap-x-2">
          <Form.Item
            name={["basicDiscountRate", "discountRate"]}
            rootClassName="flex-1"
            rules={[{ required: true }]}
          >
            <Number
              min={0}
              max={99999999}
              precision={basicUnit === "PERCENT" ? 3 : 0}
            />
          </Form.Item>
          <Form.Item
            name={["basicDiscountRate", "discountRateUnit"]}
            rootClassName="flex-1"
            rules={[{ required: true }]}
          >
            <Select options={PRICE_UNIT_OPTIONS} rootClassName="flex-1" />
          </Form.Item>
        </div>
      </Form.Item>
      <Form.Item label="특가" required>
        <div className="flex gap-x-2">
          <Form.Item
            name={["specialDiscountRate", "discountRate"]}
            rootClassName="flex-1"
            rules={[{ required: true }]}
          >
            <Number
              min={0}
              max={99999999}
              precision={specialUnit === "PERCENT" ? 3 : 0}
            />
          </Form.Item>
          <Form.Item
            name={["specialDiscountRate", "discountRateUnit"]}
            rootClassName="flex-1"
            rules={[{ required: true }]}
          >
            <Select options={PRICE_UNIT_OPTIONS} rootClassName="flex-1" />
          </Form.Item>
        </div>
      </Form.Item>
      <Form.Item className="flex justify-end">
        <Button.Preset.Submit label="할인율 추가" />
      </Form.Item>
      <div className="h-16" />
    </Form>
  );
}

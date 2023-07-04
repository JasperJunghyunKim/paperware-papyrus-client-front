import { Model } from "@/@shared";
import { DiscountRateCreateRequest } from "@/@shared/api/inhouse/discount-rate.request";
import { Util } from "@/common";
import { Button, FormControl } from "@/components";
import { Number } from "@/components/formControl";
import { Form, FormInstance, Select } from "antd";
import { useWatch } from "antd/lib/form/Form";

type DataType = DiscountRateCreateRequest;
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
    <Form form={props.form} onFinish={props.onFinish} layout="vertical">
      <Form.Item
        name="companyRegistrationNumber"
        label="거래처"
        rules={[{ required: true }]}
      >
        <FormControl.SelectPartner />
      </Form.Item>
      <Form.Item name="paperDomainId" label="제품 유형">
        <FormControl.SelectPaperDomain />
      </Form.Item>
      <Form.Item name="paperGroupId" label="지군">
        <FormControl.SelectPaperGroup />
      </Form.Item>
      <Form.Item name="paperTypeId" label="지종">
        <FormControl.SelectPaperType />
      </Form.Item>
      <Form.Item name="manufacturerId" label="제지사">
        <FormControl.SelectManufacturer />
      </Form.Item>
      <Form.Item name="packagingType" label="포장">
        <FormControl.SelectPackagingType showNone />
      </Form.Item>
      <Form.Item name="grammage" label="평량" rootClassName="flex-1">
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

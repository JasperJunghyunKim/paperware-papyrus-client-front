import { Model } from "@/@shared";
import { DiscountType, OfficialPriceType } from "@/@shared/models/enum";
import { ApiHook, Util } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Number } from "@/components/formControl";
import { Form } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";

type OpenType =
  | {
      planId: number;
      productId: number;
      packagingId: number;
      grammage: number;
      sizeX: number;
      sizeY: number;
      paperColorGroupId: number | null;
      paperColorId: number | null;
      paperPatternId: number | null;
      paperCertId: number | null;
      quantity: number;
    }
  | false;
export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
}

interface FormType {
  productId: number;
  packagingId: number;
  grammage: number;
  sizeX: number;
  sizeY: number;
  paperColorGroupId: number | null;
  paperColorId: number | null;
  paperPatternId: number | null;
  paperCertId: number | null;
  quantity: number;
  stockPrice: number;

  officialPriceType: OfficialPriceType;
  officialPrice: number;
  officialPriceUnit: Model.Enum.PriceUnit;
  discountType: DiscountType;
  discountPrice: number;
  unitPrice: number;
  unitPriceUnit: Model.Enum.PriceUnit;
}

export default function Component(props: Props) {
  const metadata = ApiHook.Static.PaperMetadata.useGetAll();

  const [form] = useForm<FormType>();
  const packagingId = useWatch(["packagingId"], form);
  const grammage = useWatch(["grammage"], form);
  const sizeX = useWatch(["sizeX"], form);
  const sizeY = useWatch(["sizeY"], form);

  const packaging = metadata.data?.packagings.find((x) => x.id === packagingId);

  const apiUpdateSpec = ApiHook.Trade.Common.useUpdateArrivalSpec();
  const cmdUpdateSpec = useCallback(async () => {
    if (!props.open) return;

    const values = await form.validateFields();

    await apiUpdateSpec.mutateAsync({
      data: {
        planId: props.open.planId,
        productId: props.open.productId,
        packagingId: props.open.packagingId,
        grammage: props.open.grammage,
        sizeX: props.open.sizeX,
        sizeY: props.open.sizeY,
        paperColorGroupId: Util.falsyToUndefined(props.open.paperColorGroupId),
        paperColorId: Util.falsyToUndefined(props.open.paperColorId),
        paperPatternId: Util.falsyToUndefined(props.open.paperPatternId),
        paperCertId: Util.falsyToUndefined(props.open.paperCertId),
        spec: {
          productId: values.productId,
          packagingId: values.packagingId,
          grammage: values.grammage,
          sizeX: values.sizeX,
          sizeY: values.sizeY,
          paperColorGroupId: Util.falsyToUndefined(values.paperColorGroupId),
          paperColorId: Util.falsyToUndefined(values.paperColorId),
          paperPatternId: Util.falsyToUndefined(values.paperPatternId),
          paperCertId: Util.falsyToUndefined(values.paperCertId),
          quantity: values.quantity,
        },
      },
    });

    props.onClose(false);
  }, [apiUpdateSpec, props, form]);

  useEffect(() => {
    if (!packaging) {
      return;
    }

    form.setFieldValue(
      "stockPrice",
      FormControl.Util.Price.initialStockPrice(packaging.type)
    );
  }, [packagingId, grammage, sizeX, sizeY]);

  useEffect(() => {
    if (props.open) {
      form.setFieldsValue({
        productId: props.open.productId,
        packagingId: props.open.packagingId,
        grammage: props.open.grammage,
        sizeX: props.open.sizeX,
        sizeY: props.open.sizeY,
        paperColorGroupId: Util.falsyToUndefined(props.open.paperColorGroupId),
        paperColorId: Util.falsyToUndefined(props.open.paperColorId),
        paperPatternId: Util.falsyToUndefined(props.open.paperPatternId),
        paperCertId: Util.falsyToUndefined(props.open.paperCertId),
        quantity: props.open.quantity,
      } as any);
    } else {
      form.resetFields();
    }
  }, [props.open]);

  return (
    <Popup.Template.Property
      title="예정 재고 수정"
      {...props}
      open={!!props.open}
    >
      <div className="flex-1 p-4">
        <Form form={form} layout="vertical">
          <Form.Item
            name="packagingId"
            label="포장"
            rules={[{ required: true }]}
          >
            <FormControl.SelectPackaging />
          </Form.Item>
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
          {packaging && (
            <Form.Item>
              <div className="flex justify-between gap-x-2">
                {packaging.type !== "ROLL" && (
                  <Form.Item label="규격" rootClassName="flex-1">
                    <FormControl.Util.PaperSize
                      sizeX={sizeX}
                      sizeY={sizeY}
                      onChange={(sizeX, sizeY) =>
                        form.setFieldsValue({ sizeX, sizeY })
                      }
                    />
                  </Form.Item>
                )}
                <Form.Item
                  name="sizeX"
                  label="지폭"
                  rules={[{ required: true }]}
                  rootClassName="flex-1"
                >
                  <Number min={0} max={9999} precision={0} unit="mm" />
                </Form.Item>
                {packaging.type !== "ROLL" && (
                  <Form.Item
                    name="sizeY"
                    label="지장"
                    rules={[{ required: true }]}
                    rootClassName="flex-1"
                  >
                    <Number min={0} max={9999} precision={0} unit="mm" />
                  </Form.Item>
                )}
              </div>
            </Form.Item>
          )}
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
          {packaging && (
            <Form.Item name="quantity" label="재고 수량">
              <FormControl.Quantity
                spec={{
                  grammage,
                  sizeX,
                  sizeY,
                  packaging,
                }}
              />
            </Form.Item>
          )}
          <Form.Item className="flex justify-end">
            <Button.Default
              label="예정 재고 수정"
              type="primary"
              onClick={async () => await cmdUpdateSpec()}
            />
          </Form.Item>
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

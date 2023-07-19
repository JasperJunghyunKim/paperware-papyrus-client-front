import { ApiHook, Util } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Number } from "@/components/formControl";
import { Form } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";

export type OpenType =
  | {
      stockId: number;
      planId: number;
    }
  | false;

export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const metadata = ApiHook.Static.PaperMetadata.useGetAll();

  const [form] = useForm();
  const packagingId = useWatch(["packagingId"], form);
  const grammage = useWatch(["grammage"], form);
  const sizeX = useWatch(["sizeX"], form);
  const sizeY = useWatch(["sizeY"], form);
  const quantity = useWatch(["quantity"], form);
  const useRemainder = useWatch(["useRemainder"], form);

  const packaging = metadata.data?.packagings.find((x) => x.id === packagingId);

  const stock = ApiHook.Working.Plan.useGetInputItem({
    key: props.open
      ? {
          planId: props.open.planId,
          stockId: props.open.stockId,
        }
      : null,
  });

  const api = ApiHook.Working.Plan.useUpdateInputStock();
  const cmd = useCallback(async () => {
    if (!props.open || !stock.data) {
      return;
    }

    await api.mutateAsync({
      id: props.open.planId,
      data: {
        useRemainder: useRemainder,
        stockId: stock.data.stockId,
        quantity: quantity,
      },
    });
    form.resetFields();
    props.onClose(false);
  }, [api, form, quantity, useRemainder, stock.data, props.onClose]);

  useEffect(() => {
    if (!stock.data) {
      return;
    }
    form.setFieldsValue({
      warehouseId: stock.data.stock.warehouse?.id,
      productId: stock.data.stock.product.id,
      packagingId: stock.data.stock.packaging.id,
      grammage: stock.data.stock.grammage,
      sizeX: stock.data.stock.sizeX ?? 0,
      sizeY: stock.data.stock.sizeY ?? 0,
      paperColorGroupId: stock.data.stock.paperColorGroup?.id,
      paperColorId: stock.data.stock.paperColor?.id,
      paperPatternId: stock.data.stock.paperPattern?.id,
      paperCertId: stock.data.stock.paperCert?.id,
      useRemainder: stock.data.useRemainder,
      quantity: stock.data.quantity,
    });
  }, [form, stock.data]);

  return (
    <Popup.Template.Property
      title="실투입 재고 수정"
      {...props}
      open={!!props.open}
    >
      <div className="flex-initial p-4 ">
        <Form
          form={form}
          onFinish={cmd}
          layout="vertical"
          rootClassName="pb-16"
        >
          <Form.Item name="warehouseId" label="창고">
            <FormControl.SelectWarehouse disabled />
          </Form.Item>
          <Form.Item
            name="packagingId"
            label="포장"
            rules={[{ required: true }]}
          >
            <FormControl.SelectPackaging disabled />
          </Form.Item>
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
                      disabled
                    />
                  </Form.Item>
                )}
                <Form.Item
                  name="sizeX"
                  label="지폭"
                  rules={[{ required: true }]}
                  rootClassName="flex-1"
                >
                  <Number min={0} max={9999} precision={0} unit="mm" disabled />
                </Form.Item>
                {packaging.type !== "ROLL" && (
                  <Form.Item
                    name="sizeY"
                    label="지장"
                    rules={[{ required: true }]}
                    rootClassName="flex-1"
                  >
                    <Number
                      min={0}
                      max={9999}
                      precision={0}
                      unit="mm"
                      disabled
                    />
                  </Form.Item>
                )}
              </div>
            </Form.Item>
          )}
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
          {packaging && (
            <>
              <Form.Item label={"실물 수량"}>
                <FormControl.Quantity
                  spec={{
                    grammage,
                    sizeX,
                    sizeY,
                    packaging,
                  }}
                  value={stock.data?.stock.cachedQuantity}
                  disabled
                />
              </Form.Item>
              <Form.Item name="quantity" label="투입 수량">
                <FormControl.Quantity
                  spec={{
                    grammage: grammage,
                    sizeX,
                    sizeY,
                    packaging,
                  }}
                  onlyPositive
                />
              </Form.Item>
            </>
          )}
          <Form.Item className="flex justify-end mt-4 ">
            <Button.Preset.Submit label="실투입 재고 수정" />
          </Form.Item>
        </Form>
      </div>
    </Popup.Template.Property>
  );
}
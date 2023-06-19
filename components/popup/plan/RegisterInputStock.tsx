import { Api } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Number } from "@/components/formControl";
import { Form, Input } from "antd";
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

  const packaging = metadata.data?.packagings.find((x) => x.id === packagingId);

  const api = ApiHook.Working.Plan.useRegisterInputStock();
  const cmd = useCallback(async () => {
    if (!props.open) {
      return;
    }

    await api.mutateAsync({
      id: props.open.planId,
      data: {
        stockId: props.open.stockId,
        quantity: quantity,
      },
    });
    form.resetFields();
    props.onClose(false);
  }, [api, form, props.onClose]);

  const stock = ApiHook.Stock.StockInhouse.useGetItem({
    id: props.open ? props.open.stockId : null,
  });

  useEffect(() => {
    if (!stock.data) {
      return;
    }
    form.setFieldsValue({
      productId: stock.data.product.id,
      packagingId: stock.data.packaging.id,
      grammage: stock.data.grammage,
      sizeX: stock.data.sizeX,
      sizeY: stock.data.sizeY ?? 0,
      paperColorGroupId: stock.data.paperColorGroup?.id,
      paperColorId: stock.data.paperColor?.id,
      paperPatternId: stock.data.paperPattern?.id,
      paperCertId: stock.data.paperCert?.id,
    });
  }, [form, stock.data]);

  return (
    <Popup.Template.Property
      title="실투입 재고 등록"
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
          )}
          <Form.Item className="flex justify-end mt-4 ">
            <Button.Preset.Submit label="실투입 재고 등록" />
          </Form.Item>
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

import { Model } from "@/@shared";
import { ApiHook, QuantityUtil, Util } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Number } from "@/components/formControl";
import { Alert, Checkbox, Form, Radio } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";

export type OpenType =
  | {
      serial: string;
      planId: number;
    }
  | false;

export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
  targetStock?: Model.Stock;
}

export default function Component(props: Props) {
  const metadata = ApiHook.Static.PaperMetadata.useGetAll();

  const [form] = useForm();
  const productId = useWatch(["productId"], form);
  const packagingId = useWatch(["packagingId"], form);
  const grammage = useWatch(["grammage"], form);
  const sizeX = useWatch(["sizeX"], form);
  const sizeY = useWatch(["sizeY"], form);
  const paperColorGroupId = useWatch(["paperColorGroupId"], form);
  const paperColorId = useWatch(["paperColorId"], form);
  const paperPatternId = useWatch(["paperPatternId"], form);
  const paperCertId = useWatch(["paperCertId"], form);
  const quantity = useWatch(["quantity"], form);
  const useRemainder = useWatch<boolean>(["useRemainder"], form);

  const packaging = metadata.data?.packagings.find((x) => x.id === packagingId);

  const stock = ApiHook.Stock.StockInhouse.useGetItemBySerial({
    serial: props.open ? props.open.serial : null,
  });

  const api = ApiHook.Working.Plan.useRegisterInputStock();
  const cmd = useCallback(async () => {
    if (!props.open || !stock.data) {
      return;
    }

    await api.mutateAsync({
      id: props.open.planId,
      data: {
        stockId: stock.data.id,
        quantity: quantity,
        useRemainder: useRemainder,
      },
    });
    form.resetFields();
    props.onClose(false);
  }, [api, form, stock.data, props.onClose, useRemainder]);

  useEffect(() => {
    if (!stock.data) {
      return;
    }
    form.setFieldsValue({
      warehouseId: stock.data.warehouse?.id,
      productId: stock.data.product.id,
      packagingId: stock.data.packaging.id,
      grammage: stock.data.grammage,
      sizeX: stock.data.sizeX ?? 0,
      sizeY: stock.data.sizeY ?? 0,
      paperColorGroupId: stock.data.paperColorGroup?.id,
      paperColorId: stock.data.paperColor?.id,
      paperPatternId: stock.data.paperPattern?.id,
      paperCertId: stock.data.paperCert?.id,
    });
  }, [form, stock.data]);

  const isDifferencesWithTargetStock = useCallback(() => {
    if (!props.targetStock) {
      return false;
    }
    return (
      props.targetStock.product.id != productId ||
      props.targetStock.packaging.id != packagingId ||
      props.targetStock.grammage != grammage ||
      props.targetStock.sizeX != (sizeX ?? 0) ||
      props.targetStock.sizeY != (sizeY ?? 0) ||
      props.targetStock.paperColorGroup?.id != paperColorGroupId ||
      props.targetStock.paperColor?.id != paperColorId ||
      props.targetStock.paperPattern?.id != paperPatternId ||
      props.targetStock.paperCert?.id != paperCertId
    );
  }, [
    props.targetStock,
    productId,
    packagingId,
    grammage,
    sizeX,
    sizeY,
    paperColorGroupId,
    paperColorId,
    paperPatternId,
    paperCertId,
  ]);

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
          {isDifferencesWithTargetStock() && (
            <Alert
              type="warning"
              showIcon
              message="지정된 원지와 다른 스펙의 재고입니다."
              rootClassName="mb-4"
            />
          )}
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
                  value={stock.data?.cachedQuantity}
                  disabled
                />
              </Form.Item>
              <div className="h-2" />
              <Form.Item
                name="useRemainder"
                label="실투입 수량"
                initialValue={false}
              >
                <Radio.Group
                  options={[
                    { label: "직접 입력", value: false },
                    { label: "전량 사용", value: true },
                  ]}
                  optionType="button"
                  buttonStyle="solid"
                />
              </Form.Item>
              {!useRemainder && (
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
            </>
          )}
          <Form.Item className="flex justify-end mt-4 ">
            <Button.Preset.Submit label="실투입 재고 등록" />
          </Form.Item>
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

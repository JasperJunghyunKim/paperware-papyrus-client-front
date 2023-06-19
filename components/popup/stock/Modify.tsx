import { Api } from "@/@shared";
import { ApiHook, QuantityUtil, Util } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Number } from "@/components/formControl";
import { Alert, Form } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import _ from "lodash";
import { useCallback, useEffect } from "react";

type OpenType = number | false;

export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
}

type FormValues = Api.StockQuantityChangeRequest;

export default function Component(props: Props) {
  const metadata = ApiHook.Static.PaperMetadata.useGetAll();

  const [form] = useForm<FormValues>();
  const quantity = useWatch<number>("quantity", form);

  const stock = ApiHook.Stock.StockInhouse.useGetItem({
    id: props.open ? props.open : null,
  });
  const stockQuantity = ApiHook.Stock.StockInhouse.useGetStockGroup({
    query: stock.data
      ? {
          productId: stock.data.product.id,
          grammage: stock.data.grammage,
          sizeX: stock.data.sizeX,
          sizeY: stock.data.sizeY,
          packagingId: stock.data.packaging.id,
          paperColorGroupId: stock.data.paperColorGroup?.id ?? null,
          paperColorId: stock.data.paperColor?.id ?? null,
          paperPatternId: stock.data.paperPattern?.id ?? null,
          paperCertId: stock.data.paperCert?.id ?? null,
          warehouseId: stock.data.warehouse?.id ?? null,
          planId: stock.data.planId,
        }
      : {},
  });
  const compactQuantity = stockQuantity?.data
    ? QuantityUtil.compact(stockQuantity.data, stockQuantity.data)
    : null;
  const spec = stock.data
    ? {
        grammage: stock.data.grammage,
        sizeX: stock.data.sizeX,
        sizeY: stock.data.sizeY,
        packaging: stock.data.packaging,
      }
    : null;

  const api = ApiHook.Stock.StockInhouse.useUpdateQuantity();
  const cmd = useCallback(
    async (values: FormValues) => {
      if (props.open === false) {
        return;
      }

      const data: FormValues = {
        ...values,
      };

      await api.mutateAsync({
        stockId: props.open,
        data,
      });
      form.resetFields();
      props.onClose(false);
    },
    [api, form, props]
  );

  useEffect(() => {
    console.log("stock", stock.data);
    if (props.open === false) {
      form.resetFields();
    } else if (stock.data) {
      form.setFieldsValue({
        warehouseId: stock.data.warehouse?.id ?? null,
        planId: stock.data.planId,
        productId: stock.data.product.id,
        packagingId: stock.data.packaging.id,
        grammage: stock.data.grammage,
        sizeX: stock.data.sizeX,
        sizeY: stock.data.sizeY,
        paperColorGroupId: stock.data.paperColorGroup?.id ?? null,
        paperColorId: stock.data.paperColor?.id ?? null,
        paperPatternId: stock.data.paperPattern?.id ?? null,
        paperCertId: stock.data.paperCert?.id ?? null,
      } as any);
    }
  }, [form, props.open, stock.data]);

  const nextAvailableQuantity =
    (compactQuantity?.availableQuantity ?? 0) + (quantity ?? 0);

  return (
    <Popup.Template.Property
      title="재고 수량 수정"
      {...props}
      open={!!props.open}
    >
      <div className="flex-1 p-4">
        <Form form={form} onFinish={cmd} layout="vertical">
          <Form.Item name="warehouseId" label="창고">
            <FormControl.SelectWarehouse disabled />
          </Form.Item>
          <Form.Item name="packagingId" label="포장">
            <FormControl.SelectPackaging disabled />
          </Form.Item>
          <Form.Item name="productId" label="제품">
            <FormControl.SelectProduct disabled />
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
          {stock.data?.packaging && (
            <Form.Item>
              <div className="flex justify-between gap-x-2">
                {stock.data.packaging.type !== "ROLL" && (
                  <Form.Item label="규격" rootClassName="flex-1">
                    <FormControl.Util.PaperSize
                      sizeX={stock.data.sizeX}
                      sizeY={stock.data.sizeY}
                      disabled
                    />
                  </Form.Item>
                )}
                <Form.Item name="sizeX" label="지폭" rootClassName="flex-1">
                  <Number min={0} max={9999} precision={0} unit="mm" disabled />
                </Form.Item>
                {stock.data.packaging.type !== "ROLL" && (
                  <Form.Item name="sizeY" label="지장" rootClassName="flex-1">
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
          {spec && (
            <>
              <Form.Item label="가용 수량">
                <FormControl.Quantity
                  spec={spec}
                  value={nextAvailableQuantity}
                  disabled
                />
              </Form.Item>
              <Form.Item
                name="quantity"
                label="수량 증감"
                rules={[{ required: true, message: "수량을 입력해주세요." }]}
              >
                <FormControl.Quantity spec={spec} />
              </Form.Item>
            </>
          )}
          {nextAvailableQuantity < 0 ? (
            <Alert type="error" message="가용수량 값이 0 이상이어야합니다." />
          ) : (
            <Form.Item className="flex justify-end">
              <Button.Preset.Submit
                label="수량 저장"
                disabled={api.isLoading}
              />
            </Form.Item>
          )}
          <div className="h-16" />
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

import { Api } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Number } from "@/components/formControl";
import { Form } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import _ from "lodash";
import { useCallback, useEffect } from "react";

export interface Props {
  open: boolean;
  onClose: (unit: boolean) => void;
}

export default function Component(props: Props) {
  const metadata = ApiHook.Static.PaperMetadata.useGetAll();

  const [form] = useForm<Api.StockCreateRequest>();
  const packagingId = useWatch(["packagingId"], form);
  const sizeX = useWatch<number>(["sizeX"], form);
  const sizeY = useWatch<number>(["sizeY"], form);
  const grammage = useWatch(["grammage"], form);

  const packaging = metadata.data?.packagings.find((x) => x.id === packagingId);

  const api = ApiHook.Stock.StockInhouse.useCreate();
  const cmd = useCallback(
    async (values: Api.StockCreateRequest) => {
      await api.mutateAsync({
        data: {
          ...values,
          stockPrice: {
            ...values.stockPrice,

            officialPrice: _.isFinite(values.stockPrice?.officialPrice)
              ? values.stockPrice?.officialPrice
              : 0,
            discountPrice: _.isFinite(values.stockPrice?.discountPrice)
              ? values.stockPrice?.discountPrice
              : 0,
            unitPrice: _.isFinite(values.stockPrice?.unitPrice)
              ? values.stockPrice?.unitPrice
              : 0,
          },
        },
      });
      form.resetFields();
      props.onClose(false);
    },
    [api, form, props]
  );

  useEffect(() => {
    if (!packaging) {
      return;
    }

    form.setFieldValue(
      "stockPrice",
      FormControl.Util.Price.initialStockPrice(packaging.type)
    );
  }, [packagingId, grammage, sizeX, sizeY]);

  return (
    <Popup.Template.Property title="재고 추가" {...props}>
      <div className="flex-1 p-4">
        <Form form={form} onFinish={cmd} layout="vertical">
          <Form.Item
            name="warehouseId"
            label="창고"
            rules={[{ required: true }]}
          >
            <FormControl.SelectWarehouse />
          </Form.Item>
          <Form.Item name="productId" label="제품" rules={[{ required: true }]}>
            <FormControl.SelectProduct />
          </Form.Item>
          <Form.Item
            name="packagingId"
            label="포장"
            rules={[{ required: true }]}
          >
            <FormControl.SelectPackaging />
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
            <Form.Item name="stockPrice" label="재고 금액">
              <FormControl.StockPrice
                spec={{
                  packaging,
                  grammage,
                  sizeX,
                  sizeY,
                }}
              />
            </Form.Item>
          )}
          {packaging && (
            <Form.Item name="quantity" label="재고 수량">
              <FormControl.Quantity packaging={packaging} />
            </Form.Item>
          )}
          <Form.Item className="flex justify-end">
            <Button.Preset.Submit label="재고 추가" />
          </Form.Item>
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

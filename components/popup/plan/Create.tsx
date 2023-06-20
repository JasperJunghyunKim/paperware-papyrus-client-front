import { Api, Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Form, Input } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { useCallback, useState } from "react";
import { DatePicker, Number } from "@/components/formControl";

export interface Props {
  open: boolean;
  onClose: (unit: boolean) => void;
}

type ValuesType = Api.InhouseProcessCreateRequest;
export default function Component(props: Props) {
  const metadata = ApiHook.Static.PaperMetadata.useGetAll();

  const [form] = useForm<ValuesType>();
  const packagingId = useWatch(["packagingId"], form);
  const grammage = useWatch(["grammage"], form);
  const sizeX = useWatch(["sizeX"], form);
  const sizeY = useWatch(["sizeY"], form);
  const packaging = metadata.data?.packagings.find((x) => x.id === packagingId);

  const [stockGroup, setStockGroup] = useState<Model.StockGroup | null>(null);

  const api = ApiHook.Working.Plan.useCreate();
  const cmd = useCallback(
    async (data: ValuesType) => {
      await api.mutateAsync({
        data,
      });
      form.resetFields();
      props.onClose(false);
    },
    [api, form, props]
  );

  return (
    <Popup.Template.Property title="내부 공정 등록" {...props}>
      <div className="flex-1 p-4">
        <Form form={form} onFinish={cmd} layout="vertical">
          <Button.Preset.SelectStockGroupInhouse
            onSelect={(stockGroup) => {
              setStockGroup(stockGroup);
              form.setFieldsValue({
                warehouseId: stockGroup.warehouse?.id ?? null,
                planId: stockGroup.plan?.id ?? null,
                productId: stockGroup.product.id,
                grammage: stockGroup.grammage,
                sizeX: stockGroup.sizeX,
                sizeY: stockGroup.sizeY,
                packagingId: stockGroup.packaging.id,
                paperColorId: stockGroup.paperColor?.id ?? null,
                paperColorGroupId: stockGroup.paperColorGroup?.id ?? null,
                paperPatternId: stockGroup.paperPattern?.id ?? null,
                paperCertId: stockGroup.paperCert?.id ?? null,
              });
            }}
            rootClassName="w-full mb-4"
          />
          {stockGroup && (
            <>
              <Form.Item name={"warehouseId"} hidden />
              <Form.Item name={"planId"} hidden />
              {stockGroup.warehouse && (
                <Form.Item label="창고">
                  <Input value={stockGroup.warehouse?.name} disabled />
                </Form.Item>
              )}
              {stockGroup.plan?.orderStock && (
                <>
                  <Form.Item label="주문 번호">
                    <Input
                      value={stockGroup.plan?.orderStock.order.orderNo}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item label="매입처">
                    <Input
                      value={
                        stockGroup.plan?.orderStock.order.partnerCompany
                          .businessName
                      }
                      disabled
                    />
                  </Form.Item>
                  <Form.Item label="도착지">
                    <Input
                      value={stockGroup.plan.orderStock.dstLocation.name}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item label="도착 예정일">
                    <DatePicker
                      value={stockGroup.plan.orderStock.wantedDate}
                      disabled
                    />
                  </Form.Item>
                </>
              )}
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
                    <Form.Item name="sizeX" label="지폭" rootClassName="flex-1">
                      <Number
                        min={0}
                        max={9999}
                        precision={0}
                        unit="mm"
                        disabled
                      />
                    </Form.Item>
                    {packaging.type !== "ROLL" && (
                      <Form.Item
                        name="sizeY"
                        label="지장"
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
            </>
          )}
          {stockGroup && (
            <Form.Item name="quantity" label="원지 수량">
              <FormControl.Quantity spec={stockGroup} />
            </Form.Item>
          )}

          <Form.Item name="memo" label="비고">
            <Input.TextArea />
          </Form.Item>
          <Form.Item className="flex justify-end">
            <Button.Preset.Submit label="내부 공정 등록" />
          </Form.Item>
        </Form>
        <div className="h-4" />
      </div>
    </Popup.Template.Property>
  );
}

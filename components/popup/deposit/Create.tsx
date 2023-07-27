import { Api } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Number } from "@/components/formControl";
import { Form, Input } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import _ from "lodash";
import { useCallback, useEffect } from "react";

export type OpenType = "PURCHASE" | "SALES" | false;

export interface Props {
  open: OpenType;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const me = ApiHook.Auth.useGetMe();
  const metadata = ApiHook.Static.PaperMetadata.useGetAll();

  const [form] = useForm<Api.DepositCreateRequest>();
  const productId = useWatch(["productId"], form);
  const packagingId = useWatch(["packagingId"], form);
  const sizeX = useWatch<number>(["sizeX"], form);
  const sizeY = useWatch<number>(["sizeY"], form);
  const grammage = useWatch(["grammage"], form);
  const paperColorGroupId = useWatch<number | null>(
    ["paperColorGroupId"],
    form
  );
  const paperColorId = useWatch<number | null>(["paperColorId"], form);
  const paperPatternId = useWatch<number | null>(["paperPatternId"], form);
  const paperCertId = useWatch<number | null>(["paperCertId"], form);

  const packaging = metadata.data?.packagings.find((x) => x.id === packagingId);

  const api = ApiHook.Trade.Deposit.useCreate();
  const cmd = useCallback(
    async (values: Api.DepositCreateRequest) => {
      if (!props.open) {
        return;
      }

      await api.mutateAsync({
        data: {
          ...values,
          srcCompanyRegistrationNumber:
            props.open === "PURCHASE"
              ? me.data?.company.companyRegistrationNumber
              : values.dstCompanyRegistrationNumber,
          dstCompanyRegistrationNumber:
            props.open === "SALES"
              ? me.data?.company.companyRegistrationNumber
              : values.srcCompanyRegistrationNumber,
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
    <Popup.Template.Property
      title={`${props.open === "PURCHASE" ? "매입" : "매출"} 보관량 등록`}
      {...props}
      open={!!props.open}
    >
      <div className="flex-1 p-4">
        <Form form={form} onFinish={cmd} layout="vertical">
          {props.open === "PURCHASE" && (
            <Form.Item name="srcCompanyRegistrationNumber" label="거래처">
              <FormControl.SelectCompanyPurchase />
            </Form.Item>
          )}
          {props.open === "SALES" && (
            <Form.Item name="dstCompanyRegistrationNumber" label="거래처">
              <FormControl.SelectCompanySales />
            </Form.Item>
          )}
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
            <Form.Item
              name="quantity"
              label="수량"
              rules={[{ required: true }]}
            >
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
          <Form.Item
            name="memo"
            label="증감 사유"
            rules={[{ required: true, message: "증감 사유을 입력해주세요." }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item className="flex justify-end">
            <Button.Preset.Submit
              label="보관량 등록"
              disabled={api.isLoading}
            />
          </Form.Item>
        </Form>
        <div className="h-8" />
      </div>
    </Popup.Template.Property>
  );
}

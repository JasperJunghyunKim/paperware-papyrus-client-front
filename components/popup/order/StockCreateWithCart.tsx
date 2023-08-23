import { OrderStockGroupCreateRequest } from "@/@shared/api";
import { ApiHook, Util } from "@/common";
import * as R from "@/common/rules";
import { Button, FormControl, Popup } from "@/components";
import { Form, Input, Select, Switch } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";

export type PopupStockCreateWithCartOpenType =
  | false
  | { targetCartIds: number[] };
interface PopupCreateProps {
  type: "SALES" | "PURCHASE";
  open: PopupStockCreateWithCartOpenType;
  onClose: (unit: false) => void;
}
export default function Component(props: PopupCreateProps) {
  const companies = ApiHook.Inhouse.BusinessRelationship.useGetCompactList({
    query: {},
  });
  const [form] = useForm<OrderStockGroupCreateRequest>();
  const srcCompanyId = useWatch<number | undefined>("srcCompanyId", form);
  const selectedSrcCompany = companies.data?.items.find(
    (x) => x.id === srcCompanyId
  );

  const apiCreate = ApiHook.Trade.OrderStock.useCreateWithCart();
  const cmdCreate = useCallback(async () => {
    if (!props.open) return;
    if (!(await Util.confirm("일괄등록을 계속 하시겠습니까?"))) return;
    const data = await form.validateFields();

    await apiCreate.mutateAsync({
      data: {
        cartIds: props.open.targetCartIds,
        srcCompanyId: data.srcCompanyId,
        orderDate: data.orderDate,
        wantedDate: data.wantedDate,
        locationId: data.locationId,
        memo: data.memo,
        isDirectShipping: data.isDirectShipping,
        orderStatus: data.orderStatus,
      },
    });
    props.onClose(false);
  }, [apiCreate, form, props]);

  useEffect(() => form.resetFields(), [form, props.open]);

  return (
    <Popup.Template.Property
      {...props}
      open={!!props.open}
      title={`${props.type === "SALES" ? "매출" : "매입"} 일괄 등록`}
      height="auto"
    >
      <Form
        layout="vertical"
        form={form}
        rootClassName="p-4 flex flex-col w-full"
      >
        {props.type === "SALES" && (
          <Form.Item label="매출처" name="srcCompanyId" rules={[R.required()]}>
            <FormControl.SelectCompanySales />
          </Form.Item>
        )}
        <Form.Item
          label={`${props.type === "SALES" ? "매출" : "매입"}일`}
          name="orderDate"
          rules={[R.required()]}
        >
          <FormControl.DatePicker />
        </Form.Item>
        {props.type === "SALES" && srcCompanyId && (
          <Form.Item label="도착지" name="locationId" rules={[R.required()]}>
            <FormControl.SelectLocationForSales companyId={srcCompanyId} />
          </Form.Item>
        )}
        {props.type === "PURCHASE" && (
          <Form.Item label="도착지" name="locationId" rules={[R.required()]}>
            <FormControl.SelectLocationForPurchase />
          </Form.Item>
        )}
        <Form.Item
          label={`${props.type === "SALES" ? "도착 예정" : "도착 희망"}일`}
          name="wantedDate"
          rules={[R.required()]}
        >
          <FormControl.DatePicker />
        </Form.Item>
        <Form.Item
          label="직송 여부"
          name="isDirectShipping"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>
        <Form.Item label="기타 요청사항" name="memo" initialValue={""}>
          <Input.TextArea rows={2} />
        </Form.Item>
        {props.type === "SALES" && selectedSrcCompany?.managedById === null && (
          <Form.Item
            label="등록 구분 선택"
            name="orderStatus"
            rules={[R.required()]}
          >
            <Select
              options={[
                { label: "구매 요청으로 등록", value: "OFFER_REQUESTED" },
                { label: "승인된 주문으로 등록", value: "ACCEPTED" },
              ]}
            />
          </Form.Item>
        )}
        <div className="flex-initial flex gap-x-2 mt-4">
          <Button.Default label="일괄등록" onClick={cmdCreate} type="primary" />
        </div>
      </Form>
    </Popup.Template.Property>
  );
}

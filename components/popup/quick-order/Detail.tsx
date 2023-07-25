import { OrderRequestCreateRequest } from "@/@shared/api";
import { ApiHook } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";
import { match } from "ts-pattern";

export interface Props {
  open: number | false;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<OrderRequestCreateRequest>();

  const partners = ApiHook.Inhouse.BusinessRelationship.useGetCompactList({
    query: {},
  });

  const item = ApiHook.OrderRequest.OrderRequest.useGetItem({
    id: props.open ? props.open : null,
  });

  const api = ApiHook.OrderRequest.OrderRequest.useDone();
  const cmd = useCallback(
    async (values: { id: number; dstMemo: string }) => {
      if (!props.open) return;

      await api.mutateAsync({ id: values.id, data: values });
    },
    [api, form, props]
  );

  useEffect(() => {
    if (!item.data) {
      form.resetFields();
      return;
    }

    form.setFieldsValue({
      locationId: item.data.location?.id,
      wantedDate: item.data.wantedDate,
      memo: item.data.memo,
      orderRequestItems: item.data.orderRequestItems.map((x) => ({
        id: x.id,
        item: x.item,
        quantity: x.quantity,
        memo: x.memo,
        status: x.status,
        statusText: match(x.status)
          .with("REQUESTED", () => "주문 접수")
          .with("DONE", () => "주문 종료")
          .with("CANCELLED", () => "주문 취소")
          .with("ON_CHECKING", () => "확인중(읽음)")
          .exhaustive(),
        dstMemo: x.dstMemo,
        serial: x.serial,
      })),
    });
  }, [form, item.data]);

  return (
    <Popup.Template.Full
      title="퀵 주문 상세"
      {...props}
      width="calc(100vw - 300px)"
      height="calc(100vh - 100px)"
      open={!!props.open}
    >
      <div className="w-full h-full flex flex-col">
        <Form layout="vertical" form={form} rootClassName="flex-1 flex h-0">
          <div className="flex-initial basis-[440px] p-4">
            <Form.Item label="거래처" rules={[{ required: true }]}>
              <Input
                value={
                  partners.data?.items.find(
                    (p) =>
                      p.companyRegistrationNumber ===
                      item.data?.srcCompany.companyRegistrationNumber
                  )?.businessName
                }
                disabled
              />
            </Form.Item>
            <Form.Item label="도착지">
              <Input value={item.data?.location?.name} disabled />
            </Form.Item>
            <Form.Item name="wantedDate" label="도착 희망일">
              <FormControl.DatePicker disabled />
            </Form.Item>
            <Form.Item name="memo" label="비고">
              <Input.TextArea disabled />
            </Form.Item>
          </div>
          <div className="flex-initial basis-px bg-gray-200" />
          <div className="flex-1 flex flex-col w-0 bg-slate-50 ">
            <div className="flex-1 overflow-y-scroll flex flex-col gap-y-4 p-4">
              <Form.List name="orderRequestItems">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restFields }, index) => (
                      <div
                        key={key}
                        className="flex-initial flex flex-col gap-y-2"
                      >
                        <div className="flex-initial flex gap-x-2">
                          <Form.Item
                            {...restFields}
                            name={[name, "item"]}
                            rules={[
                              {
                                required: true,
                                message: "상품명을 입력해주세요.",
                              },
                            ]}
                            noStyle
                          >
                            <Input
                              placeholder="상품명"
                              rootClassName="w-[300px]"
                              disabled
                              addonBefore="상품명"
                            />
                          </Form.Item>
                          <Form.Item
                            {...restFields}
                            name={[name, "quantity"]}
                            rules={[
                              {
                                required: true,
                                message: "수량을 입력해주세요.",
                              },
                            ]}
                            noStyle
                          >
                            <Input
                              placeholder="수량"
                              rootClassName="w-[300px]"
                              disabled
                              addonBefore="수량"
                            />
                          </Form.Item>
                          <Form.Item
                            {...restFields}
                            name={[name, "memo"]}
                            noStyle
                          >
                            <Input
                              placeholder="비고"
                              disabled
                              addonBefore="비고"
                            />
                          </Form.Item>
                        </div>
                        <div className="flex-initial flex gap-x-2">
                          <Form.Item
                            {...restFields}
                            name={[name, "dstMemo"]}
                            noStyle
                          >
                            <Input
                              placeholder="완료 메모"
                              disabled={
                                form.getFieldValue(["orderRequestItems"])[index]
                                  .status !== "REQUESTED"
                              }
                              addonBefore="완료 메모"
                            />
                          </Form.Item>
                          <Form.Item
                            {...restFields}
                            name={[name, "id"]}
                            hidden
                          />
                          {form.getFieldValue(["orderRequestItems"])[index]
                            .status === "REQUESTED" && (
                            <div
                              className="flex-initial whitespace-nowrap bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-1 rounded select-none cursor-pointer"
                              onClick={() =>
                                cmd(
                                  form.getFieldValue(["orderRequestItems"])[
                                    index
                                  ]
                                )
                              }
                            >
                              주문 완료
                            </div>
                          )}
                        </div>
                        <div className="flex-initial basis-px bg-gray-200 mt-2" />
                      </div>
                    ))}
                  </>
                )}
              </Form.List>
            </div>
          </div>
        </Form>
      </div>
    </Popup.Template.Full>
  );
}

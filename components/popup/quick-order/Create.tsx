import { OrderRequestCreateRequest } from "@/@shared/api";
import { ApiHook } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";

export interface Props {
  open: boolean;
  onClose: (unit: boolean) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<OrderRequestCreateRequest>();

  const api = ApiHook.OrderRequest.OrderRequest.useCreate();
  const cmd = useCallback(async () => {
    const values = await form.validateFields();

    await api.mutateAsync({ data: values });
    form.resetFields();
    props.onClose(false);
  }, [api, form, props]);

  useEffect(() => {
    if (!props.open) {
      return;
    }

    form.resetFields();
  }, [form, props.open]);

  return (
    <Popup.Template.Full
      title="퀵 주문 등록"
      {...props}
      width="calc(100vw - 300px)"
      height="calc(100vh - 100px)"
    >
      <div className="w-full h-full flex flex-col">
        <Form layout="vertical" form={form} rootClassName="flex-1 flex h-0">
          <div className="flex-initial basis-[440px] p-4">
            <Form.Item
              name="dstCompanyId"
              label="거래처"
              rules={[{ required: true }]}
            >
              <FormControl.SelectCompanyPurchase virtual={false} />
            </Form.Item>
            <Form.Item name="locationId" label="도착지">
              <FormControl.SelectLocationForPurchase />
            </Form.Item>
            <Form.Item name="wantedDate" label="도착 희망일">
              <FormControl.DatePicker />
            </Form.Item>
            <Form.Item name="memo" label="비고">
              <Input.TextArea />
            </Form.Item>
          </div>
          <div className="flex-initial basis-px bg-gray-200" />
          <div className="flex-1 flex flex-col w-0 bg-slate-50 ">
            <div className="flex-1 overflow-y-scroll flex flex-col gap-y-2 p-4">
              <Form.List name="orderRequestItems">
                {(fields, { add, remove }) => (
                  <>
                    <div
                      onClick={() =>
                        add({
                          item: "",
                          quantity: "",
                          memo: "",
                        })
                      }
                      className="flex-initial bg-cyan-600 hover:bg-cyan-500 text-center text-white p-2 rounded select-none cursor-pointer"
                    >
                      새 항목 추가
                    </div>
                    {fields.map(({ key, name, ...restFields }) => (
                      <div key={key} className="flex-initial flex gap-x-2">
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
                          <Input placeholder="수량" rootClassName="w-[300px]" />
                        </Form.Item>
                        <Form.Item
                          {...restFields}
                          name={[name, "memo"]}
                          noStyle
                        >
                          <Input placeholder="비고" />
                        </Form.Item>
                        <div
                          onClick={() => remove(name)}
                          className="flex-initial whitespace-nowrap bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded select-none cursor-pointer"
                        >
                          삭제
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </Form.List>
            </div>
          </div>
        </Form>
        <div className="flex-initial basis-px bg-gray-200" />
        <div className="flex-initial p-2 flex justify-center">
          <Button.Default type="primary" label="퀵 주문 등록" onClick={cmd} />
        </div>
      </div>
    </Popup.Template.Full>
  );
}

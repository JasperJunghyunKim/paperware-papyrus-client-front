import { Api } from "@/@shared";
import { AccountedType } from "@/@shared/models/enum";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input } from "antd";

interface Props {
  accountedType: AccountedType;
  form: FormInstance<Api.ByCashUpdateRequest | Api.ByEtcUpdateRequest>;
  onFinish: (values: Api.ByCashUpdateRequest | Api.ByEtcUpdateRequest) => void;
  edit: boolean;
  onEditChange: (edit: boolean) => void;
}

export default function Component(props: Props) {
  return (
    <Form
      form={props.form}
      onFinish={(values) => {
        props.onFinish(values);
      }}
      layout="vertical"
      disabled={!props.edit}
      rootClassName="flex flex-col gap-y-4"
    >
      <div className="flex flex-row justify-end gap-x-2">
        <Button.Preset.Edit
          label="내용 수정"
          onClick={() => props.onEditChange(true)}
          hidden={props.edit}
        />
        <Button.Default
          label="수정 취소"
          onClick={() => props.onEditChange(false)}
          hidden={!props.edit}
        />
        <Button.Preset.Submit label="내용 저장" hidden={!props.edit} />
      </div>

      <div className="h-px bg-gray-200" />

      <Form.Item name="partnerNickName" label="거래처">
        <Input disabled />
      </Form.Item>
      <Form.Item name="accountedDate" label={`${props.accountedType === 'PAID' ? '지급' : '수금'}일`} rules={[{ required: true }]}>
        <FormControl.DatePicker />
      </Form.Item>
      <Form.Item name="amount" label={`${props.accountedType === 'PAID' ? '지급' : '수금'} 금액`} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="accountedSubject" label="계정 과목" rules={[{ required: true }]}>
        <FormControl.SelectSubject accountedType={props.accountedType} />
      </Form.Item>
      <Form.Item name="accountedMethod" label={`${props.accountedType === 'PAID' ? '지급' : '수금'} 수단`} rules={[{ required: true }]}>
        <FormControl.SelectMethod isDisabled={true} />
      </Form.Item>
      <Form.Item name="memo" label="비고">
        <Input />
      </Form.Item>
    </Form>
  );
}

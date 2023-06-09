import { Api, Model } from "@/@shared";
import { Button, FormControl } from "@/components";
import { Form, FormInstance, Input, message } from "antd";

interface Props {
  form: FormInstance<Api.SecurityUpdateRequest | Api.SecurityUpdateStatusRequest>;
  onFinish: (values: Api.SecurityUpdateRequest | Api.SecurityUpdateStatusRequest) => void;
  edit: boolean;
  onEditChange: (edit: boolean) => void;
  statusEdit: boolean;
  onStatusEditChange: (edit: boolean) => void;
}

export default function Component(props: Props) {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Form form={props.form}
      onFinish={(values) => {
        props.onFinish(values);
      }}
      layout="vertical"
      rootClassName="flex flex-col gap-y-4">
      {contextHolder}
      <div className="flex flex-row justify-end gap-x-2">
        {
          props.form.getFieldValue("drawedStatus") === 'SELF' && (
            <Button.Preset.Edit
              label="기본정보 수정"
              onClick={() => {
                const condition: Model.Enum.SecurityStatus = props.form.getFieldValue("securityStatus");

                if (condition !== 'NONE') {
                  return messageApi.open({
                    type: 'error',
                    content: '유가증권의 상태가 기본이 아닙니다. 기본으로 변경후 사용하세요'
                  })
                } else {
                  props.onEditChange(true);
                }
              }}
              hidden={props.edit || props.statusEdit}
            />
          )
        }
        <Button.Preset.Edit
          label="상태정보 수정"
          onClick={() => props.onStatusEditChange(true)}
          hidden={props.edit || props.statusEdit}
        />
        <Button.Default
          label="수정 취소"
          onClick={() => {
            props.onEditChange(false)
            props.onStatusEditChange(false)
          }}
          hidden={!props.edit && !props.statusEdit}
        />
        <Button.Preset.Submit label="내용 저장" hidden={!props.edit && !props.statusEdit} />
      </div>

      <div className="h-px bg-gray-200" />
      <Form.Item
        name="securityType"
        label={"유가증권 유형"}
        rules={[{ required: true }]}
      >
        <FormControl.SelectSecurityType disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="securitySerial"
        label={"유가증권 번호"}
        rules={[{ required: true }]}
      >
        <Input disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="securityAmount"
        label="유가증권 금액"
        rules={[{ required: true }]}
      >
        <FormControl.Number disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="drawedDate"
        label={"발행일"}
      >
        <FormControl.DatePicker disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="drawedBank"
        label={"발행은행"}
      >
        <FormControl.SelectBank disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="drawedBankBranch"
        label={"발행 지점명"}
      >
        <Input disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="drawedRegion"
        label={"발행지"}
      >
        <Input disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="drawer"
        label={"발행인"}
      >
        <Input disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="maturedDate"
        label={"만기일"}
      >
        <FormControl.DatePicker disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="payingBank"
        label={"지급은행"}
      >
        <FormControl.SelectBank disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="payingBankBranch"
        label={"지급 지점명"}
      >
        <Input disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="payer"
        label={"지급인"}
      >
        <Input disabled={!props.edit} />
      </Form.Item>
      <Form.Item
        name="securityStatus"
        label={"유가증권 상태 목록"}
      >
        <FormControl.SelectSecurityStatus disabled={!props.statusEdit} />
      </Form.Item>
      <Form.Item
        name="memo"
        label={"메모"}
      >
        <Input disabled={!props.statusEdit && !props.edit} />
      </Form.Item>
    </Form>
  );
}

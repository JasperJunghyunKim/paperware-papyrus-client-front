import { Model } from "@/@shared";
import { FormControl } from "@/components";
import { Form, message } from "antd";
import { useRecoilState } from "recoil";
import { accountedAtom } from "./accounted.state";
import { AccountedType } from "@/@shared/models/enum";
import { isValidDateRange } from "@/@shared/helper/util";

type NamePath = 'partnerId' | 'accountedFromDate' | 'accountedToDate' | 'accountedSubject' | 'accountedMethod';

interface Props {
  accountedType: AccountedType;
}

export default function Component(props: Props) {
  const [condtiuon, setCondtiuon] = useRecoilState(accountedAtom);
  const [messageApi, contextHolder] = message.useMessage();

  const onChange = (name: NamePath, value: string | number | undefined) => {
    switch (name) {
      case 'partnerId':
        setCondtiuon((prev) => ({
          ...prev,
          partnerId: value as number
        }));
        break;
      case 'accountedFromDate':
        if (!isValidDateRange(new Date(value ?? ''), new Date(condtiuon.accountedToDate ?? ''))) {
          messageApi.open({
            type: 'error',
            content: '앞에 날짜가 뒤에 날짜보다 작습니다.'
          })
          setCondtiuon((prev) => ({
            ...prev,
            accountedFromDate: ''
          }));
        } else {
          setCondtiuon((prev) => ({
            ...prev,
            accountedFromDate: value === undefined ? '' : value as string
          }));
        }

        break;
      case 'accountedToDate':
        setCondtiuon((prev) => ({
          ...prev,
          accountedToDate: value === undefined ? '' : value as string
        }));
        break;
      case 'accountedSubject':
        setCondtiuon((prev) => ({
          ...prev,
          accountedSubject: value as Model.Enum.Subject
        }));
        break;
      case 'accountedMethod':
        setCondtiuon((prev) => ({
          ...prev,
          accountedMethod: value as Model.Enum.Method
        }));
        break;
    }
  }

  return (
    <div
      className={
        "p-6 rounded-lg basis-3/5 flex-grow-0 flex flex-row justify-center border border-solid border-gray-200 select-none bg-white shadow-sm"
      }
    >
      {contextHolder}
      <Form
        layout={"vertical"}
        className={"flex flex-row gap-4 w-full"}
        initialValues={{
          ...condtiuon
        }}>
        <Form.Item name="partnerId" label="거래처" className={"w-1/5"} getValueFromEvent={(value) => onChange('partnerId', value)}>
          <FormControl.SelectPartner isAll={true} />
        </Form.Item>
        <Form.Item name="accountedFromDate" label={`${props.accountedType === 'PAID' ? '지급' : '수금'}일`} className={"w-1/5"}>
          <FormControl.DatePicker datePickerValue={condtiuon.accountedFromDate} onChange={(value) => onChange('accountedFromDate', value)} />
        </Form.Item>
        <div className={"mt-8"}>
          ~
        </div>
        <Form.Item name="accountedToDate" label=" " className={"w-1/5 mt-30"}>
          <FormControl.DatePicker datePickerValue={condtiuon.accountedToDate} onChange={(value) => onChange('accountedToDate', value)} />
        </Form.Item>
        <Form.Item name="accountedSubject" label="계정 과목" className={"w-1/5"} getValueFromEvent={(value) => onChange('accountedSubject', value)}>
          <FormControl.SelectSubject isAll={true} accountedType={props.accountedType} />
        </Form.Item>
        <Form.Item name="accountedMethod" label={`${props.accountedType === 'PAID' ? '지급' : '수금'} 수단`} className={"w-1/5"} getValueFromEvent={(value) => onChange('accountedMethod', value)}>
          <FormControl.SelectMethod isAll={true} />
        </Form.Item>
      </Form>
    </div>
  );
}

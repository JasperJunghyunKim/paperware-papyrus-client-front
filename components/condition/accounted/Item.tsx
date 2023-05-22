import { Model } from "@/@shared";
import { FormControl } from "@/components";
import { Form, message } from "antd";
import { useRecoilState } from "recoil";
import { accountedAtom } from "./accounted.state";
import { AccountedType } from "@/@shared/models/enum";
import { isValidDateRange } from "@/@shared/helper/util";

type NamePath = 'companyRegistrationNumber' | 'accountedFromDate' | 'accountedToDate' | 'accountedSubject' | 'accountedMethod';

interface Props {
  accountedType: AccountedType;
}

export default function Component(props: Props) {
  const [condtiuon, setCondtiuon] = useRecoilState(accountedAtom);
  const [messageApi, contextHolder] = message.useMessage();

  const onChange = (name: NamePath, value: string | number | undefined) => {
    switch (name) {
      case 'companyRegistrationNumber':
        setCondtiuon((prev) => ({
          ...prev,
          companyId: parseInt((value as string)?.split('/')[0]),
          companyRegistrationNumber: (value as string)?.split('/')[1],
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
        <Form.Item name="companyRegistrationNumber" label="거래처" className={"w-1/5"}>
          <FormControl.SelectPartner isAll={true} value={condtiuon.companyRegistrationNumber} onChange={(value) => onChange('companyRegistrationNumber', value)} />
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
        <Form.Item name="accountedSubject" label="계정 과목" className={"w-1/5"}>
          <FormControl.SelectSubject isAll={true} accountedType={props.accountedType} onChange={(value) => onChange('accountedSubject', value)} />
        </Form.Item>
        <Form.Item name="accountedMethod" label={`${props.accountedType === 'PAID' ? '지급' : '수금'} 수단`} className={"w-1/5"}>
          <FormControl.SelectMethod accountedType={props.accountedType} isAll={true} onChange={(value) => onChange('accountedMethod', value)} />
        </Form.Item>
      </Form>
    </div>
  );
}

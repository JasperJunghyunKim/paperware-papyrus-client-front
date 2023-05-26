import { Model } from "@/@shared";
import { isValidDateRange } from "@/@shared/helper/util";
import { AccountedType } from "@/@shared/models/enum";
import { ApiHook } from "@/common";
import { FormControl } from "@/components";
import { Form, message } from "antd";
import { useRecoilState } from "recoil";
import { accountedAtom } from "./accounted.state";

type NamePath = 'partnerNickName' | 'accountedFromDate' | 'accountedToDate' | 'accountedSubject' | 'accountedMethod';

interface Props {
  accountedType: AccountedType;
}

export default function Component(props: Props) {
  const [condtiuon, setCondtiuon] = useRecoilState(accountedAtom);
  const [messageApi, contextHolder] = message.useMessage();
  const partnerList = ApiHook.Partner.Partner.useGetList()

  const onChange = (name: NamePath, value: string | number | undefined) => {
    switch (name) {
      case 'partnerNickName':
        if (value !== 0) {
          const result = partnerList.data?.filter((el) => el.partnerNickName === value)[0];
          setCondtiuon((prev) => ({
            ...prev,
            partnerNickName: result?.partnerNickName ?? '',
            companyId: result?.companyId ?? 0,
            companyRegistrationNumber: result?.companyRegistrationNumber ?? '',
          }));
        } else {
          setCondtiuon((prev) => ({
            ...prev,
            partnerId: 0,
            companyId: 0,
            companyRegistrationNumber: "",
          }));
        }
        break;
      case "accountedFromDate":
        if (
          !isValidDateRange(
            new Date(value ?? ""),
            new Date(condtiuon.accountedToDate ?? "")
          )
        ) {
          messageApi.open({
            type: "error",
            content: "앞에 날짜가 뒤에 날짜보다 작습니다.",
          });
          setCondtiuon((prev) => ({
            ...prev,
            accountedFromDate: "",
          }));
        } else {
          setCondtiuon((prev) => ({
            ...prev,
            accountedFromDate: value === undefined ? "" : (value as string),
          }));
        }

        break;
      case "accountedToDate":
        setCondtiuon((prev) => ({
          ...prev,
          accountedToDate: value === undefined ? "" : (value as string),
        }));
        break;
      case "accountedSubject":
        setCondtiuon((prev) => ({
          ...prev,
          accountedSubject: value as Model.Enum.Subject,
        }));
        break;
      case "accountedMethod":
        setCondtiuon((prev) => ({
          ...prev,
          accountedMethod: value as Model.Enum.Method,
        }));
        break;
    }
  };

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
        <Form.Item name="partnerNickName" label="거래처" className={"w-1/5"}>
          <FormControl.SelectPartner isAll={true} value={condtiuon.partnerNickName} onChange={(value) => onChange('partnerNickName', value)} />
        </Form.Item>
        <Form.Item
          name="accountedFromDate"
          label={`${props.accountedType === "PAID" ? "지급" : "수금"}일`}
          className={"w-1/5"}
        >
          <FormControl.DatePicker
            value={condtiuon.accountedFromDate}
            onChange={(value) => onChange("accountedFromDate", value)}
          />
        </Form.Item>
        <div className={"mt-8"}>~</div>
        <Form.Item name="accountedToDate" label=" " className={"w-1/5 mt-30"}>
          <FormControl.DatePicker
            value={condtiuon.accountedToDate}
            onChange={(value) => onChange("accountedToDate", value)}
          />
        </Form.Item>
        <Form.Item
          name="accountedSubject"
          label="계정 과목"
          className={"w-1/5"}
        >
          <FormControl.SelectSubject
            isAll={true}
            accountedType={props.accountedType}
            onChange={(value) => onChange("accountedSubject", value)}
          />
        </Form.Item>
        <Form.Item
          name="accountedMethod"
          label={`${props.accountedType === "PAID" ? "지급" : "수금"} 수단`}
          className={"w-1/5"}
        >
          <FormControl.SelectMethod
            accountedType={props.accountedType}
            isAll={true}
            onChange={(value) => onChange("accountedMethod", value)}
          />
        </Form.Item>
      </Form>
    </div>
  );
}

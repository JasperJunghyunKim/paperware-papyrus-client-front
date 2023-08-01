import { AuthNoCheckRequest } from "@/@shared/api/auth/auth.request";
import {
  AccountPasswordUpdateRequest,
  AccountPhoneNoUpdateRequest,
  AccountUpdateRequest,
} from "@/@shared/api/setting/account.request";
import { ApiHook, Util } from "@/common";
import * as R from "@/common/rules";
import { Button, FormControl } from "@/components";
import { Page } from "@/components/layout";
import { Form, Input } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { useEffect, useState } from "react";

export default function Component() {
  const account = ApiHook.Setting.Account.useGet();
  const [smsSended, setSmsSended] = useState(true);

  const [formPassword] = useForm<AccountPasswordUpdateRequest>();
  const password = useWatch("password", formPassword);
  const [formAccount] = useForm<AccountUpdateRequest>();
  const [formPhoneNo] = useForm<
    AccountPhoneNoUpdateRequest & AuthNoCheckRequest
  >();

  useEffect(() => {
    if (!account.data) return;

    formPassword.resetFields();
    formAccount.setFieldsValue({
      name: account.data.name,
      birthDate: account.data.birthDate ?? undefined,
      email: account.data.email ?? undefined,
    });
    formPhoneNo.setFieldsValue({
      phoneNo: account.data.phoneNo ?? undefined,
      authNo: undefined,
      authKey: undefined,
    });
  }, [account.data]);

  const apiUpdatePassword = ApiHook.Setting.Account.useUpdatePassword();
  const cmdUpdatePassword = async () => {
    const values = await formPassword.validateFields();
    await apiUpdatePassword.mutateAsync(values);
  };

  const apiUpdateAccount = ApiHook.Setting.Account.useUpdate();
  const cmdUpdateAccount = async () => {
    const values = await formAccount.validateFields();
    await apiUpdateAccount.mutateAsync(values);
  };

  const apiSendSmsVerifyCode = ApiHook.Auth.useSendSmsVerifyCode();
  const cmdSendSmsVerifyCode = async () => {
    const values = await formPhoneNo.validateFields();
    values.phoneNo = values.phoneNo.replace(/-/g, "");
    await apiSendSmsVerifyCode.mutateAsync(values);
    setSmsSended(true);
    await Util.sleep(2);
  };

  const apiValidateVerifyCode = ApiHook.Auth.useValidateVerifyCode();
  const apiUpdatePhoneNo = ApiHook.Setting.Account.useUpdatePhoneNo();
  const cmdValidateVerifyCode = async () => {
    const values = await formPhoneNo.validateFields();
    values.phoneNo = values.phoneNo.replace(/-/g, "");
    const data = await apiValidateVerifyCode.mutateAsync(values);
    await apiUpdatePhoneNo.mutateAsync({
      phoneNo: values.phoneNo,
      authKey: data.authKey,
    });
    setSmsSended(false);
  };

  const isPasswordEmpty = !password || password.length === 0;

  return (
    <Page title="계정 설정">
      <Form layout="vertical" rootClassName="w-[500px]" form={formPassword}>
        <Form.Item label={"아이디"}>
          <Input disabled value={account.data?.username} />
        </Form.Item>
        <Form.Item label={"비밀번호 변경"} name={"password"}>
          <Input.Password placeholder="비밀번호를 입력하세요." />
        </Form.Item>
        {!isPasswordEmpty && (
          <>
            <Form.Item
              label={"비밀번호 확인"}
              name={"_passwordConfirm"}
              hasFeedback
              dependencies={["password"]}
              rules={[R.confirm("password"), R.length(4, 20)]}
            >
              <Input.Password placeholder="비밀번호를 다시 입력하세요." />
            </Form.Item>
            <div className="flex-initial flex py-2">
              <Button.Default
                label="비밀번호 변경"
                onClick={cmdUpdatePassword}
              />
            </div>
          </>
        )}
      </Form>
      <Split />
      <Form layout="vertical" rootClassName="w-[500px]" form={formAccount}>
        <Form.Item label={"이름"} name={"name"} rules={[R.length(1, 20)]}>
          <Input placeholder="이름을 입력하세요." rootClassName="w-48" />
        </Form.Item>
        <Form.Item label={"생년월일"} name={"birthDate"}>
          <FormControl.DatePicker rootClassName="w-48" />
        </Form.Item>
        <Form.Item label={"이메일"} name={"email"} rules={[R.email()]}>
          <Input placeholder="이메일을 입력하세요." />
        </Form.Item>
        <div className="flex-initial flex py-2">
          <Button.Default label="사용자 정보 저장" onClick={cmdUpdateAccount} />
        </div>
      </Form>
      <Split />
      <Form layout="vertical" rootClassName="w-[500px]" form={formPhoneNo}>
        <Form.Item
          label={"휴대폰 번호 변경"}
          name={"phoneNo"}
          rules={[R.phone]}
        >
          <Input placeholder="휴대폰 번호를 입력하세요." disabled={smsSended} />
        </Form.Item>
        {smsSended && (
          <Form.Item
            label={"인증번호"}
            name={"authNo"}
            rules={[R.lengthExact(6)]}
            hidden={!smsSended}
          >
            <Input placeholder="인증번호 6자리를 입력하세요." />
          </Form.Item>
        )}
        <div className="flex-initial flex py-2 gap-x-2">
          <Button.Default
            label={smsSended ? "인증번호 재발송" : "인증번호 발송"}
            onClick={cmdSendSmsVerifyCode}
          />
          <div className="flex-1" />
          {smsSended && (
            <>
              <Button.Default
                label="인증번호 확인"
                onClick={cmdValidateVerifyCode}
              />
              <Button.Default
                label="취소"
                onClick={() => setSmsSended(false)}
              />
            </>
          )}
        </div>
      </Form>
      <div className="h-32" />
    </Page>
  );
}

function Split() {
  return <div className="w-full h-px bg-gray-200 my-2" />;
}

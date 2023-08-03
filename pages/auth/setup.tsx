import {
  AuthNoCheckRequest,
  FindPasswordChangeRequest,
} from "@/@shared/api/auth/auth.request";
import { FindPasswordResponse } from "@/@shared/api/auth/auth.response";
import { AccountPhoneNoUpdateRequest } from "@/@shared/api/setting/account.request";
import { ApiHook, Util } from "@/common";
import * as R from "@/common/rules";
import { Button, FormControl } from "@/components";
import { Form, Input } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import axios from "axios";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Component() {
  const router = useRouter();
  const accessToken = router.query.accessToken ?? null;

  console.log(accessToken);

  const [form] = useForm();
  const [formPhoneNo] = useForm<
    AccountPhoneNoUpdateRequest & AuthNoCheckRequest
  >();
  const [smsSended, setSmsSended] = useState(false);

  const password = useWatch("password", form);

  const apiSendSmsVerifyCode = ApiHook.Auth.useSendSmsVerifyCode();
  const cmdSendSmsVerifyCode = async () => {
    const values = await formPhoneNo.validateFields();
    values.phoneNo = values.phoneNo.replace(/-/g, "");
    await apiSendSmsVerifyCode.mutateAsync(values);
    setSmsSended(true);
    await Util.sleep(2);
  };

  const apiMe = ApiHook.Auth.useGetMe();
  const apiSetup = ApiHook.Auth.useSetup();
  const apiValidateVerifyCode = ApiHook.Auth.useValidateVerifyCode();
  const cmdValidateVerifyCode = async () => {
    const phoneValues = await formPhoneNo.validateFields();
    phoneValues.phoneNo = phoneValues.phoneNo.replace(/-/g, "");
    const values = await form.validateFields();

    const data = await apiValidateVerifyCode.mutateAsync(phoneValues);

    await apiSetup.mutateAsync({
      accessToken: accessToken as string,
      payload: {
        password: values.password,
        phoneNo: phoneValues.phoneNo,
        authKey: data.authKey,
      },
    });

    localStorage.setItem("at", accessToken as string);
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

    await apiMe.refetch();

    await router.replace("/");
  };

  const isPasswordEmpty = !password || password.length === 0;

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-[400px] flex flex-col justify-center">
        <div className="text-2xl font-bold mb-4">계정 초기 설정</div>
        <div className="flex-initial text-sm text-blue-500 mb-4">
          {`아래 필수 정보를 입력한 다음 작업을 계속하십시오.`}
        </div>
        <Form form={form} layout="vertical">
          <Form.Item
            label={"비밀번호"}
            name={"password"}
            rules={[R.required(), R.password()]}
            hasFeedback={!isPasswordEmpty}
          >
            <Input.Password placeholder="비밀번호를 입력하세요." />
          </Form.Item>
          {!isPasswordEmpty && (
            <>
              <Form.Item
                label={"비밀번호 확인"}
                name={"_passwordConfirm"}
                hasFeedback
                dependencies={["password"]}
                rules={[R.confirm("password")]}
              >
                <Input.Password placeholder="비밀번호를 다시 입력하세요." />
              </Form.Item>
            </>
          )}
        </Form>
        <Form form={formPhoneNo} layout="vertical">
          <Form.Item
            label="휴대폰 번호"
            name="phoneNo"
            rules={[R.required(), R.length(10, 11)]}
          >
            <Input placeholder="숫자만 입력" disabled={smsSended} />
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
                  label="다시 입력"
                  onClick={() => setSmsSended(false)}
                />
                <Button.Default
                  type="primary"
                  label="인증번호 확인"
                  onClick={cmdValidateVerifyCode}
                />
              </>
            )}
          </div>
        </Form>
      </div>
    </div>
  );
}

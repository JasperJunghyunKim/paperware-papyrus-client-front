import { Button, FormControl } from "@/components";
import { Form, Input, Table } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { useRouter } from "next/router";
import * as R from "@/common/rules";
import { ApiHook, Util } from "@/common";
import { AccountPhoneNoUpdateRequest } from "@/@shared/api/setting/account.request";
import {
  AuthNoCheckRequest,
  FindPasswordChangeRequest,
  FindPasswordRequest,
} from "@/@shared/api/auth/auth.request";
import { useState } from "react";
import {
  FindIdResponse,
  FindPasswordResponse,
} from "@/@shared/api/auth/auth.response";

export default function Component() {
  const router = useRouter();
  const [form] = useForm<
    AccountPhoneNoUpdateRequest &
      AuthNoCheckRequest &
      FindPasswordRequest &
      FindPasswordChangeRequest
  >();
  const [smsSended, setSmsSended] = useState(false);
  const [pwResponse, setPwResponse] = useState<FindPasswordResponse | null>();

  const apiFindPw = ApiHook.Auth.useFindPw();

  const apiSendSmsVerifyCode = ApiHook.Auth.useSendSmsVerifyCode();
  const cmdSendSmsVerifyCode = async () => {
    const values = await form.validateFields();
    values.phoneNo = values.phoneNo.replace(/-/g, "");
    await apiSendSmsVerifyCode.mutateAsync(values);
    setSmsSended(true);
    await Util.sleep(2);
  };

  const apiValidateVerifyCode = ApiHook.Auth.useValidateVerifyCode();
  const cmdValidateVerifyCode = async () => {
    const values = await form.validateFields();
    values.phoneNo = values.phoneNo.replace(/-/g, "");

    const data = await apiValidateVerifyCode.mutateAsync(values);

    const resp = await apiFindPw.mutateAsync({
      username: values.username,
      name: values.name,
      birthDate: values.birthDate,
      phoneNo: values.phoneNo,
      authKey: data.authKey,
    });

    setPwResponse(resp);
  };

  const apiResetPassword = ApiHook.Auth.useResetPw();
  const cmdUpdatePassword = async () => {
    if (!pwResponse) return;

    const values = await form.validateFields();
    await apiResetPassword.mutateAsync({
      userId: pwResponse.userId,
      authKey: pwResponse.authKey,
      password: values.password,
    });

    await router.push("/login");
  };

  const password = useWatch("password", form);
  const isPasswordEmpty = !password || password.length === 0;

  const a = useWatch([], form);

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-[400px] flex flex-col justify-center">
        <div className="text-2xl font-bold mb-4">비밀번호 찾기</div>
        {pwResponse ? (
          <>
            <div className="flex-initial text-sm text-blue-500 mb-4">
              {`비밀번호를 다시 설정해주세요.`}
            </div>
            <Form
              form={form}
              layout="vertical"
              id="formPassword"
              onValuesChange={(_, v) => form.setFieldsValue(v)}
            >
              <Form.Item
                key={"password"}
                label={"비밀번호 변경"}
                name={"password"}
                rules={[R.required(), R.password()]}
                hasFeedback={!isPasswordEmpty}
              >
                <Input.Password placeholder="비밀번호를 입력하세요." />
              </Form.Item>
              {!isPasswordEmpty && (
                <>
                  <Form.Item
                    key={"_passwordConfirm"}
                    label={"비밀번호 확인"}
                    name={"_passwordConfirm"}
                    hasFeedback
                    dependencies={["password"]}
                    rules={[R.confirm("password")]}
                  >
                    <Input.Password placeholder="비밀번호를 다시 입력하세요." />
                  </Form.Item>
                  <div className="flex-initial flex py-2">
                    <Button.Default
                      label="돌아가기"
                      onClick={async () => await router.push("/login")}
                    />
                    <div className="flex-1" />
                    <Button.Default
                      label="비밀번호 변경"
                      onClick={cmdUpdatePassword}
                    />
                  </div>
                </>
              )}
            </Form>
          </>
        ) : (
          <>
            <Form form={form} layout="vertical" id="form">
              <Form.Item
                key={"username"}
                label="아이디"
                name="username"
                rules={[R.required()]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                key={"name"}
                label="이름"
                name="name"
                rules={[R.required()]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                key={"birthDate"}
                label="생년월일 8자리"
                name="birthDate"
                rules={[R.required()]}
              >
                <FormControl.DatePicker />
              </Form.Item>
            </Form>
            <Form form={form} layout="vertical" id="formPhoneNo">
              <Form.Item
                key={"phoneNo"}
                label="휴대폰 번호"
                name="phoneNo"
                rules={[R.required(), R.length(10, 11)]}
              >
                <Input placeholder="숫자만 입력" disabled={smsSended} />
              </Form.Item>
              {smsSended && (
                <Form.Item
                  key={"authNo"}
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
                <Button.Default
                  label="취소"
                  onClick={async () => await router.push("/login")}
                />
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
          </>
        )}
      </div>
    </div>
  );
}

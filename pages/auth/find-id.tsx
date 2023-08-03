import { Button, FormControl } from "@/components";
import { Form, Input, Table } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useRouter } from "next/router";
import * as R from "@/common/rules";
import { ApiHook, Util } from "@/common";
import { AccountPhoneNoUpdateRequest } from "@/@shared/api/setting/account.request";
import {
  AuthNoCheckRequest,
  FindIdRequest,
} from "@/@shared/api/auth/auth.request";
import { useState } from "react";
import { FindIdResponse } from "@/@shared/api/auth/auth.response";

export default function Component() {
  const router = useRouter();
  const [form] = useForm<
    AccountPhoneNoUpdateRequest & AuthNoCheckRequest & FindIdRequest
  >();
  const [smsSended, setSmsSended] = useState(false);
  const [idResponse, setIdResponse] = useState<FindIdResponse | null>(null);

  const apiFindId = ApiHook.Auth.useFindId();

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

    const resp = await apiFindId.mutateAsync({
      name: values.name,
      birthDate: values.birthDate,
      phoneNo: values.phoneNo,
      authKey: data.authKey,
    });

    setIdResponse(resp);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="w-[400px] flex flex-col justify-center">
        <div className="text-2xl font-bold mb-4">아이디 찾기</div>
        {idResponse ? (
          <>
            <div className="flex-initial text-sm text-blue-500">
              {`${idResponse.items.length}개의 아이디가 조회되었습니다.`}
            </div>
            <Table
              columns={[
                {
                  title: "회사명",
                  dataIndex: "companyName",
                  key: "companyName",
                },
                {
                  title: "아이디",
                  dataIndex: "username",
                  key: "username",
                },
                {
                  title: "가입일",
                  key: "createdAt",
                  render: (record) =>
                    Util.formatIso8601ToLocalDate(record.createdAt),
                },
              ]}
              dataSource={idResponse.items}
              pagination={false}
              rootClassName="my-4"
              size="small"
              bordered
            />
            <div className="flex-initial flex gap-x-2 justify-center">
              <Button.Default
                label="돌아가기"
                onClick={async () => await router.push("/login")}
              />
            </div>
          </>
        ) : (
          <>
            <Form form={form} layout="vertical">
              <Form.Item label="이름" name="name" rules={[R.required()]}>
                <Input />
              </Form.Item>
              <Form.Item
                label="생년월일 8자리"
                name="birthDate"
                rules={[R.required()]}
              >
                <FormControl.DatePicker />
              </Form.Item>
            </Form>
            <Form form={form} layout="vertical">
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

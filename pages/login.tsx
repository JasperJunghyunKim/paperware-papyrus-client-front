import { ApiHook } from "@/common";
import { FormBody } from "@/common/protocol";
import { Button, Logo } from "@/components";
import { Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import axios from "axios";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

export default function Home() {
  const router = useRouter();

  const [isProgressing, setIsProgressing] = useState(false);
  const [form] = useForm<FormBody.SignIn>();

  const apiMe = ApiHook.Auth.useGetMe();

  const apiSignIn = ApiHook.Auth.useSignIn();
  const cmdSignIn = useCallback(async () => {
    if (isProgressing) return;
    try {
      setIsProgressing(true);
      const values = await form.validateFields();
      const resp = await apiSignIn.mutateAsync(values);

      if (resp.isFirstLogin) {
        await router.replace("/auth/setup?accessToken=" + resp.accessToken);
      } else {
        localStorage.setItem("at", resp.accessToken);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${resp.accessToken}`;

        await apiMe.refetch();

        await router.replace("/");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProgressing(false);
    }
  }, [apiSignIn, form, router]);

  return (
    <div
      className="w-screen h-screen"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          cmdSignIn();
        }
      }}
    >
      <div className="relative w-full h-full bg-gray-800/[.6] backdrop-blur-md">
        <div className="w-full h-full flex justify-center">
          <div className="flex flex-col justify-center container-outer">
            <div className="bg-white container-inner rounded-2xl shadow-2xl flex flex-col">
              <div className="flex justify-center py-8">
                <Logo.Paperware classNames="w-auto h-12" />
              </div>
              <div className="basis-px bg-gray-200" />
              <Form
                form={form}
                className="p-8"
                layout="vertical"
                autoComplete="off"
              >
                <Form.Item
                  name="username"
                  label="아이디"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="password"
                  label="패스워드"
                  rules={[{ required: true }]}
                >
                  <Input.Password />
                </Form.Item>
                <div className="flex gap-x-2 my-4">
                  <Button.Default
                    label="로그인"
                    onClick={cmdSignIn}
                    submit
                    rootClassName="flex-1 h-10 text-lg"
                    type="primary"
                  />
                </div>
                <div className="h-px bg-gray-200 my-8" />
                <div className="flex gap-x-2 justify-center">
                  <Button.Default
                    label="아이디 찾기"
                    onClick={() => router.push("/auth/find-id")}
                  />
                  <Button.Default
                    label="비밀번호 찾기"
                    onClick={() => router.push("/auth/find-password")}
                  />
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

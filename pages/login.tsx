import { ApiHook } from "@/common";
import { FormBody } from "@/common/protocol";
import { Button, Logo } from "@/components";
import { Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import axios from "axios";
import { useRouter } from "next/router";
import { useCallback } from "react";

export default function Home() {
  const router = useRouter();

  const [form] = useForm<FormBody.SignIn>();

  const apiSignIn = ApiHook.Auth.useSignIn();
  const cmdSignIn = useCallback(async () => {
    const values = form.getFieldsValue();
    const resp = await apiSignIn.mutateAsync(values);

    localStorage.setItem("at", resp);
    axios.defaults.headers.common["Authorization"] = `Bearer ${resp}`;

    await router.replace("/");
  }, [apiSignIn, form, router]);

  return (
    <div className="component w-screen h-screen bg-no-repeat bg-center bg-cover">
      <div className="relative w-full h-full bg-gray-800/[.6] backdrop-blur-md">
        <div className="w-full h-full flex justify-center">
          <div className="flex flex-col justify-center container-outer">
            <div className="bg-white container-inner rounded-2xl shadow-2xl flex flex-col">
              <div className="flex-initial">
                <Logo.Paperware />
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
                <div className="flex justify-end">
                  <Button.Default
                    label="로그인"
                    onClick={async () => await cmdSignIn()}
                    submit
                  />
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .component {
          background-image: url("https://images.unsplash.com/photo-1595547131329-3bc81af45c47?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80");
        }
        .container-outer {
          flex: 0 0 400px;
        }
        .container-inner {
          flex: 0 0 500px;
        }
      `}</style>
    </div>
  );
}

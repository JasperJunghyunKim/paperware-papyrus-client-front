import { Api } from "@/@shared";
import { FormControl } from "@/components";
import { Form, FormInstance, Input } from "antd";

interface Props {
  form: FormInstance<Api.LocationCreateRequest>;
  onFinish: (values: Api.LocationCreateRequest) => void;
}

export default function Component(props: Props) {
  return (
    <Form form={props.form} onFinish={props.onFinish} layout="vertical"></Form>
  );
}

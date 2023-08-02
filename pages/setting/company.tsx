import { ApiHook, Const } from "@/common";
import { Page } from "@/components/layout";
import { Alert, Form, Input } from "antd";
import * as R from "@/common/rules";
import { Button, FormControl } from "@/components";
import { useEffect } from "react";
import { SettingCompanyUpdateRequest } from "@/@shared/api/setting/company.request";

export default function Component() {
  const company = ApiHook.Setting.Company.useGet();

  const [formCompany] = Form.useForm<SettingCompanyUpdateRequest>();

  useEffect(() => {
    if (!company.data) return;

    formCompany.setFieldsValue({
      businessName: company.data.businessName,
      representative: company.data.representative,
      phoneNo: company.data.phoneNo,
      faxNo: company.data.faxNo,
      address: company.data.address,
      bizType: company.data.bizType,
      bizItem: company.data.bizItem,
    });
  }, [company.data]);

  const apiUpdateCompany = ApiHook.Setting.Company.useUpdate();
  const cmdUpdateCompany = async () => {
    const values = await formCompany.validateFields();
    await apiUpdateCompany.mutateAsync(values);
  };

  return (
    <Page title="회사 정보 설정" menu={Const.Menu.SETTING_COMPANY}>
      <Alert
        message="등록된 회사 정보는 플랫폼 내 거래처로 등록된 회사에게 공개됩니다."
        type="info"
        showIcon
        rootClassName="w-[500px] mb-2"
      />
      <Form layout="vertical" rootClassName="w-[500px]" form={formCompany}>
        <Form.Item
          label="회사명 (사업자등록증 기준)"
          name={"businessName"}
          rules={[R.length(1, 50)]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="사업자등록번호">
          <Input disabled value={company.data?.companyRegistrationNumber} />
        </Form.Item>
        <Form.Item label="회사 코드">
          <Input disabled value={company.data?.invoiceCode} />
        </Form.Item>
        <Form.Item
          label="대표자"
          name="representative"
          rules={[R.length(1, 20)]}
        >
          <Input rootClassName="w-48" />
        </Form.Item>
        <Form.Item label="전화" name="phoneNo" rules={[R.phone()]}>
          <Input />
        </Form.Item>
        <Form.Item label="팩스" name="faxNo" rules={[R.phone()]}>
          <Input />
        </Form.Item>
        <Form.Item label="주소" name="address">
          <FormControl.Address />
        </Form.Item>
        <Form.Item label="업태" name="bizType" rules={[R.length(1, 20)]}>
          <Input />
        </Form.Item>
        <Form.Item label="업종" name="bizItem" rules={[R.length(1, 20)]}>
          <Input />
        </Form.Item>
        <Form.Item label="등록일시">
          <FormControl.DatePicker
            disabled
            value={company.data?.createdAt}
            rootClassName="w-48"
          />
        </Form.Item>
        <div className="flex-initial flex py-2 gap-x-2">
          <Button.Default label="회사 정보 저장" onClick={cmdUpdateCompany} />
        </div>
      </Form>
      <div className="h-32" />
    </Page>
  );
}

function Split() {
  return <div className="w-full h-px bg-gray-200 my-2" />;
}

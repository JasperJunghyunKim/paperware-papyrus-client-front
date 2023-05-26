import { Api, Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Button, FormControl, Popup } from "@/components";
import { Alert, Form, Input, Radio } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { useCallback, useEffect, useState } from "react";

export interface Props {
  open: boolean;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [form] = useForm();
  const companyRegistrationNumber = useWatch("companyRegistrationNumber", form);
  const [formCreate] = useForm<Api.RegisterPartnerRequest>();
  const isVirtual = useWatch("isVirtual", form);

  const [searched, setSearched] = useState<Model.CompanyPartner | null>(null);

  const apiSendRequest =
    ApiHook.Inhouse.BusinessRelationship.useRegisterPartner();
  const cmdSendRequest = useCallback(
    async (values: Api.RegisterPartnerRequest) => {
      await apiSendRequest.mutateAsync({
        data: {
          ...values,
          create: isVirtual,
          companyRegistrationNumber,
        },
      });
      props.onClose(false);
    },
    [apiSendRequest, props, isVirtual]
  );

  const me = ApiHook.Auth.useGetMe();

  const apiSearch = ApiHook.Inhouse.BusinessRelationship.useSearchPartnerItem();
  const cmdSearch = useCallback(
    async (values: Api.SearchPartnerRequest) => {
      if (
        values.companyRegistrationNumber ===
        me.data?.company.companyRegistrationNumber
      ) {
        Util.warn("자사를 거래처로 등록할 수 없습니다.");
        return;
      }

      const resp = await apiSearch.mutateAsync({ data: values });

      if (resp.partner) {
        Util.warn(
          `'${resp.partner.partnerNickName} (사업자등록번호: ${resp.partner.companyRegistrationNumber})'는 이미 등록된 거래처입니다.`
        );
        setSearched(null);
        return;
      }
      setSearched(resp);
      form.setFieldValue("isVirtual", resp.company ? false : true);
    },
    [apiSearch, me]
  );

  useEffect(() => {
    if (!isVirtual && searched?.company) {
      formCreate.setFieldsValue({
        phoneNo: searched.company.phoneNo,
        faxNo: searched.company.faxNo,
        email: searched.company.email,
        invoiceCode: searched.company.invoiceCode,
        address: searched.company.address,
      });
    }
  }, [searched, isVirtual]);

  useEffect(() => {
    if (!props.open) {
      setSearched(null);
      form.resetFields();
      formCreate.resetFields();
    }
  }, [props.open]);

  return (
    <Popup.Template.Property title="거래처 등록" {...props} open={!!props.open}>
      <div className="flex-1 p-4 flex flex-col gap-4">
        <Form
          form={form}
          layout="vertical"
          onFinish={cmdSearch}
          autoComplete="off"
        >
          <Form.Item
            name="companyRegistrationNumber"
            label="사업자등록번호"
            rules={[
              { required: true, message: "사업자등록번호를 입력해주세요." },
            ]}
          >
            <Input disabled={!!searched} minLength={10} maxLength={10} />
          </Form.Item>
          {searched ? (
            <>
              <Form.Item name="isVirtual" label="연결 거래처 여부">
                <Radio.Group
                  optionType="button"
                  options={[
                    { label: "연결 거래처", value: false },
                    { label: "비연결 거래처", value: true },
                  ].filter((x) => searched.company || x.value)}
                  buttonStyle="solid"
                />
              </Form.Item>
              <Alert
                message={
                  isVirtual
                    ? "자사 내부적으로 관리되는 거래처입니다. 비연결 거래처에 등록된 거래는 공급기업과 수요기업 간 정보가 공유되지 않습니다."
                    : "PAPERWARE를 사용중인 기업은 연결 상태로 등록할 수 있습니다. 연결 거래처로 등록한 거래는 공급기업과 수요기업 간 정보가 실시간 공유됩니다."
                }
                type={isVirtual ? "warning" : "info"}
                rootClassName="my-2"
              />
              <div className="flex justify-end">
                <Button.Preset.Edit
                  label="다시 입력"
                  onClick={() => setSearched(null)}
                />
              </div>
            </>
          ) : (
            <div className="flex justify-end">
              <Button.Preset.Submit label="사업자등록번호 조회" />
            </div>
          )}
        </Form>
        {searched && (
          <Form form={formCreate} layout="vertical" onFinish={cmdSendRequest}>
            {searched?.company && (
              <Form.Item label="거래처명 (사업자등록증기준)">
                <Input value={searched.company.businessName} disabled />
              </Form.Item>
            )}
            <Form.Item
              name="partnerNickname"
              label="거래처명"
              rules={[{ required: true, message: "거래처명을 입력해주세요." }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="type"
              label="거래 관계"
              rules={[{ required: true, message: "거래 관계를 선택해주세요." }]}
            >
              <Radio.Group
                optionType="button"
                options={[
                  { label: "매입", value: "PURCHASE" },
                  { label: "매출", value: "SALES" },
                  { label: "매입&매출", value: "BOTH" },
                ]}
                buttonStyle="solid"
              />
            </Form.Item>
            {!isVirtual && (
              <Form.Item
                name="invoiceCode"
                label="송장코드"
                rules={[
                  { required: true, message: "송장코드를 입력해주세요." },
                ]}
              >
                <Input disabled={!!searched?.company && !isVirtual} />
              </Form.Item>
            )}
            <Form.Item name="address" label="주소">
              <FormControl.Address
                disabled={!!searched?.company && !isVirtual}
              />
            </Form.Item>
            <Form.Item name="phoneNo" label="전화번호">
              <Input disabled={!!searched?.company && !isVirtual} />
            </Form.Item>
            <Form.Item name="faxNo" label="팩스">
              <Input disabled={!!searched?.company && !isVirtual} />
            </Form.Item>
            <Form.Item name="email" label="이메일">
              <Input disabled={!!searched?.company && !isVirtual} />
            </Form.Item>
            <Form.Item name="memo" label="비고">
              <Input.TextArea />
            </Form.Item>
            <div className="flex justify-end">
              <Button.Preset.Submit
                label={isVirtual ? "거래처 등록" : "거래처 등록 요청"}
              />
            </div>
            <div className="h-16" />
          </Form>
        )}
      </div>
    </Popup.Template.Property>
  );
}

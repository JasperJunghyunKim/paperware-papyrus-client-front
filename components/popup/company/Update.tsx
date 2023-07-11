import { Api } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Button, FormControl, Popup, Table } from "@/components";
import { Alert, Form, Input, InputNumber, Radio } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import { useCallback, useEffect, useState } from "react";
import Collapsible from "react-collapsible";

type CompanyId = number;
export type CompanyUpdateOpenType = CompanyId | false;

export interface Props {
  open: CompanyUpdateOpenType;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const partners = ApiHook.Partner.Partner.useGetList();

  const [form] = useForm();
  const type = useWatch("type", form);
  const [lastType, setLastType] = useState<
    "NONE" | "SALES" | "PURCHASE" | "BOTH" | null
  >(null);

  const item = ApiHook.Inhouse.BusinessRelationship.useGetCompactItem({
    targetCompanyId: props.open ? props.open : null,
  });

  const isVirtual = !!item.data?.managedById;

  const apiSendRequest = ApiHook.Inhouse.BusinessRelationship.useRequest();
  const cmdSendRequest = useCallback(
    async (values: Api.BusinessRelationshipRequestRequest) => {
      if (!item.data) return;

      await apiSendRequest.mutateAsync({
        data: {
          targetCompanyId: item.data.id,
          type: values.type,
        },
      });
    },
    [apiSendRequest, item.data]
  );

  const apiUpsertPartner =
    ApiHook.Inhouse.BusinessRelationship.useUpsertPartner();
  const cmdUpsertPartner = useCallback(
    async (values: Api.UpsertPartnerRequest) => {
      await apiUpsertPartner.mutateAsync({
        companyRegistrationNumber: values.companyRegistrationNumber,
        data: {
          companyRegistrationNumber: values.companyRegistrationNumber,
          creditLimit: values.creditLimit,
          partnerNickname: values.partnerNickname,
          memo: values.memo,
        },
      });
    },
    [apiUpsertPartner]
  );

  const apiUpdateCompany = ApiHook.Inhouse.VirtualCompany.useUpdate();
  const cmdUpdateCompany = useCallback(
    async (values: any) => {
      if (!item.data) return;

      await apiUpdateCompany.mutateAsync({
        id: item.data.id,
        data: {
          businessName: values.businessName,
          address: values.address,
          companyRegistrationNumber: values.companyRegistrationNumber,
          faxNo: values.faxNo,
          invoiceCode: "",
          bizType: values.bizType,
          bizItem: values.bizItem,
          phoneNo: values.phoneNo,
          representative: values.representative,
        },
      });
    },
    [apiUpdateCompany]
  );

  useEffect(() => {
    if (!item.data) return;

    const partner = partners.data?.find(
      (x) =>
        x.companyRegistrationNumber === item.data?.companyRegistrationNumber
    );

    const type =
      item.data.flag === 0
        ? "NONE"
        : item.data.flag === 1
        ? "SALES"
        : item.data.flag === 2
        ? "PURCHASE"
        : "BOTH";

    form.setFieldsValue({
      targetCompanyId: item.data.id,
      companyRegistrationNumber: item.data.companyRegistrationNumber,
      businessName: item.data.businessName,
      invoiceCode: item.data.invoiceCode,
      partnerNickname: partner?.partnerNickName ?? item.data.businessName,
      creditLimit: partner?.creditLimit,
      memo: partner?.memo,
      address: item.data.address,
      phoneNo: item.data.phoneNo,
      faxNo: item.data.faxNo,
      representative: item.data.representative,
      bizType: item.data.bizType,
      bizItem: item.data.bizItem,
      type: type,
    });
    setLastType(type);
  }, [item.data, form]);

  const confirmRequired =
    !isVirtual && lastType !== "BOTH" && type !== "NONE" && lastType !== type;
  const connectedWarning =
    !isVirtual && (lastType === "BOTH" || type === "NONE") && lastType !== type;

  return (
    <Popup.Template.Property
      title="거래처 상세 정보"
      {...props}
      open={!!props.open}
    >
      <div className="flex-1 p-4 flex flex-col gap-4 w-0">
        <FormControl.Util.Split label="거래처 정보" />
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          rootClassName="flex flex-col"
        >
          <Form.Item
            name="companyRegistrationNumber"
            label="사업자등록번호"
            rules={[
              { required: true, message: "사업자등록번호를 입력해주세요." },
              {
                pattern: /^[0-9]{10}$/,
                message: "사업자등록번호는 10자리의 숫자여야 합니다.",
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="partnerNickname"
            label="거래처명(별칭)"
            rules={[
              { required: true, message: "거래처명(별칭)을 입력해주세요." },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="creditLimit"
            label="여신 한도"
            rules={[{ required: true, message: "여신 한도를 입력해주세요." }]}
          >
            <InputNumber
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value?.replace(/(,*)/g, "") ?? ""}
              rootClassName="w-full"
            />
          </Form.Item>
          <Form.Item name="memo" label="비고">
            <Input.TextArea />
          </Form.Item>
          <div className="flex justify-end">
            <Button.Preset.Edit
              label={"거래처 정보 수정"}
              onClick={async () =>
                await cmdUpsertPartner(await form.validateFields())
              }
            />
          </div>
          <FormControl.Util.Split label="회사 정보" />
          <Form.Item
            name="businessName"
            label="거래처명(사업자등록증기준)"
            rules={[
              {
                required: true,
                message: "거래처명(사업자등록증기준)을 입력해주세요.",
              },
            ]}
          >
            <Input disabled={!item.data?.managedById} />
          </Form.Item>
          {!isVirtual && (
            <Form.Item
              name="invoiceCode"
              label="회사 코드"
              rules={[{ required: true, message: "회사 코드를 입력해주세요." }]}
            >
              <Input disabled />
            </Form.Item>
          )}
          <Form.Item
            name="representative"
            label="대표자"
            rules={[
              {
                required: true,
                message: "대표자를 입력해주세요.",
              },
            ]}
          >
            <Input disabled={!isVirtual} />
          </Form.Item>
          <Form.Item
            name="address"
            label="주소"
            rules={[{ required: true, message: "주소를 입력해주세요." }]}
          >
            <FormControl.Address disabled={!isVirtual} />
          </Form.Item>
          <Form.Item
            name="phoneNo"
            label="전화번호"
            rules={[
              { required: true, message: "전화번호를 입력해주세요." },
              {
                pattern: /^[0-9]{8,11}$/,
                message: "전화번호는 8~11자리의 숫자여야 합니다.",
              },
            ]}
          >
            <Input disabled={!isVirtual} maxLength={14} />
          </Form.Item>
          <Form.Item
            name="faxNo"
            label="팩스"
            rules={[
              {
                pattern: /^[0-9]{8,11}$/,
                message: "팩스는 8~11자리의 숫자여야 합니다.",
              },
            ]}
          >
            <Input disabled={!isVirtual} maxLength={14} />
          </Form.Item>
          <Form.Item
            name="bizType"
            label="업태"
            rules={[
              {
                required: true,
                message: "업태를 입력해주세요.",
              },
            ]}
          >
            <Input disabled={!isVirtual} />
          </Form.Item>
          <Form.Item
            name="bizItem"
            label="업종"
            rules={[
              {
                required: true,
                message: "업종을 입력해주세요.",
              },
            ]}
          >
            <Input disabled={!isVirtual} />
          </Form.Item>
          {isVirtual && (
            <div className="flex justify-end">
              <Button.Preset.Edit
                label={"회사 정보 수정"}
                onClick={async () =>
                  await cmdUpdateCompany(await form.validateFields())
                }
              />
            </div>
          )}
          <FormControl.Util.Split label="세금계산서담당자" />
          <Table.Simple
            columns={[
              {
                title: "이름",
                render: (record: any) => (
                  <div className="flex gap-x-1 items-center">
                    <div className="flex-initial">{record.name}</div>
                    {record.isDefault && (
                      <div className="flex-initial text-xs bg-gray-800 text-white rounded px-1 py-0.5">
                        대표
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: "전화번호",
                render: (record: any) => Util.formatPhoneNo(record.phoneNo),
              },
              {
                title: "이메일",
                render: (record: any) => record.email,
              },
              {
                render: (record: any) => (
                  <div className="flex gap-x-1">
                    <button
                      className="flex-initial bg-blue-500 text-white hover:bg-blue-600 rounded"
                      onClick={() => {}}
                    >
                      수정
                    </button>
                    <button
                      className="flex-initial bg-red-500 text-white hover:bg-red-600 rounded"
                      onClick={() => {}}
                    >
                      삭제
                    </button>
                  </div>
                ),
              },
            ]}
            keySelector={(item: any) => item.id}
            data={[
              {
                name: "김상훈",
                phoneNo: "010-1234-5678",
                email: "a@b.c",
                isDefault: false,
              },
              {
                name: "박덕자",
                phoneNo: "010-1234-5678",
                email: "strawberry@pineapple.watermelon",
                isDefault: true,
              },
            ]}
          />
          <Collapsible
            transitionTime={50}
            trigger={
              <button className="mt-2 py-2 rounded-sm bg-gray-100 border border-solid border-gray-200 w-full">
                세금계산서담당자 추가
              </button>
            }
          >
            <div className="mt-2 flex flex-col bg-gray-100 p-2 rounded-sm border border-solid border-gray-200">
              <div className="flex-initial text-cyan-600 font-bold mb-2">
                세금계산서담당자 추가
              </div>
              <Form.Item label="이름" required>
                <Input placeholder="이름" />
              </Form.Item>
              <Form.Item label="전화번호" required>
                <Input placeholder="전화번호" />
              </Form.Item>
              <Form.Item label="이메일" required>
                <Input placeholder="이메일" />
              </Form.Item>
              <div className="flex justify-end">
                <Button.Preset.Edit
                  label={"세금계산서담당자 추가"}
                  onClick={() => {}}
                />
              </div>
            </div>
          </Collapsible>
          <FormControl.Util.Split label="거래 관계" />
          <Form.Item name="type" label="거래 관계">
            <Radio.Group
              optionType="button"
              options={[
                { label: "거래 중지", value: "NONE" },
                { label: "매입", value: "PURCHASE" },
                { label: "매출", value: "SALES" },
                { label: "매입&매출", value: "BOTH" },
              ]}
              buttonStyle="solid"
            />
          </Form.Item>
          {confirmRequired && (
            <Alert
              message="연결 거래처와의 거래 관계를 상향 조정하기 위해 상대 거래처로 거래 관계 수정 요청을 보냅니다."
              type="info"
              showIcon
            />
          )}
          {connectedWarning && (
            <Alert
              message="승인 절차 없이 연결 거래처와의 거래 관계 범위를 축소합니다. 나중에 거래 관계를 다시 상향 조정하려면 상대 거래처의 승인을 받아야합니다."
              type="warning"
              showIcon
            />
          )}
          {lastType !== type && (
            <div className="flex justify-end mt-2">
              <Button.Preset.Edit
                label={
                  confirmRequired ? "거래 관계 수정 요청" : "거래 관계 저장"
                }
                onClick={async () =>
                  await cmdSendRequest(await form.validateFields())
                }
              />
            </div>
          )}
          <div className="h-16" />
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

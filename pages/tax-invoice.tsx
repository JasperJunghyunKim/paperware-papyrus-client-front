import { Api, Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, FormControl, Popup, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { Alert, Form, Input } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import classNames from "classnames";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { TbCash } from "react-icons/tb";

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Tax.TaxInvoice.useGetList({ query: page });
  const [selected, setSelected] = useState<Model.TaxInvoice[]>([]);

  const only = Util.only(selected);

  return (
    <Page title="전자세금계산서 목록">
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="전자세금계산서 추가"
          onClick={() => setOpenCreate(true)}
        />
        <div className="flex-1" />
      </Toolbar.Container>
      <Table.Default
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          { title: "국세청 승인번호" },
          { title: "상태" },
          {
            title: "작성일자",
            render: (record) => Util.formatIso8601ToLocalDate(record.writeDate),
          },
          { title: "발급일자" },
          { title: "전송일자" },
          {
            title: "공급받는자 등록번호",
            render: (record) => (
              <div className="font-fixed">
                {Util.formatCompanyRegistrationNo(
                  record.companyRegistrationNumber
                )}
              </div>
            ),
          },
          ...Table.Preset.useColumnPartner<any>(["companyRegistrationNumber"], {
            title: "상호",
          }),
          { title: "대표자명" },
          { title: "품목명" },
          { title: "합계금액" },
          { title: "공급가액" },
          { title: "세액" },
          { title: "영수/청구" },
          { title: "비고" },
          { title: "공급받는자 이메일1" },
          { title: "공급받는자 이메일2" },
        ]}
      />
      <PopupCreate
        open={openCreate}
        onClose={setOpenCreate}
        onCreated={setOpenUpdate}
      />
      <PopupUpdate open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}

type PopupCreateOpenType = boolean;
interface PopupCreateProps {
  open: PopupCreateOpenType;
  onClose: (value: false) => void;
  onCreated: (value: number) => void;
}
function PopupCreate(props: PopupCreateProps) {
  const me = ApiHook.Auth.useGetMe();
  const companies = ApiHook.Inhouse.BusinessRelationship.useGetList({
    query: {
      srcCompanyId: me.data?.companyId,
    },
  });

  const [form] = useForm<Api.CreateTaxInvoiceRequest>();
  const companyId = useWatch("companyId", form);

  const selectedCompany = companies.data?.items.find(
    (p) => p.dstCompany.id === companyId
  );

  const apiCreate = ApiHook.Tax.TaxInvoice.useCreate();
  const cmdCreate = useCallback(async () => {
    if (!selectedCompany) return;

    const values = await form.validateFields();
    const result = await apiCreate.mutateAsync({
      data: {
        ...values,
        companyRegistrationNumber:
          selectedCompany.dstCompany.companyRegistrationNumber,
      },
    });
    props.onCreated(result.id);
  }, [apiCreate, form, selectedCompany]);

  return (
    <Popup.Template.Property
      title={`전자세금계산서 추가`}
      open={props.open !== false}
      onClose={() => props.onClose(false)}
      width="600px"
      height="600px"
    >
      <div className="flex flex-col w-full h-full justify-center gap-y-4">
        <div className="flex justify-center gap-x-2">
          <IssueButton icon={<TbCash />} label="정발행" active />
          <IssueButton
            icon={<TbCash />}
            label="역발행"
            active={false}
            disabled
          />
        </div>
        <div className="flex justify-center">
          <Alert
            message="정발행이 뭔지는 저도 잘 모르겠습니다."
            className="w-[400px]"
          />
        </div>
        <div className="flex justify-center">
          <Form form={form} layout="vertical" className="w-[400px]">
            <Form.Item
              name={["writeDate"]}
              label="작성일자"
              initialValue={Util.dateToIso8601(dayjs())}
              rules={[{ required: true, message: "작성일자를 입력해주세요" }]}
              rootClassName="w-full"
            >
              <FormControl.DatePicker placeholder="작성일자를 입력해주세요" />
            </Form.Item>
            <Form.Item
              name={["companyId"]}
              label="공급받는자"
              rules={[{ required: true, message: "공급받는자를 입력해주세요" }]}
              rootClassName="w-full"
            >
              <FormControl.SelectCompanySales placeholder="공급받는자를 입력해주세요" />
            </Form.Item>
            {selectedCompany && (
              <Form.Item
                label="사업자등록번호 (공급받는자)"
                rootClassName="w-full"
              >
                <Input
                  value={selectedCompany.dstCompany.companyRegistrationNumber}
                  disabled
                />
              </Form.Item>
            )}
          </Form>
        </div>
        <div className="flex justify-center">
          <Button.Default label="다음" type="primary" onClick={cmdCreate} />
        </div>
      </div>
    </Popup.Template.Property>
  );
}

interface IssueButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  disabled?: boolean;
}
function IssueButton(props: IssueButtonProps) {
  return (
    <button
      disabled={props.disabled}
      className={classNames(
        "flex-[0_0_80px] h-[90px] text-gray-400 rounded flex flex-col justify-center items-center",
        {
          "bg-blue-600 text-white": props.active,
          "cursor-not-allowed": props.disabled,
        }
      )}
    >
      <div className="text-4xl">{props.icon}</div>
      <div className="font-bold">{props.label}</div>
    </button>
  );
}

type PopupUpdateOpenType = number | false;
interface PopupUpdateProps {
  open: PopupUpdateOpenType;
  onClose: (value: false) => void;
}
function PopupUpdate(props: PopupUpdateProps) {
  return (
    <Popup.Template.Property
      title={`전자세금계산서 작성`}
      open={props.open !== false}
      onClose={() => props.onClose(false)}
      width="1200px"
      height="calc(100vh - 100px)"
    >
      TODO
    </Popup.Template.Property>
  );
}

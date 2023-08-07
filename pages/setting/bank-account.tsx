import {
  BankAccountCreateRequest,
  BankAccountUpdateRequest,
} from "@/@shared/api";
import { BankAccount, User } from "@/@shared/models";
import { AccountType, Bank } from "@/@shared/models/enum";
import { ApiHook, Const, Util } from "@/common";
import { usePage, useSelection } from "@/common/hook";
import * as R from "@/common/rules";
import { Button, Popup, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { Form, Input, Select } from "antd";
import { useForm } from "antd/lib/form/Form";
import _ from "lodash";
import { useEffect, useState } from "react";
import { TbCircleCheck } from "react-icons/tb";

type RecordType = BankAccount;

export default function Component() {
  const [openUpsert, setOpenUpsert] = useState<number | boolean>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Setting.BankAccount.useGetList({ ...page });
  const [selected, setSelected, only] = useSelection<RecordType>([list.data]);

  const apiDelete = ApiHook.Setting.BankAccount.useDelete();
  const cmdDelete = async () => {
    if (!only || !(await Util.confirm("선택한 항목을 삭제하시겠습니까?")))
      return;
    await apiDelete.mutateAsync({ path: { id: only.id } });
  };

  return (
    <Page title="계좌 관리" menu={Const.Menu.SETTING_ACCOUNTED}>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="계좌 추가"
          onClick={() => setOpenUpsert(true)}
        />
        <div className="flex-1" />
        {only && (
          <>
            <Toolbar.ButtonPreset.Delete
              label="항목 삭제"
              onClick={cmdDelete}
            />
            <Toolbar.ButtonPreset.Update
              label="상세 정보"
              onClick={() => only && setOpenUpsert(only.id)}
            />
          </>
        )}
      </Toolbar.Container>
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(item) => item.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "은행",
            render: (record: RecordType) => Util.bankToString(record.bank),
          },
          {
            title: "계좌명",
            render: (record: RecordType) => record.accountName,
          },
          {
            title: "계좌유형",
            render: (record: RecordType) =>
              Util.accountTypeToString(record.accountType),
          },
          {
            title: "계좌번호",
            render: (record: RecordType) => record.accountNumber,
          },
          {
            title: "계좌소유자",
            render: (record: RecordType) => record.accountHolder,
          },
        ]}
      />
      <PopupUpsert open={openUpsert} onClose={setOpenUpsert} />
    </Page>
  );
}

interface PopupUpsertProps {
  open: number | boolean;
  onClose: (unit: false) => void;
}
function PopupUpsert(props: PopupUpsertProps) {
  const [form] = useForm<BankAccountCreateRequest & BankAccountUpdateRequest>();

  const apiCreate = ApiHook.Setting.BankAccount.useCreate();
  const apiUpdate = ApiHook.Setting.BankAccount.useUpdate();
  const apiUpsert = props.open === true ? apiCreate : apiUpdate;
  const cmdUpsert = async () => {
    const data = await form.validateFields();
    await apiUpsert.mutateAsync({ data, path: { id: props.open as number } });

    props.open === true && props.onClose(false);
  };

  const item = ApiHook.Setting.BankAccount.useGetItem(
    _.isNumber(props.open) ? props.open : undefined
  );

  useEffect(
    () => (item.data ? form.setFieldsValue(item.data) : form.resetFields()),
    [item.data]
  );

  const wordPost = props.open === true ? "추가" : "상세";

  return (
    <Popup.Template.Property
      {...props}
      title={`계좌 ${wordPost}`}
      open={!!props.open}
    >
      <div className="flex-1 p-4 flex flex-col">
        <Form layout="vertical" form={form} rootClassName="flex flex-col">
          <Form.Item label="은행" name="bank" rules={[R.required()]}>
            <Select
              options={Array.from<Bank>([
                "KAKAO_BANK",
                "KOOKMIN_BANK",
                "KEB_HANA_BANK",
                "NH_BANK",
                "SHINHAN_BANK",
                "IBK",
                "WOORI_BANK",
                "CITI_BANK_KOREA",
                "HANA_BANK",
                "SC_FIRST_BANK",
                "KYONGNAM_BANK",
                "KWANGJU_BANK",
                "DAEGU_BANK",
                "DEUTSCHE_BANK",
                "BANK_OF_AMERICA",
                "BUSAN_BANK",
                "NACF",
                "SAVINGS_BANK",
                "NACCSF",
                "SUHYUP_BANK",
                "NACUFOK",
                "POST_OFFICE",
                "JEONBUK_BANK",
                "JEJU_BANK",
                "K_BANK",
                "TOS_BANK",
              ]).map((item) => ({
                label: Util.bankToString(item),
                value: item,
              }))}
              disabled={props.open !== true}
            />
          </Form.Item>
          <Form.Item label="계좌명" name="accountName" rules={[R.required()]}>
            <Input />
          </Form.Item>
          <Form.Item label="계좌유형" name="accountType" rules={[R.required()]}>
            <Select
              options={Array.from<AccountType>(["DEPOSIT"]).map((item) => ({
                label: Util.accountTypeToString(item),
                value: item,
              }))}
              disabled={props.open !== true}
            />
          </Form.Item>
          <Form.Item
            label="계좌번호"
            name="accountNumber"
            rules={[R.required(), R.pattern(/^[0-9-]*$/)]}
          >
            <Input disabled={props.open !== true} />
          </Form.Item>
          <Form.Item
            label="계좌소유자"
            name="accountHolder"
            rules={[R.required()]}
          >
            <Input disabled={props.open !== true} />
          </Form.Item>
          <div className="flex-initial flex gap-x-2 my-2">
            <Button.Default
              icon={<TbCircleCheck />}
              label={props.open === true ? "추가" : "수정"}
              type="primary"
              onClick={cmdUpsert}
            />
          </div>
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

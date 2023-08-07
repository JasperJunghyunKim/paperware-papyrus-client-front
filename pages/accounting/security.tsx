import {
  BankAccountCreateRequest,
  BankAccountUpdateRequest,
} from "@/@shared/api";
import { BankAccount } from "@/@shared/models";
import { SecurityType } from "@/@shared/models/enum";
import { ApiHook, Const, Util } from "@/common";
import { usePage, useSelection } from "@/common/hook";
import * as R from "@/common/rules";
import { Button, FormControl, Popup, Table, Toolbar } from "@/components";
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
    <Page title="유가증권 관리" menu={Const.Menu.SETTING_ACCOUNTED}>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="유가증권 추가"
          onClick={() => setOpenUpsert(true)}
        />
        <div className="flex-1" />
        {only && (
          <>
            <Toolbar.ButtonPreset.Delete
              label="항목 삭제"
              onClick={cmdDelete}
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
            title: "유가증권명",
            render: (record: RecordType) => record.accountName,
          },
          {
            title: "유가증권유형",
            render: (record: RecordType) =>
              Util.accountTypeToString(record.accountType),
          },
          {
            title: "유가증권번호",
            render: (record: RecordType) => record.accountNumber,
          },
          {
            title: "유가증권소유자",
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
      title={`유가증권 ${wordPost}`}
      open={!!props.open}
    >
      <div className="flex-1 p-4 flex flex-col">
        <Form layout="vertical" form={form} rootClassName="flex flex-col">
          <Form.Item
            label="유가증권 유형"
            name="securityType"
            rules={[R.required()]}
          >
            <Select
              options={Array.from<SecurityType>([
                "PROMISSORY_NOTE",
                "ELECTRONIC_NOTE",
                "ELECTRONIC_BOND",
                "PERSONAL_CHECK",
                "DEMAND_DRAFT",
                "HOUSEHOLD_CHECK",
                "STATIONERY_NOTE",
                "ETC",
              ]).map((item) => ({
                label: Util.securityTypeToString(item),
                value: item,
              }))}
              disabled={props.open !== true}
            />
          </Form.Item>
          <Form.Item
            label="유가증권 번호"
            name="securitySerial"
            rules={[R.required()]}
          >
            <Input disabled={props.open !== true} />
          </Form.Item>
          <Form.Item
            label="유가증권금액"
            name="securityAmount"
            rules={[R.required()]}
          >
            <FormControl.Number disabled={props.open !== true} />
          </Form.Item>
          <Form.Item label="발행일" name="drawedDate">
            <FormControl.DatePicker disabled={props.open !== true} />
          </Form.Item>
          <Form.Item label="발행은행" name="drawedBank">
            <FormControl.SelectBank disabled={props.open !== true} />
          </Form.Item>
          <Form.Item label="발행 지점명" name="drawedBankBranch">
            <Input disabled={props.open !== true} />
          </Form.Item>
          <Form.Item label="발행지" name="drawedRegion">
            <Input disabled={props.open !== true} />
          </Form.Item>
          <Form.Item label="발행인" name="drawer">
            <Input disabled={props.open !== true} />
          </Form.Item>
          <Form.Item label="만기일" name="maturedDate">
            <FormControl.DatePicker disabled={props.open !== true} />
          </Form.Item>
          <Form.Item label="지급은행" name="payingBank">
            <FormControl.SelectBank disabled={props.open !== true} />
          </Form.Item>
          <Form.Item label="지급지점명" name="payingBankBranch">
            <Input disabled={props.open !== true} />
          </Form.Item>
          <Form.Item label="지급인" name="payer">
            <Input disabled={props.open !== true} />
          </Form.Item>
          <Form.Item label="메모" name="memo">
            <Input.TextArea rows={2} disabled={props.open !== true} />
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

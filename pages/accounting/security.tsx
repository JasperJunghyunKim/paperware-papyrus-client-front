import {
  SecurityCreateRequest,
  SecurityStatusUpdateRequest,
} from "@/@shared/api";
import { Security } from "@/@shared/models";
import { SecurityStatus, SecurityType } from "@/@shared/models/enum";
import { ApiHook, Const, Util } from "@/common";
import { usePage, useSelection } from "@/common/hook";
import * as R from "@/common/rules";
import { FormControl, Popup, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { Form, Input, Select } from "antd";
import { useForm } from "antd/lib/form/Form";
import _ from "lodash";
import { useEffect, useState } from "react";

type RecordType = Security;

export default function Component() {
  const [openUpsert, setOpenUpsert] = useState<number | boolean>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Setting.Security.useGetList({ ...page });
  const [selected, setSelected, only] = useSelection<RecordType>([list.data]);

  const apiDelete = ApiHook.Setting.Security.useDelete();
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
            <Toolbar.ButtonPreset.Update
              label="상세 정보"
              onClick={() => setOpenUpsert(only.id)}
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
            title: "유가증권 유형",
            render: (record: RecordType) =>
              Util.securityTypeToString(record.securityType),
          },
          {
            title: "유가증권 번호",
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {record.securitySerial}
              </div>
            ),
          },
          {
            title: "유가증권 금액",
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {Util.comma(record.securityAmount)} 원
              </div>
            ),
          },
          {
            title: "유가증권 상태",
            render: (record: RecordType) =>
              Util.securityStatusToString(record.securityStatus),
          },
          {
            title: "발행일",
            render: (record: RecordType) =>
              Util.formatIso8601ToLocalDate(record.drawedDate),
          },
          {
            title: "발행은행",
            render: (record: RecordType) =>
              Util.bankToString(record.drawedBank),
          },
          {
            title: "발행지점명",
            render: (record: RecordType) => record.drawedBankBranch,
          },
          {
            title: "발행지",
            render: (record: RecordType) => record.drawedRegion,
          },
          {
            title: "발행인",
            render: (record: RecordType) => record.drawer,
          },
          {
            title: "만기일",
            render: (record: RecordType) =>
              Util.formatIso8601ToLocalDate(record.maturedDate),
          },
          {
            title: "지급은행",
            render: (record: RecordType) =>
              Util.bankToString(record.payingBank),
          },
          {
            title: "지급지점명",
            render: (record: RecordType) => record.payingBankBranch,
          },
          {
            title: "지급인",
            render: (record: RecordType) => record.payer,
          },
          {
            title: "메모",
            render: (record: RecordType) => record.memo,
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
  const [form] = useForm<SecurityCreateRequest & SecurityStatusUpdateRequest>();

  const apiCreate = ApiHook.Setting.Security.useCreate();
  const apiUpdateStatus = ApiHook.Setting.Security.useUpdateStatus();
  const apiUpsert = props.open === true ? apiCreate : apiUpdateStatus;
  const cmdCreate = async () => {
    const data = await form.validateFields();
    await apiUpsert.mutateAsync({ data, path: { id: props.open as number } });

    props.open === true && props.onClose(false);
  };

  const item = ApiHook.Setting.Security.useGetItem(
    _.isNumber(props.open) ? props.open : undefined
  );

  useEffect(
    () =>
      item.data
        ? form.setFieldsValue({
            securityType: item.data.securityType,
            securitySerial: item.data.securitySerial,
            securityAmount: item.data.securityAmount,
            drawedDate: item.data.drawedDate ?? undefined,
            drawedBank: item.data.drawedBank ?? undefined,
            drawedBankBranch: item.data.drawedBankBranch ?? undefined,
            drawedRegion: item.data.drawedRegion ?? undefined,
            drawer: item.data.drawer ?? undefined,
            maturedDate: item.data.maturedDate ?? undefined,
            payingBank: item.data.payingBank ?? undefined,
            payingBankBranch: item.data.payingBankBranch ?? undefined,
            payer: item.data.payer ?? undefined,
            memo: item.data.memo ?? undefined,
          })
        : form.resetFields(),
    [form, item.data]
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
          {item.data && (
            <Form.Item
              label="유가증권 상태"
              name="securityStatus"
              rules={[R.required()]}
            >
              <Select
                options={Array.from<SecurityStatus>([
                  "NONE",
                  "NORMAL_PAYMENT",
                  "DISCOUNT_PAYMENT",
                  "INSOLVENCY",
                  "LOST",
                  "SAFEKEEPING",
                ]).map((item) => ({
                  label: Util.securityStatusToString(item),
                  value: item,
                }))}
                disabled={item.data.bySecurities.length !== 0}
              />
            </Form.Item>
          )}
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
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

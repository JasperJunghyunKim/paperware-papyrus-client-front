import { Api, Model } from "@/@shared";
import { ShippingType } from "@/@shared/models/enum";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, Popup, Search, StatBar, Table, Toolbar } from "@/components";
import {
  Number,
  SelectCompanyRegistrationNumber,
  SelectUser,
} from "@/components/formControl";
import { Page } from "@/components/layout";
import { Form, Input, Select } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import classNames from "classnames";
import { useEffect } from "react";
import { useCallback, useState } from "react";
import { TbHome, TbHomeShield } from "react-icons/tb";
import * as R from "@/common/rules";
import { match } from "ts-pattern";
import { ShippingItem } from "@/@shared/models";
import _ from "lodash";

type RecordType = ShippingItem;

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);
  const [openAssignManager, setOpenAssignManager] = useState<number | false>(
    false
  );

  const [search, setSearch] = useState<any>({});
  const [page, setPage] = usePage();
  const list = ApiHook.Shipping.Shipping.useGetList({
    query: { ...page, ...search },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);

  const only = Util.only(selected);

  const apiUnassignManager = ApiHook.Shipping.Shipping.useUnassignManager();
  const cmdUnassignManager = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(
        `선택한 배송(${only.shippingNo})의 담당자 배정을 취소하시겠습니까?`
      ))
    ) {
      return;
    }

    await apiUnassignManager.mutateAsync({
      shippingId: only.id,
    });
  }, [apiUnassignManager, only]);

  const apiDelete = ApiHook.Shipping.Shipping.useDelete();
  const cmdDelete = useCallback(async () => {
    if (
      !only ||
      !(await Util.confirm(
        `선택한 배송(${only.shippingNo})을 삭제하시겠습니까?`
      ))
    ) {
      return;
    }

    await apiDelete.mutateAsync({
      shippingId: only.id,
    });
  }, [apiDelete, only]);

  useEffect(() => {
    if (list.data && only) {
      const found = list.data.items.find((x) => x.id === only.id);
      setSelected(found ? [found] : []);
    }
  }, [list.data, only]);

  useEffect(() => {
    setSelected([]);
  }, [list.data]);

  const progressColumn = useCallback((record: RecordType) => {
    const preparing = record.invoice.filter(
      (p) => p.invoiceStatus === "WAIT_SHIPPING"
    );
    const progressing = record.invoice.filter(
      (p) => p.invoiceStatus === "ON_SHIPPING"
    );
    const progressed = record.invoice.filter(
      (p) => p.invoiceStatus === "DONE_SHIPPING"
    );
    return (
      <div className="flex gap-x-2 text-gray-400 select-none">
        <div
          className={classNames(
            "flex-initial border border-solid px-2 rounded-full",
            {
              "text-amber-600 border-amber-600": preparing.length > 0,
              "text-gray-300 border-gray-300": preparing.length === 0,
            }
          )}
        >
          {`상차 완료 ${preparing.length}`}
        </div>
        <div
          className={classNames(
            "flex-initial border border-solid px-2 rounded-full",
            {
              "text-green-600 border-green-600": progressing.length > 0,
              "text-gray-300 border-gray-300": progressing.length === 0,
            }
          )}
        >
          {`배송중 ${progressing.length}`}
        </div>
        <div
          className={classNames(
            "flex-initial border border-solid px-2 rounded-full",
            {
              "text-blue-600 border-blue-600": progressed.length > 0,
              "text-gray-300 border-gray-300": progressed.length === 0,
            }
          )}
        >
          {`배송 완료 ${progressed.length}`}
        </div>
      </div>
    );
  }, []);
  return (
    <Page title="배송 설정" menu={Const.Menu.SHIPPING}>
      <StatBar.Container>
        <StatBar.Item icon={<TbHome />} label="공개 배송" value={"-"} />
        <StatBar.Item
          icon={<TbHomeShield />}
          label="비공개 배송"
          value={"-"}
          iconClassName="text-purple-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="배송 추가"
          onClick={() => setOpenCreate(true)}
        />
        <div className="flex-1" />
        {only && (
          <>
            <Toolbar.ButtonPreset.Delete
              label="선택 배송 삭제"
              onClick={cmdDelete}
            />
            {only.manager ? (
              <Toolbar.Button
                label="담당자 배정 취소"
                onClick={cmdUnassignManager}
              />
            ) : only.type === "INHOUSE" ? (
              <Toolbar.Button
                label="담당자 배정"
                onClick={() => setOpenAssignManager(only.id)}
              />
            ) : null}

            <Toolbar.ButtonPreset.Update
              label="선택 배송 상세"
              onClick={() => setOpenUpdate(only.id)}
            />
          </>
        )}
      </Toolbar.Container>
      <Search
        items={[
          {
            type: "select-shipping-type",
            label: "배송 구분",
            field: "types",
          },
          {
            type: "text",
            label: "배송 번호",
            field: "shippingNo",
          },
          {
            type: "select-order-shipping-status",
            label: "배송 상태",
            field: "invoiceStatus",
          },
          {
            type: "select-user",
            label: "배송 담당자",
            field: "managerIds",
          },
          {
            type: "select-company-registration-number",
            label: "거래처",
            field: "companyRegistrationNumbers",
          },
          {
            type: "text",
            label: "배송 메모",
            field: "memo",
          },
          {
            type: "date-range",
            label: "생성일시",
            field: "createdAt",
          },
        ]}
        value={search}
        onSearch={setSearch}
      />
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "배송 구분",
            render: (record: RecordType) => (
              <div>
                {match(record.type)
                  .with("INHOUSE", () => "자사 배송")
                  .with("OUTSOURCE", () => "외주 배송")
                  .with("PARTNER_PICKUP", () => "거래처 픽업")
                  .otherwise(() => "")}
              </div>
            ),
          },
          {
            title: "배송 번호",
            dataIndex: "shippingNo",
            render: (value) => (
              <div className="font-fixed">{Util.formatSerial(value)}</div>
            ),
          },
          {
            title: "배송 상태",
            render: (record: RecordType) => progressColumn(record),
          },
          {
            title: "운송장 개수",
            dataIndex: "invoiceCount",
            render: (value) => (
              <div className="font-fixed text-right">{value} 개</div>
            ),
          },
          {
            title: "배송 중량",
            render: (record: RecordType) => (
              <div className="text-right font-fixed">{`${Util.comma(
                record.invoiceWeight,
                3
              )} T`}</div>
            ),
          },
          {
            title: "배송 담당자",
            render: (record: RecordType) => <div>{record.manager?.name}</div>,
          },
          ...Table.Preset.useColumnPartner2<RecordType>({
            title: "거래처",
            getValue: (record: RecordType) => record.companyRegistrationNumber,
          }),
          {
            title: "금액",
            render: (record: RecordType) =>
              _.isFinite(record.price) && (
                <div className="text-right font-fixed">
                  {Util.comma(record.price)} 원
                </div>
              ),
          },
          {
            title: "배송 메모",
            dataIndex: "memo",
          },
          {
            title: "생성자",
            render: (record: RecordType) => (
              <div>{record.createdByUser.name}</div>
            ),
          },
          {
            title: "생성일시",
            render: (record: RecordType) => (
              <div>{Util.formatIso8601ToLocalDateTime(record.createdAt)}</div>
            ),
          },
        ]}
      />
      <PopupCreate
        open={openCreate}
        onClose={setOpenCreate}
        onCreated={(id) => setOpenUpdate(id)}
      />
      <Popup.Shipping.Update open={openUpdate} onClose={setOpenUpdate} />
      <PopupAssignMananger
        open={openAssignManager}
        onClose={setOpenAssignManager}
      />
    </Page>
  );
}

interface PopupCreateProps {
  open: boolean;
  onClose: (unit: boolean) => void;
  onCreated: (id: number) => void;
}
function PopupCreate(props: PopupCreateProps) {
  const [form] = useForm<Api.ShippingCreateRequest>();
  const type = useWatch("type", form);

  const apiCreate = ApiHook.Shipping.Shipping.useCreate();
  const cmdCreate = useCallback(async () => {
    if (!(await Util.confirm("배송을 추가하시겠습니까?"))) return;
    const data = await form.validateFields();

    const resp = await apiCreate.mutateAsync({ data });
    props.onClose(false);
    props.onCreated(resp.id);
  }, [apiCreate, form]);

  return (
    <Popup.Template.Property {...props} title="배송 추가" height="auto">
      <Form
        layout="vertical"
        form={form}
        rootClassName="p-4 flex flex-col w-full"
      >
        <Form.Item label="배송 구분" name="type" rules={[R.required()]}>
          <Select
            options={[
              { label: "자사 배송", value: "INHOUSE" },
              { label: "거래처 픽업", value: "PARTNER_PICKUP" },
              { label: "외주 배송", value: "OUTSOURCE" },
            ]}
          />
        </Form.Item>
        {type === "INHOUSE" && (
          <Form.Item label="배송 담당자" name="managerId">
            <SelectUser />
          </Form.Item>
        )}
        {type !== "INHOUSE" && (
          <Form.Item label="거래처 파트너" name="companyRegistrationNumber">
            <SelectCompanyRegistrationNumber />
          </Form.Item>
        )}
        {type !== "INHOUSE" && (
          <Form.Item label="금액" name="price">
            <Number />
          </Form.Item>
        )}
        <Form.Item
          label="배송 메모"
          name="memo"
          rules={type === "INHOUSE" ? [] : [R.required()]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
        <div className="flex-initial flex gap-x-2 mt-4">
          <Button.Default
            label="배송 추가"
            onClick={cmdCreate}
            type="primary"
          />
        </div>
      </Form>
    </Popup.Template.Property>
  );
}

interface PopupAssignManangerProps {
  open: number | false;
  onClose: (unit: false) => void;
}
function PopupAssignMananger(props: PopupAssignManangerProps) {
  const [form] = useForm<Api.ShippingAssignMangerRequest>();

  const apiAssignManager = ApiHook.Shipping.Shipping.useAssignManager();
  const cmdAssignManager = useCallback(async () => {
    if (!props.open) return;
    if (!(await Util.confirm("담당자를 배정하시겠습니까?"))) return;
    const data = await form.validateFields();

    await apiAssignManager.mutateAsync({
      shippingId: props.open,
      data,
    });
    props.onClose(false);
  }, [apiAssignManager, form]);

  return (
    <Popup.Template.Property
      {...props}
      open={!!props.open}
      title="담당자 배정"
      height="auto"
    >
      <div className="p-4 flex flex-col w-full">
        <Form layout="vertical" form={form}>
          <Form.Item
            label="배송 담당자"
            name="managerId"
            rules={[R.required()]}
          >
            <SelectUser />
          </Form.Item>
        </Form>
        <div className="flex-initial flex gap-x-2 mt-4 justify-center">
          <Button.Default
            label="담당자 배정"
            type="primary"
            onClick={cmdAssignManager}
          />
          <Button.Default label="취소" onClick={() => props.onClose(false)} />
        </div>
      </div>
    </Popup.Template.Property>
  );
}

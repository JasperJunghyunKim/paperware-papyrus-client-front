import { CardCreateRequest, CardUpdateRequest } from "@/@shared/api";
import { Card } from "@/@shared/models";
import { CardCompany } from "@/@shared/models/enum";
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

type RecordType = Card;

export default function Component() {
  const [openUpsert, setOpenUpsert] = useState<number | boolean>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Setting.Card.useGetList({ ...page });
  const [selected, setSelected, only] = useSelection<RecordType>([list.data]);

  const apiDelete = ApiHook.Setting.Card.useDelete();
  const cmdDelete = async () => {
    if (!only || !(await Util.confirm("선택한 항목을 삭제하시겠습니까?")))
      return;
    await apiDelete.mutateAsync({ path: { id: only.id } });
  };

  return (
    <Page title="카드 설정" menu={Const.Menu.SETTING_ACCOUNTED}>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="카드 추가"
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
            render: (record: RecordType) =>
              Util.cardCompanyString(record.cardCompany),
          },
          {
            title: "카드명",
            render: (record: RecordType) => record.cardName,
          },
          {
            title: "카드번호",
            render: (record: RecordType) => record.cardNumber,
          },
          {
            title: "카드소유자",
            render: (record: RecordType) => record.cardHolder,
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
  const [form] = useForm<CardCreateRequest & CardUpdateRequest>();

  const apiCreate = ApiHook.Setting.Card.useCreate();
  const apiUpdate = ApiHook.Setting.Card.useUpdate();
  const apiUpsert = props.open === true ? apiCreate : apiUpdate;
  const cmdUpsert = async () => {
    const data = await form.validateFields();
    await apiUpsert.mutateAsync({ data, path: { id: props.open as number } });

    props.open === true && props.onClose(false);
  };

  const item = ApiHook.Setting.Card.useGetItem(
    _.isNumber(props.open) ? props.open : undefined
  );

  useEffect(
    () =>
      props.open && item.data
        ? form.setFieldsValue(item.data)
        : form.resetFields(),
    [form, item.data, props.open]
  );

  const wordPost = props.open === true ? "추가" : "상세";

  return (
    <Popup.Template.Property
      {...props}
      title={`카드 ${wordPost}`}
      open={!!props.open}
    >
      <div className="flex-1 p-4 flex flex-col">
        <Form layout="vertical" form={form} rootClassName="flex flex-col">
          <Form.Item label="카드회사" name="cardCompany" rules={[R.required()]}>
            <Select
              options={Array.from<CardCompany>([
                "BC_CARD",
                "KB_CARD",
                "SAMSUNG_CARD",
                "SHINHAN_CARD",
                "WOORI_CARD",
                "HANA_CARD",
                "LOTTE_CARD",
                "HYUNDAI_CARD",
                "NH_CARD",
              ]).map((item) => ({
                label: Util.cardCompanyString(item),
                value: item,
              }))}
              showSearch
              filterOption={(input, option) =>
                (option?.label.toLowerCase().indexOf(input.toLowerCase()) ??
                  0) >= 0
              }
              disabled={props.open !== true}
            />
          </Form.Item>
          <Form.Item label="카드명" name="cardName" rules={[R.required()]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="카드번호"
            name="cardNumber"
            rules={[R.required(), R.pattern(/^[0-9-]*$/)]}
          >
            <Input
              disabled={props.open !== true}
              maxLength={4}
              placeholder="카드번호 끝 4자리"
            />
          </Form.Item>
          <Form.Item
            label="카드소유자"
            name="cardHolder"
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

import { UserCreateRequest } from "@/@shared/api/setting/user.request";
import { SettingUserResponse } from "@/@shared/api/setting/user.response";
import { Enum, User } from "@/@shared/models";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import * as R from "@/common/rules";
import { Button, Popup, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { Form, Input, Select } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useState } from "react";
import { TbCircleCheck } from "react-icons/tb";

export default function Component() {
  const [openUpsert, setOpenUpsert] = useState<number | boolean>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Setting.User.useGetList({ query: page });

  const test = ApiHook.Setting.BankAccount;

  const me = ApiHook.Auth.useGetMe();

  const [selected, setSelected] = useState<SettingUserResponse[]>([]);
  const only = Util.only(selected);

  useEffect(() => {
    setSelected([]);
  }, [list.data]);

  const apiSetActivated = ApiHook.Setting.User.useSetActivated();
  const cmdSetActivated = (isActivated: boolean) => async () => {
    if (!only || only.isActivated === isActivated) return;
    if (!(await Util.confirm("계정 활성 상태를 변경하시겠습니까?"))) return;

    await apiSetActivated.mutateAsync({
      userId: only.id,
      data: { isActivated },
    });
  };

  return (
    <Page title="계좌 관리" menu={Const.Menu.SETTING_ACCOUNTED}>
      <Toolbar.Container>
        {me.data?.isAdmin && (
          <Toolbar.ButtonPreset.Create
            label="계좌 추가"
            onClick={() => setOpenUpsert(true)}
          />
        )}
        <div className="flex-1" />
        {only && only.isActivated && !only.isAdmin && me.data?.isAdmin && (
          <Toolbar.ButtonPreset.Delete
            label="항목 삭제"
            onClick={cmdSetActivated(false)}
          />
        )}
        {only && me.data?.isAdmin && (
          <Toolbar.ButtonPreset.Update
            label="상세 정보"
            onClick={() => only && setOpenUpsert(only.id)}
          />
        )}
      </Toolbar.Container>
      <Table.Default<SettingUserResponse>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(item) => item.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "아이디",
            render: (record: User) => (
              <div className="font-fixed">{record.username}</div>
            ),
          },
          {
            title: "관리자 구분",
            render: (record: User) => (record.isAdmin ? "관리자" : "일반"),
          },
          { title: "이름", dataIndex: "name" },
          {
            title: "전화번호",
            render: (record: User) => Util.formatPhoneNo(record.phoneNo),
          },
          {
            title: "이메일",
            dataIndex: "email",
          },
          {
            title: "계정 상태",
            render: (record: User) => (record.isActivated ? "활성" : "비활성"),
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
  const [form] = useForm<UserCreateRequest>();

  useEffect(() => {
    if (props.open === false) {
      form.resetFields();
    }
  }, [props.open]);

  const wordPost = props.open === true ? "추가" : "상세";

  return (
    <Popup.Template.Property
      {...props}
      title={`계좌 ${wordPost}`}
      open={!!props.open}
    >
      <div className="flex-1 p-4 flex flex-col">
        <Form layout="vertical" form={form} rootClassName="flex flex-col">
          <Form.Item
            label="은행"
            name="bank"
            dependencies={["bank"]}
            rules={[R.required()]}
          >
            <Select
              options={[
                ["KAKAO_BANK", "카카오뱅크"],
                ["KOOKMIN_BANK", "국민은행"],
                ["KEB_HANA_BANK", "기업은행"],
                ["NH_BANK", "NH농협은행"],
                ["SHINHAN_BANK", "신한은행"],
                ["IBK", "산업은행"],
                ["WOORI_BANK", "우리은행"],
                ["CITI_BANK_KOREA", "한국씨티은행"],
                ["HANA_BANK", "하나은행"],
                ["SC_FIRST_BANK", "SC제일은행"],
                ["KYONGNAM_BANK", "경남은행"],
                ["KWANGJU_BANK", "광주은행"],
                ["DAEGU_BANK", "대구은행"],
                ["DEUTSCHE_BANK", "도이치은행"],
                ["BANK_OF_AMERICA", "뱅크오브아메리카"],
                ["BUSAN_BANK", "부산은행"],
                ["NACF", "산리조합중앙회"],
                ["SAVINGS_BANK", "저축은행"],
                ["NACCSF", "새마을금고"],
                ["SUHYUP_BANK", "수협은행"],
                ["NACUFOK", "신협중앙회"],
                ["POST_OFFICE", "우체국"],
                ["JEONBUK_BANK", "전북은행"],
                ["JEJU_BANK", "제주은행"],
                ["K_BANK", "케이뱅크"],
                ["TOS_BANK", "토스뱅크"],
              ].map((item) => ({ label: item[1], value: item[0] }))}
            />
          </Form.Item>
          <Form.Item label="계좌명" name="accountName" rules={[R.required()]}>
            <Input />
          </Form.Item>
          <Form.Item label="계좌유형" name="accountType" rules={[R.required()]}>
            <Select
              options={[["DEPOSIT", "보통예금"]].map((item) => ({
                label: item[1],
                value: item[0],
              }))}
            />
          </Form.Item>
          <Form.Item
            label="계좌번호"
            name="accountNumber"
            rules={[R.required(), R.pattern(/^[0-9-]*$/)]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="예금주" name="accountHolder" rules={[R.required()]}>
            <Input />
          </Form.Item>
          <div className="flex-initial flex gap-x-2 my-2">
            <Button.Default
              icon={<TbCircleCheck />}
              label={props.open === true ? "추가" : "수정"}
              type="primary"
              onClick={() => props.onClose(false)}
            />
          </div>
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

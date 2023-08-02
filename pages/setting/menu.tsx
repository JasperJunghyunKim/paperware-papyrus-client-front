import { UserMenuUpdateRequest } from "@/@shared/api/setting/user.request";
import { SettingUserResponse } from "@/@shared/api/setting/user.response";
import { User } from "@/@shared/models";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Button, Popup, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { Checkbox, Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useEffect, useState } from "react";
import { match } from "ts-pattern";

export default function Component() {
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Setting.User.useGetList({ query: page });

  const [selected, setSelected] = useState<SettingUserResponse[]>([]);
  const only = Util.only(selected);

  useEffect(() => {
    setSelected([]);
  }, [list.data]);

  return (
    <Page title="직원 메뉴 설정" admin>
      <Toolbar.Container>
        <div className="flex-1" />
        {only &&
          (only.isAdmin ? (
            <Toolbar.ButtonPreset.Update
              label="메뉴 설정"
              disabled
              tooltip="관리자는 메뉴를 설정할 수 없습니다."
            />
          ) : (
            <Toolbar.ButtonPreset.Update
              label="메뉴 설정"
              onClick={() => only && setOpenUpdate(only.id)}
              disabled={only.isAdmin}
            />
          ))}
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
            title: "계정 상태",
            render: (record: User) => (record.isActivated ? "활성" : "비활성"),
          },
          {
            title: "활성화된 메뉴",
            render: (record: User) => {
              if (record.isAdmin) {
                return "";
              }
              try {
                const menu = JSON.parse(record.menu?.menu ?? "[]");
                return `${menu.length} 개`;
              } catch (e) {
                return null;
              }
            },
          },
        ]}
      />
      <PopupUpdateUser open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}

interface PopupUpdateUserProps {
  open: number | false;
  onClose: (unit: false) => void;
}
function PopupUpdateUser(props: PopupUpdateUserProps) {
  const [form] = useForm<UserMenuUpdateRequest>();

  const user = ApiHook.Setting.User.useGetItem({
    userId: props.open ? props.open : null,
  });
  const menu = ApiHook.Setting.User.useGetMenu({
    userId: props.open ? props.open : null,
  });

  const apiUpdateMenu = ApiHook.Setting.User.useUpdateMenu();
  const cmdUpdateMenu = async () => {
    if (!props.open) return;

    const values = await form.validateFields();
    await apiUpdateMenu.mutateAsync({
      userId: props.open,
      data: {
        menu: JSON.stringify(
          Object.entries(values)
            .filter(([_, value]) => value)
            .map(([key, _]) => key)
        ),
      },
    });
  };

  useEffect(() => {
    try {
      const menuData: string[] | null = menu.data?.menu
        ? JSON.parse(menu.data.menu)
        : null;
      if (!menuData) {
        form.resetFields();
        return;
      }

      menuData.forEach((menu) => {
        form.setFieldsValue({ [menu]: true });
      });
    } catch (e) {
      form.resetFields();
    }
  }, [menu.data]);

  const options = Object.entries(Const.Menu)
    .map(([key, value]) => ({
      key: value,
      label: match(value)
        .with(Const.Menu.DASHBOARD, () => "대시보드")
        .with(Const.Menu.STOCK_INHOUSE, () => "자사 재고 관리")
        .with(Const.Menu.STOCK_ARRIVAL, () => "예정 목록")
        .with(Const.Menu.STOCK_PARTNER, () => "매입처 재고 조회")
        .with(Const.Menu.DEPOSIT_SALES, () => "매출 보관량 조회")
        .with(Const.Menu.DEPOSIT_PURCHASE, () => "매입 보관량 조회")
        .with(Const.Menu.ORDER_REQUEST_RECEIVED, () => "퀵 주문 수신함")
        .with(Const.Menu.ORDER_REQUEST_SENT, () => "퀵 주문 발신함")
        .with(Const.Menu.TRADE_SALES, () => "매출 수주 목록")
        .with(Const.Menu.TRADE_PURCHASE, () => "매입 주문 목록")
        .with(Const.Menu.INHOUSE_PROCESS, () => "내부 공정 목록")
        .with(Const.Menu.PLAN, () => "작업 계획 목록")
        .with(Const.Menu.SHIPPING, () => "배송 목록")
        .with(Const.Menu.COLLETED, () => "수금 관리")
        .with(Const.Menu.PAID, () => "지급 관리")
        .with(Const.Menu.SECURITIES, () => "유가증권 관리")
        .with(Const.Menu.UNPAID_COLLECTED, () => "미수금 잔액")
        .with(Const.Menu.UNPAID_PAID, () => "미지급 잔액")
        .with(Const.Menu.TAX_INVOICE, () => "전자세금계산서")
        .with(Const.Menu.SETTING_COMPANY, () => "회사 정보 설정")
        .with(Const.Menu.SETTING_USER, () => "직원 설정")
        .with(Const.Menu.SETTING_PARTNER, () => "거래처 설정")
        .with(Const.Menu.SETTING_WAREHOUSE, () => "창고 설정")
        .with(Const.Menu.SETTING_LOCATION, () => "도착지 설정")
        .with(Const.Menu.SETTING_CARD, () => "카드 설정")
        .with(Const.Menu.SETTING_ACCOUNTED, () => "계좌 설정")
        .with(Const.Menu.SETTING_OFFICIAL_PRICE, () => "고시가 설정")
        .with(Const.Menu.SETTING_DISCOUNT_SALES, () => "매출 할인율 설정")
        .with(Const.Menu.SETTING_DISCOUNT_PURCHASE, () => "매입 할인율 설정")
        .otherwise(() => null),
    }))
    .filter((p) => p.label !== null);

  return (
    <Popup.Template.Property
      title="직원 메뉴 상세 정보"
      {...props}
      open={!!props.open}
    >
      <div className="flex-1 p-4 flex flex-col">
        <Form layout="vertical" form={form}>
          <div className="flex-initial flex gap-x-2">
            <Form.Item label="아이디">
              <Input disabled value={user.data?.username} />
            </Form.Item>
            <Form.Item label={"이름"}>
              <Input disabled value={user.data?.name} />
            </Form.Item>
          </div>
          <div className="h-px bg-gray-200 my-4" />
          <div className="flex-initial font-bold mb-2">메뉴 설정</div>
          <div className="flex-initial flex gap-x-2 mb-2">
            <Button.Default
              label="전체 선택"
              onClick={() => {
                options.forEach((option) => {
                  form.setFieldsValue({ [option.key]: true });
                });
              }}
            />
            <Button.Default
              label="전체 해제"
              onClick={() => {
                options.forEach((option) => {
                  form.setFieldsValue({ [option.key]: false });
                });
              }}
            />
          </div>
          {options.map((option, index) => (
            <Form.Item
              key={option.key}
              name={option.key}
              valuePropName="checked"
            >
              <Checkbox>{option.label}</Checkbox>
            </Form.Item>
          ))}
          <div className="h-px bg-gray-200 my-4" />
          <div className="flex-initial flex py-2">
            <Button.Default
              label="직원 메뉴 수정"
              onClick={cmdUpdateMenu}
              type="primary"
            />
          </div>
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

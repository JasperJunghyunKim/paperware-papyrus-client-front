import { ApiHook, Const, Util } from "@/common";
import { Button, Icon, Logo } from "@/components";
import { Tooltip } from "antd";
import classNames from "classnames";
import { useRouter } from "next/router";
import {
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  TbBookDownload,
  TbBookUpload,
  TbBuildingBank,
  TbBuildingWarehouse,
  TbCards,
  TbCash,
  TbCashBanknote,
  TbChartDots,
  TbClipboardList,
  TbColorSwatch,
  TbDiscount,
  TbDiscount2,
  TbFileExport,
  TbFilePower,
  TbFunction,
  TbHomeMove,
  TbInputSearch,
  TbMapPin,
  TbPower,
  TbReportMoney,
  TbServer2,
  TbServerBolt,
  TbSettings,
  TbSubtask,
  TbTournament,
  TbTruck,
  TbVector,
  TbVectorTriangle,
} from "react-icons/tb";
import Menu, { Menu as MenuDef } from "./Menu";
import axios from "axios";

export interface Props {
  title: string;
  menu?: string;
  admin?: boolean;
}

export default function Component(props: PropsWithChildren<Props>) {
  const router = useRouter();

  const businessRelationshipRequestCount =
    ApiHook.Inhouse.BusinessRelationshipRequest.useGetPendingCount();

  const menus = useMemo<MenuDef[]>(
    () => [
      {
        label: "대시보드",
        icon: <TbChartDots />,
        path: "/",
        noti: 0,
        type: "wip",
        menu: Const.Menu.DASHBOARD,
      },
      { path: null },
      {
        label: "자사 재고 관리",
        icon: <TbServer2 />,
        path: "/stock-inhouse",
        menu: Const.Menu.STOCK_INHOUSE,
      },
      {
        label: "예정 목록",
        icon: <TbServerBolt />,
        path: "/stock-arrival",
        menu: Const.Menu.STOCK_ARRIVAL,
      },
      {
        label: "매입처 재고 조회",
        icon: <TbInputSearch />,
        path: "/stock-partner",
        menu: Const.Menu.STOCK_PARTNER,
      },
      {
        label: "매출 보관량 조회",
        icon: <TbBookUpload />,
        path: "/deposit-sales",
        menu: Const.Menu.DEPOSIT_SALES,
      },
      {
        label: "매입 보관량 조회",
        icon: <TbBookDownload />,
        path: "/deposit-purchase",
        menu: Const.Menu.DEPOSIT_PURCHASE,
      },
      { path: null },
      {
        label: "퀵 주문 수신함",
        icon: <TbFilePower />,
        path: "/quick-order-received",
        menu: Const.Menu.ORDER_REQUEST_RECEIVED,
      },
      {
        label: "퀵 주문 발신함",
        icon: <TbFileExport />,
        path: "/quick-order-sended",
        menu: Const.Menu.ORDER_REQUEST_SENT,
      },
      { path: null },
      {
        label: "매출 수주 목록",
        icon: <TbSubtask />,
        path: "/trade-sales",
        menu: Const.Menu.TRADE_SALES,
      },
      {
        label: "매입 주문 목록",
        icon: <TbClipboardList />,
        path: "/trade-order",
        menu: Const.Menu.TRADE_PURCHASE,
      },
      {
        label: "내부 공정 목록",
        icon: <TbFunction />,
        path: "/process",
        menu: Const.Menu.INHOUSE_PROCESS,
      },
      { path: null },
      {
        label: "작업 계획 목록",
        icon: <TbTournament />,
        path: "/plan",
        menu: Const.Menu.PLAN,
      },
      {
        label: "배송 목록",
        icon: <TbTruck />,
        path: "/shipping",
        menu: Const.Menu.SHIPPING,
      },
      { path: null },
      {
        label: "수금 관리",
        icon: <TbVector />,
        path: "/collected-history",
        menu: Const.Menu.COLLETED,
      },
      {
        label: "지급 관리",
        icon: <TbVectorTriangle />,
        path: "/paid-history",
        menu: Const.Menu.PAID,
      },
      {
        label: "유가증권 관리",
        icon: <TbReportMoney />,
        path: "/security",
        menu: Const.Menu.SECURITIES,
      },
      {
        label: "미수금 잔액",
        icon: <TbCashBanknote />,
        path: "/unpaid-collected",
        menu: Const.Menu.UNPAID_COLLECTED,
      },
      {
        label: "미지급 잔액",
        icon: <TbCashBanknote />,
        path: "/unpaid-paid",
        menu: Const.Menu.UNPAID_PAID,
      },
      {
        label: "전자세금계산서 목록",
        icon: <TbCash />,
        path: "/tax-invoice",
        menu: Const.Menu.TAX_INVOICE,
      },
      { path: null },
      {
        label: "카드 관리",
        icon: <TbCards />,
        path: "/card",
        menu: Const.Menu.SETTING_CARD,
      },
      {
        label: "계좌 관리",
        icon: <TbBuildingBank />,
        path: "/bank-account",
        menu: Const.Menu.SETTING_ACCOUNTED,
      },
      { path: null },
      {
        label: "계정 설정",
        icon: <TbSettings />,
        path: "/setting/account",
        menu: Const.Menu.SETTING_ACCOUNT,
      },
      {
        label: "회사 정보 설정",
        icon: <TbSettings />,
        path: "/setting/company",
        menu: Const.Menu.SETTING_COMPANY,
      },
      {
        label: "직원 설정",
        icon: <TbSettings />,
        path: "/setting/employee",
        menu: Const.Menu.SETTING_USER,
      },
      {
        label: "직원 메뉴 설정",
        icon: <TbSettings />,
        path: "/setting/menu",
        menu: Const.Menu.SETTING_ROLE,
        admin: true,
      },
      {
        label: "거래처 설정",
        icon: <TbHomeMove />,
        path: "/business-relationship",
        noti: businessRelationshipRequestCount.data?.value,
        menu: Const.Menu.SETTING_PARTNER,
      },
      {
        label: "창고 설정",
        icon: <TbBuildingWarehouse />,
        path: "/warehouse",
        menu: Const.Menu.SETTING_WAREHOUSE,
      },
      {
        label: "도착지 설정",
        icon: <TbMapPin />,
        path: "/location",
        menu: Const.Menu.SETTING_LOCATION,
      },
      {
        label: "고시가 설정",
        icon: <TbColorSwatch />,
        path: "/official-price",
        menu: Const.Menu.SETTING_OFFICIAL_PRICE,
      },
      {
        label: "매출 할인율 설정",
        icon: <TbDiscount />,
        path: "/discount-sales",
        menu: Const.Menu.SETTING_DISCOUNT_SALES,
      },
      {
        label: "매입 할인율 설정",
        icon: <TbDiscount2 />,
        path: "/discount-purchase",
        menu: Const.Menu.SETTING_DISCOUNT_PURCHASE,
      },
    ],
    [businessRelationshipRequestCount.data?.value]
  );

  const me = ApiHook.Auth.useGetMe();

  useEffect(() => {
    console.log(me);
    if (me.isError) {
      router.replace("/login");
    }
  }, [router, me.isError]);

  const logout = useCallback(async () => {
    if (!(await Util.confirm("로그아웃 하시겠습니까?"))) return;

    axios.defaults.headers.common["Authorization"] = "";
    localStorage.removeItem("at");
    router.replace("/login");
  }, [router]);

  const isMenuAccessible = (menu: string | undefined) => {
    try {
      if (!me.data) return false;
      if (me.data.isAdmin) return true;

      const menuData: string[] | null = me.data.menu
        ? JSON.parse(me.data.menu.menu)
        : null;
      if (!menuData) return false;

      return menu && menuData.includes(menu);
    } catch (e) {
      return false;
    }
  };

  return (
    <>
      <title>PAPERWARE ─ 페이퍼웨어</title>
      <div className="flex">
        <div className="flex-shrink-0 flex-grow-0 bg-white text-black border-solid border-0 border-r border-gray-200 overflow-y-scroll h-screen top-0 fixed w-60">
          <Logo.Paperware />
          <aside>
            <div className="flex-initial">
              <Menu menus={menus} />
            </div>
          </aside>
          <div className="h-40" />
        </div>
        <div className="basis-60" />
        <div className="flex-1 w-0 bg-slate-100 flex flex-col">
          <header className="flex flex-initial px-4 h-16 bg-white border-solid border-0 border-b border-gray-200 select-none fixed top-0 right-0 left-60 z-10">
            <div className="flex-1">{/* TODO */}</div>
            <div className="flex-initial flex gap-x-4 justify-end">
              <div className="flex-initial flex flex-col justify-center flex-nowrap whitespace-nowrap font-bold text-gray-800">
                {me.data?.company.businessName}
              </div>
              <div className="flex-initial basis-10 flex-shrink-0 flex flex-col justify-center">
                <div className="basis-10 rounded-full bg-gray-200 text-center flex flex-col justify-center text-xl">
                  {me.data?.name?.substring(0, 1)}
                </div>
              </div>
              <div className="flex-initial flex flex-col justify-center whitespace-nowrap text-sm">
                <div className="font-bold text-black flex gap-x-2">
                  <div className="flex-initial">{me.data?.name}</div>
                  {me.data?.isAdmin && (
                    <div className="flex-initial text-xs text-white bg-black rounded flex flex-col justify-center px-1">
                      관리자
                    </div>
                  )}
                </div>
                <span className="text-gray-500 text-sm">
                  {me.data?.username}
                </span>
              </div>
              <div className="flex-initial flex-shrink-0 basis-1 flex flex-col justify-center">
                <div className="flex-initial basis-6 bg-cyan-600" />
              </div>
              <Shortcut
                icon={<Icon.Trade type="PURCHASE" />}
                tooltip="매입 등록"
              />
              <Shortcut
                icon={<Icon.Trade type="SALES" />}
                tooltip="매출 등록"
              />
              <div className="flex-initial flex">
                <div className="flex-initial flex flex-col justify-center">
                  <Button.Default
                    icon={<TbPower />}
                    label="로그아웃"
                    onClick={logout}
                  />
                </div>
              </div>
            </div>
          </header>
          <main className="flex flex-col flex-1 p-4 gap-4 mt-16 min-h-screen">
            <h1 className="flex-initial font-extrabold text-xl select-none m-0">
              {props.title}
            </h1>
            {!props.menu || isMenuAccessible(props.menu) ? (
              <section className="flex flex-col gap-4">
                {props.children}
              </section>
            ) : (
              <div className="flex flex-col justify-center items-center h-48 text-lg text-gray-500 text-center">
                현재 페이지는 열람할 수 없습니다.
                <br />
                관리자에게 문의하세요.
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

interface ShortcutProps {
  icon: ReactNode;
  tooltip: string;
}
function Shortcut(props: ShortcutProps) {
  return (
    <div className="flex-initial basis-6 flex">
      <Tooltip title={props.tooltip}>
        <div
          className={classNames(
            "flex-initial flex flex-col items-center justify-center text-2xl cursor-pointer text-black hover:text-cyan-800"
          )}
        >
          {props.icon}
        </div>
      </Tooltip>
    </div>
  );
}

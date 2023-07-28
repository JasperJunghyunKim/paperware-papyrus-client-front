import { ApiHook, Util } from "@/common";
import { Button, Icon, Logo } from "@/components";
import { AutoComplete, ConfigProvider, Input, Tooltip } from "antd";
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
  TbSearch,
  TbServer2,
  TbServerBolt,
  TbSubtask,
  TbTournament,
  TbTruck,
  TbVector,
  TbVectorTriangle,
} from "react-icons/tb";
import { useStickyBox } from "react-sticky-box";
import Menu, { Menu as MenuDef } from "./Menu";

export interface Props {
  title: string;
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
      },
      { path: null },
      {
        label: "자사 재고 관리",
        icon: <TbServer2 />,
        path: "/stock-inhouse",
      },
      {
        label: "예정 목록",
        icon: <TbServerBolt />,
        path: "/stock-arrival",
      },
      {
        label: "매입처 재고 조회",
        icon: <TbInputSearch />,
        path: "/stock-partner",
      },
      {
        label: "매출 보관량 조회",
        icon: <TbBookUpload />,
        path: "/deposit-sales",
      },
      {
        label: "매입 보관량 조회",
        icon: <TbBookDownload />,
        path: "/deposit-purchase",
      },
      {
        label: "창고 관리",
        icon: <TbBuildingWarehouse />,
        path: "/warehouse",
      },
      { path: null },
      {
        label: "퀵 주문 수신함",
        icon: <TbFilePower />,
        path: "/quick-order-received",
      },
      {
        label: "퀵 주문 발신함",
        icon: <TbFileExport />,
        path: "/quick-order-sended",
      },
      { path: null },
      {
        label: "매출 수주 목록",
        icon: <TbSubtask />,
        path: "/trade-sales",
      },
      {
        label: "매입 주문 목록",
        icon: <TbClipboardList />,
        path: "/trade-order",
      },
      {
        label: "내부 공정 목록",
        icon: <TbFunction />,
        path: "/process",
      },
      { path: null },
      {
        label: "작업 계획 목록",
        icon: <TbTournament />,
        path: "/plan",
      },
      { label: "배송 목록", icon: <TbTruck />, path: "/shipping" },
      { path: null },
      {
        label: "거래처 관리",
        icon: <TbHomeMove />,
        path: "/business-relationship",
        noti: businessRelationshipRequestCount.data?.value,
      },
      {
        label: "도착지 관리",
        icon: <TbMapPin />,
        path: "/location",
      },
      {
        label: "고시가 설정",
        icon: <TbColorSwatch />,
        path: "/official-price",
      },
      {
        label: "매출 할인율 설정",
        icon: <TbDiscount />,
        path: "/discount-sales",
      },
      {
        label: "매입 할인율 설정",
        icon: <TbDiscount2 />,
        path: "/discount-purchase",
      },
      {
        label: "전자세금계산서 목록",
        icon: <TbCash />,
        path: "/tax-invoice",
      },
      { path: null },
      {
        label: "카드 관리",
        icon: <TbCards />,
        path: "/card",
      },
      {
        label: "계좌 관리",
        icon: <TbBuildingBank />,
        path: "/bank-account",
      },
      {
        label: "유가증권 관리",
        icon: <TbReportMoney />,
        path: "/security",
      },
      { path: null },
      {
        label: "수금 관리",
        icon: <TbVector />,
        path: "/collected-history",
      },
      {
        label: "지급 관리",
        icon: <TbVectorTriangle />,
        path: "/paid-history",
      },
      { path: null },
      {
        label: "미수금 잔액",
        icon: <TbCashBanknote />,
        path: "/unpaid-collected",
      },
      {
        label: "미지급 잔액",
        icon: <TbCashBanknote />,
        path: "/unpaid-paid",
      },
    ],
    [businessRelationshipRequestCount.data?.value]
  );

  const user = ApiHook.Auth.useGetMe();

  useEffect(() => {
    if (user.isError) {
      router.replace("/login");
    }
  }, [router, user.isError]);

  const logout = useCallback(async () => {
    if (!(await Util.confirm("로그아웃 하시겠습니까?"))) return;

    localStorage.removeItem("at");
    router.replace("/login");
  }, [router]);

  return (
    <>
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
              <div className="flex-initial basis-10 flex-shrink-0 flex flex-col justify-center">
                <div className="basis-10 rounded-full bg-gray-200 text-center flex flex-col justify-center text-xl">
                  {user.data?.name?.substring(0, 1)}
                </div>
              </div>
              <div className="flex-initial flex flex-col justify-center whitespace-nowrap text-sm">
                <span className="font-bold text-black">{user.data?.name}</span>
                <span className="text-gray-500 text-sm">
                  {user.data?.username}
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
            <section className="flex flex-col gap-4">{props.children}</section>
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

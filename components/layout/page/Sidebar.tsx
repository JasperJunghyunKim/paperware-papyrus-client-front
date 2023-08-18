import classNames from "classnames";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo } from "react";
import Collapsible from "react-collapsible";
import {
  TbBox,
  TbBuilding,
  TbCash,
  TbChartDots,
  TbChevronDown,
  TbClipboardList,
  TbFilePower,
  TbServer2,
  TbSettings2,
  TbSubtask,
  TbTournament,
} from "react-icons/tb";

interface MenuDef {
  icon: ReactNode;
  name: string;
  path: string;
  subs?: { name: string; path: string }[];
}

const menus: MenuDef[] = [
  {
    icon: <TbChartDots />,
    name: "대시보드",
    path: "/",
  },
  {
    icon: <TbSubtask />,
    name: "매출 관리",
    path: "/sales",
  },
  {
    icon: <TbClipboardList />,
    name: "매입 관리",
    path: "/purchase",
  },
  {
    icon: <TbFilePower />,
    name: "퀵 주문",
    path: "/order-request",
    subs: [
      { name: "퀵 주문 수신함", path: "/inbox" },
      { name: "퀵 주문 발신함", path: "/outbox" },
    ],
  },
  {
    icon: <TbServer2 />,
    name: "재고 관리",
    path: "/stock",
    subs: [
      { name: "자사 재고", path: "/inhouse" },
      { name: "거래처 재고", path: "/partner" },
      { name: "매출 보관 재고", path: "/deposit-sales" },
      { name: "매입 보관 재고", path: "/deposit-purchase" },
      { name: "예정 재고", path: "/arrival" },
    ],
  },
  {
    icon: <TbTournament />,
    name: "작업 관리",
    path: "/work",
    subs: [
      { name: "내부 공정 목록", path: "/list" },
      { name: "작업 목록", path: "/create" },
      { name: "배송 목록", path: "/shipping" },
    ],
  },
  {
    icon: <TbCash />,
    name: "회계 관리",
    path: "/accounting",
    subs: [
      { name: "카드 설정", path: "/cards" },
      { name: "계좌 설정", path: "/account" },
      { name: "유가증권 관리", path: "/securities" },
      { name: "수금 관리", path: "/collected" },
      { name: "지급 관리", path: "/paid" },
      { name: "미수금 잔액", path: "/unpaid-collected" },
      { name: "미지급 잔액", path: "/unpaid-paid" },
    ],
  },
  {
    icon: <TbSettings2 />,
    name: "설정",
    path: "/settings",
    subs: [
      { name: "사용자 관리", path: "/users" },
      { name: "거래처 관리", path: "/partners" },
      { name: "창고 관리", path: "/warehouses" },
      { name: "도착지 관리", path: "/destinations" },
    ],
  },
];

export default function Component(props: { className?: string }) {
  const menuList = useMemo(
    () =>
      menus.map((p) => ({
        ...p,
        key: p.path,
        subs: p.subs?.map((s) => ({ ...s, key: `${p.path}${s.path}` })),
      })),
    [menus]
  );

  return (
    <aside className={classNames("bg-white flex flex-col", props.className)}>
      <div className="flex-initial basis-24 flex flex-col justify-center items-center text-2xl font-bold text-gray-700">
        PAPERWARE admin
      </div>
      <div className="flex-initial flex flex-col sticky top-0">
        {menuList.map((item) =>
          item.subs ? (
            <Collapsible
              key={item.key}
              trigger={
                <Menu
                  icon={item.icon}
                  label={item.name}
                  path={item.key}
                  chevron
                />
              }
              transitionTime={50}
              triggerClassName="flex-initial flex flex-col"
              triggerOpenedClassName="flex-initial flex flex-col"
              contentInnerClassName="flex-initial flex flex-col bg-gray-50 border-y border-gray-200"
            >
              {item.subs.map((sub) => (
                <Menu key={sub.key} label={sub.name} path={sub.key} sub link />
              ))}
            </Collapsible>
          ) : (
            <Menu
              key={item.key}
              icon={item.icon}
              label={item.name}
              path={item.key}
              link
            />
          )
        )}
      </div>
    </aside>
  );
}

function Menu(props: {
  label: string;
  path: string;
  icon?: ReactNode;
  sub?: boolean;
  link?: boolean;
  chevron?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const checkActive = (path: string) =>
    props.sub ? pathname === path : pathname.startsWith(path);

  return (
    <div
      className={classNames(
        "flex-initial basis-12 flex items-center gap-x-2 cursor-pointer text-sm select-none",
        {
          "text-gray-500 hover:text-gray-800": !checkActive(props.path),
          "bg-black text-white font-bold":
            !props.sub && checkActive(props.path),
          "text-black font-bold": props.sub && checkActive(props.path),
          "px-4": !props.sub,
          "pl-8 pr-4": props.sub,
        }
      )}
      onClick={() => props.link && router.push(props.path)}
    >
      {props.icon && !props.sub && (
        <div className="flex-initial text-2xl">{props.icon}</div>
      )}
      {props.sub && <div className="flex-initial text-sm">•</div>}
      <div className="flex-1">{props.label}</div>
      {!props.sub && props.chevron && (
        <div className="flex-initial text-sm">
          <TbChevronDown />
        </div>
      )}
    </div>
  );
}

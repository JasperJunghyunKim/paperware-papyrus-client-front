import classnames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { TbHourglassEmpty, TbHourglassLow } from "react-icons/tb";

export type MenuType = "complete" | "wip" | "progress";

export interface MenuProps {
  menus: Menu[];
}

export interface Menu {
  path: string | null;
  label?: string;
  icon?: JSX.Element;
  type?: MenuType;
  noti?: number;
}

export default function Component(props: MenuProps) {
  const router = useRouter();

  const isActive = (path: string | null) => {
    return router.pathname === path;
  };

  return (
    <div className="flex flex-col px-3 gap-y-1 select-none text-sm">
      {props.menus.map((menu, index) =>
        menu.path ? (
          <div
            className={classnames("flex-initial rounded", {
              "bg-cyan-600 hover:bg-cyan-600": isActive(menu.path),
              "text-gray-500 hover:text-gray-800": !isActive(menu.path),
              "text-white hover:text-white": isActive(menu.path),
              "font-bold": isActive(menu.path),
            })}
            key={menu.path}
          >
            <Link href={menu.path} className="block w-full h-full p-2">
              <div className="flex items-center gap-x-2">
                <div className="flex-initial text-2xl flex flex-col justify-center">
                  {menu.icon}
                </div>
                <div className="flex-1">{menu.label}</div>
                {menu.noti && menu.noti > 0 ? (
                  <div
                    className={classnames(
                      "flex-initial basis-6 flex items-center justify-center px-1 py-0.5 rounded-full bg-red-500 text-xs font-bold",
                      {
                        "bg-yellow-400 text-cyan-700": isActive(menu.path),
                        "text-white": !isActive(menu.path),
                      }
                    )}
                  >
                    {menu.noti > 99 ? "99+" : menu.noti}
                  </div>
                ) : null}
                {menu.type === "wip" && (
                  <div className={"flex-initial"}>
                    <TbHourglassEmpty />
                  </div>
                )}
                {menu.type === "progress" && (
                  <div className={"flex-initial text-red-600"}>
                    <TbHourglassLow />
                  </div>
                )}
              </div>
            </Link>
          </div>
        ) : (
          <div className="basis-px bg-slate-200" key={index} />
        )
      )}
    </div>
  );
}

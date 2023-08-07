import { SettingUserResponse } from "@/@shared/api/setting/user.response";
import { User } from "@/@shared/models";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useEffect, useState } from "react";
import { TbLock, TbLockOpen, TbUserCircle } from "react-icons/tb";

export default function Component() {
  const [openUpsert, setOpenUpsert] = useState<
    number | "paid" | "collected" | false
  >(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Setting.User.useGetList({ query: page });

  const me = ApiHook.Auth.useGetMe();

  const [selected, setSelected] = useState<SettingUserResponse[]>([]);
  const only = Util.only(selected);

  useEffect(() => {
    setSelected([]);
  }, [list.data]);

  const apiSetAdmin = ApiHook.Setting.User.useSetAdmin();
  const cmdSetAdmin = async () => {
    if (!only || only.isAdmin) return;
    if (!(await Util.confirm("관리자로 지정하시겠습니까?"))) return;

    await apiSetAdmin.mutateAsync({ userId: only.id });
  };

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
    <Page title="수급 관리" menu={Const.Menu.SETTING_USER}>
      <Toolbar.Container>
        {me.data?.isAdmin && (
          <Toolbar.ButtonPreset.Create
            label="수금 내역 추가"
            onClick={() => setOpenUpsert("collected")}
          />
        )}
        <div className="flex-1" />
        {only && only.isActivated && !only.isAdmin && me.data?.isAdmin && (
          <Toolbar.Button
            icon={<TbLock />}
            label="선택 직원 비활성"
            onClick={cmdSetActivated(false)}
          />
        )}
        {only && !only.isActivated && !only.isAdmin && me.data?.isAdmin && (
          <Toolbar.Button
            icon={<TbLockOpen />}
            label="선택 직원 활성"
            onClick={cmdSetActivated(true)}
          />
        )}
        {only && only.isActivated && me.data?.isAdmin && (
          <Toolbar.Button
            icon={<TbUserCircle />}
            label="관리자 지정"
            onClick={cmdSetAdmin}
          />
        )}
        {only && me.data?.isAdmin && (
          <Toolbar.ButtonPreset.Update
            label="상세 정보"
            onClick={() => only && setOpenUpdate(only.id)}
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
      <Popup.Accounting.Upsert open={openUpsert} onClose={setOpenUpsert} />
    </Page>
  );
}

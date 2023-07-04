import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useCallback, useState } from "react";
import { TbHomeLink, TbHomeMove, TbMail } from "react-icons/tb";

type RecordType = Model.BusinessRelationshipCompact;

export default function Component() {
  const info = ApiHook.Auth.useGetMe();

  const [openUpdate, setOpenUpdate] = useState<number | false>(false);
  const [openReceive, setOpenReceive] = useState(false);
  const [openSend, setOpenSend] = useState(false);
  const [openManaged, setOpenManaged] = useState(false);

  const pendingCount =
    ApiHook.Inhouse.BusinessRelationshipRequest.useGetPendingCount();

  const partnerColumn = Table.Preset.useColumnPartner<RecordType>(
    ["companyRegistrationNumber"],
    {
      title: "거래처명",
      fallback: (record) => record.businessName,
    }
  );
  const [page, setPage] = usePage();
  const list = ApiHook.Inhouse.BusinessRelationship.useGetCompactList({
    query: {
      ...page,
    },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);
  const only = Util.only(selected);

  const apiDeactive = ApiHook.Inhouse.BusinessRelationship.useDeactive();
  const cmdDeactive = useCallback(
    (srcCompanyId: number, dstCompanyId: number) => async () => {
      if (!info.data) return;

      const isSales = srcCompanyId === info.data.companyId;
      if (
        !(await Util.confirm(
          `선택한 거래처와의 ${
            isSales ? "매출" : "매입"
          }관계를 비활성화 하시겠습니까?`
        ))
      ) {
        return;
      }

      await apiDeactive.mutateAsync({
        srcCompanyId: srcCompanyId,
        dstCompanyId: dstCompanyId,
      });
    },
    [apiDeactive, info.data]
  );

  return (
    <Page title="거래처 관리">
      <StatBar.Container>
        <StatBar.Item icon={<TbHomeMove />} label="연결 거래처" value={"-"} />
        <StatBar.Item
          icon={<TbHomeLink />}
          label="비연결 거래처"
          value={"-"}
          iconClassName="text-purple-800"
        />
        <StatBar.Item
          icon={<TbMail />}
          label="발신"
          value={"-"}
          iconClassName="text-orange-800"
        />
        <StatBar.Item
          icon={<TbMail />}
          label="수신"
          value={"-"}
          iconClassName="text-orange-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="거래처 등록"
          onClick={() => setOpenManaged(true)}
        />
        <Toolbar.Button
          icon={<TbMail />}
          label="발신 목록"
          onClick={() => setOpenSend(true)}
        />
        {pendingCount.data && pendingCount.data.value !== 0 && (
          <Toolbar.Button
            icon={<TbMail />}
            label={`수신 목록 (${pendingCount.data?.value ?? 0}건)`}
            type="orange"
            onClick={() => setOpenReceive(true)}
          />
        )}
        <div className="flex-1" />
        {only && (
          <Toolbar.ButtonPreset.Update
            label="상세 정보"
            onClick={() => setOpenUpdate(only.id)}
          />
        )}
      </Toolbar.Container>
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => `${record.id}`}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          ...partnerColumn,
          ...Table.Preset.columnConnection<RecordType>(["managedById"]),
          {
            title: "회사 코드",
            dataIndex: ["invoiceCode"],
            render: (value) => <div className="font-fixed">{value}</div>,
          },
          {
            title: "주소",
            render: (_, record) => Util.formatAddress(record.address),
          },
          {
            title: "거래관계",
            dataIndex: ["flag"],
            render: (value) => (
              <div className="whitespace-pre">
                {[
                  value & (1 << 0) ? "매출" : null,
                  value & (1 << 1) ? "매입" : null,
                ]
                  .filter((p) => !!p)
                  .join(" & ")}
              </div>
            ),
          },
          {
            title: "사업자등록번호",
            dataIndex: ["companyRegistrationNumber"],
          },
          {
            title: "대표자",
            dataIndex: ["representative"],
          },
          {
            title: "대표 전화",
            dataIndex: ["phoneNo"],
            render: (value) => Util.formatPhoneNo(value),
          },
          {
            title: "팩스",
            dataIndex: ["faxNo"],
            render: (value) => Util.formatPhoneNo(value),
          },
        ]}
      />
      <Popup.Company.BusinessRelationshipReceived
        open={openReceive}
        onClose={setOpenReceive}
      />
      <Popup.Company.BusinessRelationshipSended
        open={openSend}
        onClose={setOpenSend}
      />
      <Popup.Company.Register open={openManaged} onClose={setOpenManaged} />
      <Popup.Company.Update open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}

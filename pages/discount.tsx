import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useCallback, useState } from "react";
import { TbDiscount, TbHomeLink, TbHomeMove, TbMail } from "react-icons/tb";

type RecordType = Model.BusinessRelationshipCompact;

export default function Component() {
  const info = ApiHook.Auth.useGetMe();

  const [page, setPage] = usePage();
  const list = ApiHook.Inhouse.BusinessRelationship.useGetCompactList({
    query: {
      ...page,
    },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);
  const only = Util.only(selected);

  return (
    <Page title="할인율 관리">
      <StatBar.Container>
        <StatBar.Item icon={<TbDiscount />} label="할인율" value={"-"} />
      </StatBar.Container>
      <Toolbar.Container>
        <div className="flex-1" />
        {only && (
          <Toolbar.ButtonPreset.Create label="할인율 등록" onClick={() => {}} />
        )}
      </Toolbar.Container>
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => `${record.id}`}
        selection="single"
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "거래처명",
            dataIndex: ["businessName"],
          },
          ...Table.Preset.columnConnection<RecordType>(["managedById"]),
          {
            title: "송장 코드",
            dataIndex: ["invoiceCode"],
            render: (value) => <div className="font-fixed">{value}</div>,
          },
          {
            title: "주소",
            dataIndex: ["address"],
            render: (value) => Util.formatAddress(value),
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
          {
            title: "이메일",
            dataIndex: ["email"],
          },
        ]}
      />
    </Page>
  );
}

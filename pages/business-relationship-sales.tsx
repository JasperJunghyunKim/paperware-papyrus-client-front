import { Api, Util } from "@/common";
import { Record } from "@/common/protocol";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useState } from "react";
import { TbHomeLink, TbHomeMove, TbMail } from "react-icons/tb";

type RecordType = Record.BusinessRelationship;

export default function Component() {
  const [openReceive, setOpenReceive] = useState(false);
  const [openManaged, setOpenManaged] = useState(false);
  const [openVirtual, setOpenVirtual] = useState(false);

  const stats =
    Api.Internal.BusinessRelationship.useGetBusinessRelationshipSalesStats();
  const requestStats =
    Api.External.BusinessRelationship.useGetBusinessRelationshipRequestStats();
  const [data, page, setPage] =
    Api.Internal.BusinessRelationship.useGetBusinessRelationshipSalesList({});
  const [selected, setSelected] = useState<RecordType[]>([]);

  return (
    <Page title="매출처 관리">
      <StatBar.Container>
        <StatBar.Item
          icon={<TbHomeMove />}
          label="관리 매출처"
          value={Util.comma(stats.data?.count ?? 0)}
        />
        <StatBar.Item
          icon={<TbHomeLink />}
          label="가상 매출처"
          value={Util.comma(stats.data?.virtualCount ?? 0)}
          iconClassName="text-purple-800"
        />
        <StatBar.Item
          icon={<TbMail />}
          label="매출처 등록 요청"
          value={Util.comma(requestStats.data?.pendingCount ?? 0)}
          iconClassName="text-orange-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        {requestStats.data && requestStats.data.pendingCount !== 0 && (
          <Toolbar.Button
            icon={<TbMail />}
            label={`매출처 등록 요청 목록 (${
              requestStats.data?.pendingCount ?? 0
            }건)`}
            type="orange"
            onClick={() => setOpenReceive(true)}
          />
        )}
        <Toolbar.ButtonPreset.Create
          label="관리 매출처 등록"
          onClick={() => setOpenManaged(true)}
        />
        <Toolbar.Button
          icon={<TbHomeLink />}
          label="가상 매출처 등록"
          onClick={() => setOpenVirtual(true)}
        />
      </Toolbar.Container>
      <Table.Default<RecordType>
        data={data.data}
        page={page}
        setPage={setPage}
        keySelector={(record) =>
          `${record.srcCompany.id}-${record.dstCompany.id}`
        }
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "매출처 이름",
            dataIndex: ["dstCompany", "businessName"],
          },
          {
            title: "대표 전화",
            dataIndex: ["dstCompany", "phoneNo"],
          },
          {
            title: "팩스",
            dataIndex: ["dstCompany", "faxNo"],
          },
          {
            title: "이메일",
            dataIndex: ["dstCompany", "email"],
          },
          {
            title: "가상 매출처 여부",
            dataIndex: ["dstCompany", "managedById"],
            render: (value) =>
              value && (
                <div className="flex flex-row gap-2 text-purple-800">
                  <div className="flex flex-col justify-center">
                    <TbHomeLink className="text-lg" />
                  </div>
                  <div className="flex flex-col justify-center">
                    가상 매출처
                  </div>
                </div>
              ),
          },
        ]}
      />
      <Popup.Company.BusinessRelationshipReceived
        open={openReceive}
        onClose={setOpenReceive}
      />
      <Popup.Company.RegisterSales
        open={openManaged}
        onClose={setOpenManaged}
      />
      <Popup.VirtualCompany.RegisterSales
        open={openVirtual}
        onClose={setOpenVirtual}
      />
    </Page>
  );
}

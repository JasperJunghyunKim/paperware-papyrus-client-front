import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { Popup, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useState } from "react";
import { TbHome2, TbHomeLink } from "react-icons/tb";

type RecordType = Record.BusinessRelationship;

export default function Component() {
  const info = ApiHook.Auth.useGetMe();

  const [openRequest, setOpenRequest] = useState(false);
  const [openVirtual, setOpenVirtual] = useState(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Inhouse.BusinessRelationship.useGetList({
    query: {
      ...page,
      dstCompanyId: info.data?.companyId,
    },
  });
  const [selected, setSelected] = useState<RecordType[]>([]);

  return (
    <Page title="매입처 관리">
      <StatBar.Container>
        <StatBar.Item icon={<TbHome2 />} label="관리 매입처" value={"-"} />
        <StatBar.Item
          icon={<TbHomeLink />}
          label="가상 매입처"
          value={"-"}
          iconClassName="text-purple-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="관리 매입처 등록"
          onClick={() => setOpenRequest(true)}
        />
        <Toolbar.Button
          icon={<TbHomeLink />}
          label="가상 매입처 등록"
          onClick={() => setOpenVirtual(true)}
        />
      </Toolbar.Container>
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) =>
          `${record.srcCompany.id}-${record.dstCompany.id}`
        }
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "매입처 이름",
            dataIndex: ["srcCompany", "businessName"],
          },
          {
            title: "사업자등록번호",
            dataIndex: ["srcCompany", "companyRegistrationNumber"],
          },
          {
            title: "대표자",
            dataIndex: ["srcCompany", "representative"],
          },
          {
            title: "주소",
            dataIndex: ["srcCompany", "address"],
            render: (value) => Util.formatAddress(value),
          },
          {
            title: "대표 전화",
            dataIndex: ["srcCompany", "phoneNo"],
            render: (value) => Util.formatPhoneNo(value),
          },
          {
            title: "팩스",
            dataIndex: ["srcCompany", "faxNo"],
            render: (value) => Util.formatPhoneNo(value),
          },
          {
            title: "이메일",
            dataIndex: ["srcCompany", "email"],
          },
          {
            title: "가상 매입처 여부",
            dataIndex: ["srcCompany", "managedById"],
            render: (value) =>
              value && (
                <div className="flex flex-row gap-2 text-purple-800">
                  <div className="flex flex-col justify-center">
                    <TbHomeLink className="text-lg" />
                  </div>
                  <div className="flex flex-col justify-center">
                    가상 매입처
                  </div>
                </div>
              ),
          },
        ]}
      />
      <Popup.Company.BusinessRelationshipRequest
        open={openRequest}
        onClose={setOpenRequest}
      />
      <Popup.VirtualCompany.RegisterPurchase
        open={openVirtual}
        onClose={setOpenVirtual}
      />
    </Page>
  );
}

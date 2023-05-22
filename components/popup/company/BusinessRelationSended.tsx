import { Api, Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Record } from "@/common/protocol";
import { Popup, Table, Toolbar } from "@/components";
import { useCallback, useEffect, useState } from "react";

export interface Props {
  open: boolean;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [page, setPage] = usePage();
  const list = ApiHook.Inhouse.BusinessRelationshipRequest.useGetSendedList({
    query: page,
  });

  return (
    <Popup.Template.Property
      title="거래처 등록 발신 목록"
      width={"800px"}
      height="500px"
      {...props}
      open={!!props.open}
    >
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="flex-1">
          <Table.Default<Model.BusinessRelationshipRequest>
            data={list.data}
            page={page}
            setPage={setPage}
            keySelector={(record) =>
              `${record.srcCompany.id}-${record.dstCompany.id}`
            }
            selection="none"
            columns={[
              {
                title: "거래처명",
                dataIndex: ["dstCompany", "businessName"],
              },
              {
                title: "사업자등록번호",
                dataIndex: ["dstCompany", "companyRegistrationNumber"],
              },
              {
                title: "대표자명",
                dataIndex: ["dstCompany", "ceoName"],
              },
              {
                title: "대표 전화",
                dataIndex: ["dstCompany", "phoneNo"],
                render: (value) => Util.formatPhoneNo(value),
              },
              {
                title: "팩스",
                dataIndex: ["dstCompany", "faxNo"],
                render: (value) => Util.formatPhoneNo(value),
              },
              {
                title: "이메일",
                dataIndex: ["dstCompany", "email"],
              },
              {
                title: "거래 관계",
                render: (_value, record) => (
                  <div>
                    {[
                      record.isSales ? "매출" : null,
                      record.isPurchase ? "매입" : null,
                    ]
                      .filter((p) => !!p)
                      .join(" & ")}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </Popup.Template.Property>
  );
}

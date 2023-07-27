import { Api, Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, Table, Toolbar } from "@/components";
import { useCallback, useEffect, useState } from "react";

export interface Props {
  open: boolean;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [page, setPage] = usePage();
  const list = ApiHook.Inhouse.BusinessRelationshipRequest.useGetList({
    query: page,
  });
  const [selected, setSelected] = useState<Model.BusinessRelationshipRequest[]>(
    []
  );
  const only = Util.only(selected);

  const apiAccept = ApiHook.Inhouse.BusinessRelationshipRequest.useAccept();
  const cmdAccept = useCallback(
    async (request: Api.BusinessRelationshipRequestAcceptRequest) => {
      await apiAccept.mutateAsync({
        data: { companyId: request.companyId },
      });

      setSelected([]);
    },
    [apiAccept]
  );

  const apiReject = ApiHook.Inhouse.BusinessRelationshipRequest.useReject();
  const cmdReject = useCallback(
    async (request: Api.BusinessRelationshipRequestRejectRequest) => {
      await apiReject.mutateAsync({
        data: {
          companyId: request.companyId,
        },
      });

      setSelected([]);
    },
    [apiReject]
  );

  useEffect(() => {
    if (!props.open) {
      setSelected([]);
    }
  }, [props.open]);

  return (
    <Popup.Template.Property
      title="거래처 등록 수신 목록"
      width={"800px"}
      height="500px"
      {...props}
      open={!!props.open}
    >
      <div className="flex-1 p-4 flex flex-col gap-4">
        <div className="flex-initial flex flex-row gap-2 justify-between">
          <Toolbar.Container></Toolbar.Container>
          <Toolbar.Container>
            <Toolbar.ButtonPreset.Delete
              label="거절"
              onClick={async () => {
                only && (await cmdReject({ companyId: only.srcCompany.id }));
              }}
              disabled={!only}
            />
            <Toolbar.ButtonPreset.Continue
              label="거래처 등록 수락"
              onClick={async () => {
                only && (await cmdAccept({ companyId: only.srcCompany.id }));
              }}
              disabled={!only}
            />
          </Toolbar.Container>
        </div>
        <div className="flex-1">
          <Table.Default<Model.BusinessRelationshipRequest>
            data={list.data}
            page={page}
            setPage={setPage}
            keySelector={(record) =>
              `${record.srcCompany.id}-${record.dstCompany.id}`
            }
            selected={selected}
            onSelectedChange={setSelected}
            selection="single"
            columns={[
              {
                title: "거래처명",
                dataIndex: ["srcCompany", "businessName"],
              },
              {
                title: "사업자등록번호",
                dataIndex: ["srcCompany", "companyRegistrationNumber"],
              },
              {
                title: "대표자명",
                dataIndex: ["srcCompany", "ceoName"],
              },
              {
                title: "대표 전화",
                dataIndex: ["srcCompany", "phoneNo"],
              },
              {
                title: "팩스",
                dataIndex: ["srcCompany", "faxNo"],
              },
              {
                title: "이메일",
                dataIndex: ["srcCompany", "email"],
              },
              {
                title: "희망 거래 관계",
                render: (_value, record) => (
                  <div>
                    {[
                      record.isSales ? "매입" : null,
                      record.isPurchase ? "매출" : null,
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

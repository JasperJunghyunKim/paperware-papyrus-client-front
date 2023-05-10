import { Api } from "@/@shared";
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
  const list = ApiHook.Inhouse.BusinessRelationshipRequest.useGetList({
    query: page,
  });
  const [selected, setSelected] = useState<
    Record.BusinessRelationshipRequest[]
  >([]);
  const only = Util.only(selected);

  const apiAccept = ApiHook.Inhouse.BusinessRelationshipRequest.useAccept();
  const cmdAccept = useCallback(
    async (request: Api.BusinessRelationshipRequestAcceptRequest) => {
      await apiAccept.mutateAsync({
        data: {
          companyId: request.companyId,
        },
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
      title="매출처 등록 요청 목록"
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
              label="매출처 등록 수락"
              onClick={async () => {
                only && (await cmdAccept({ companyId: only.srcCompany.id }));
              }}
              disabled={!only}
            />
          </Toolbar.Container>
        </div>
        <div className="flex-1">
          <Table.Default<Record.BusinessRelationshipRequest>
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
                title: "상호명",
                dataIndex: ["srcCompany", "businessName"],
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
            ]}
          />
        </div>
      </div>
    </Popup.Template.Property>
  );
}

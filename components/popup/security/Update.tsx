import { Api } from "@/@shared";
import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect, useState } from "react";
import FormUpdate from "./common/FormUpdate";

export interface Props {
  open: number | false;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<Api.SecurityUpdateRequest | Api.SecurityUpdateStatusRequest>();
  const [edit, setEdit] = useState(false);
  const [statusEdit, setStatusEdit] = useState(false);

  const apiSecurity = ApiHook.Inhouse.Security.useSecurityUpdate();
  const apiSecurityStatus = ApiHook.Inhouse.Security.useSecurityStatusUpdate();

  const cmd = useCallback(
    async (values: Api.SecurityUpdateRequest | Api.SecurityUpdateStatusRequest) => {
      if (!props.open) {
        return;
      }

      if (edit) {
        apiSecurity.mutateAsync({ id: props.open, data: values as Api.SecurityUpdateRequest });
        setEdit(false);
      } else {
        apiSecurityStatus.mutateAsync({
          id: props.open,
          data: {
            memo: values.memo,
            securityStatus: values.securityStatus
          } as Api.SecurityUpdateStatusRequest,
        })
        setStatusEdit(false)
      }

      props.onClose(false);
    },
    [apiSecurity, apiSecurityStatus, props, edit]
  );

  const res = ApiHook.Inhouse.Security.useGetSecurityItem({ id: props.open });

  useEffect(() => {
    if (!res.data || edit) {
      return;
    }

    form.setFieldsValue({
      securityId: res.data.securityId,
      securityType: res.data.securityType,
      securitySerial: res.data.securitySerial,
      securityAmount: res.data.securityAmount,
      securityStatus: res.data.securityStatus,
      drawedStatus: res.data.drawedStatus,
      drawedDate: res.data.drawedDate,
      drawedBank: res.data.drawedBank,
      drawedBankBranch: res.data.drawedBankBranch,
      drawedRegion: res.data.drawedRegion,
      drawer: res.data.drawer,
      maturedDate: res.data.maturedDate,
      payingBank: res.data.payingBank,
      payingBankBranch: res.data.payingBankBranch,
      payer: res.data.payer,
      memo: res.data.memo,
    } as Api.SecurityUpdateRequest);
  }, [form, res, edit]);

  return (
    <Popup.Template.Property title={`유가증권 상세`} {...props} open={!!props.open}>
      <div className="flex-1 p-4">
        <FormUpdate
          form={form}
          edit={edit}
          statusEdit={statusEdit}
          onFinish={async (values) => await cmd(values)}
          onEditChange={(edit) => setEdit(edit)}
          onStatusEditChange={(edit) => setStatusEdit(edit)}
        />
      </div>
    </Popup.Template.Property>
  );
}

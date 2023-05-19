import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect, useState } from "react";
import FormUpdate from "./common/FormUpdate";
import { Api, Model } from "@/@shared";
import { OfficialPriceUpdateRequest } from "@/@shared/api/inhouse/official-price.request";

type RecordType = Model.OfficialPriceCondition;
type DataType = OfficialPriceUpdateRequest;

export interface Props {
  open: number | false;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<DataType>();
  const [edit, setEdit] = useState(false);

  const api = ApiHook.Inhouse.OfficialPrice.useUpdate();
  const cmd = useCallback(
    async (values: DataType) => {
      if (!props.open) {
        return;
      }

      await api.mutateAsync({ id: props.open, data: values });
      setEdit(false);
    },
    [api, props]
  );

  const data = ApiHook.Inhouse.OfficialPrice.useGetItem({
    id: props.open ? props.open : null,
  });
  useEffect(() => {
    if (!data.data || edit) {
      return;
    }

    form.setFieldsValue({
      productId: data.data.product.id,
      grammage: data.data.grammage,
      sizeX: data.data.sizeX,
      sizeY: data.data.sizeY,
      paperColorGroupId: data.data.paperColorGroup?.id,
      paperColorId: data.data.paperColor?.id,
      paperPatternId: data.data.paperPattern?.id,
      paperCertId: data.data.paperCert?.id,
      retailPrice: data.data.retailPrice,
      wholesalePrice: data.data.wholesalesPrice,
    } as any);
  }, [form, data.data, edit]);
  return (
    <Popup.Template.Property title="고시가 상세" {...props} open={!!props.open}>
      <div className="flex-1 p-4">
        <FormUpdate
          form={form}
          edit={edit}
          onFinish={async (values) => await cmd(values)}
          onEditChange={(edit) => setEdit(edit)}
        />
      </div>
    </Popup.Template.Property>
  );
}

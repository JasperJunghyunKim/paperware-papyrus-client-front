import { ApiHook } from "@/common";
import { Popup } from "@/components";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect, useState } from "react";
import FormUpdate from "./common/FormUpdate";
import { Api, Model } from "@/@shared";
import { OfficialPriceUpdateRequest } from "@/@shared/api/inhouse/official-price.request";
import DiscountRateCondition from "@/@shared/models/discount-rate-condition";
import {
  DiscountRateCreateRequest,
  DiscountRateUpdateRequest,
} from "@/@shared/api/inhouse/discount-rate.request";

type RecordType = DiscountRateCondition;
type DataType = DiscountRateUpdateRequest;

export interface Props {
  type: "PURCHASE" | "SALES";
  open: number | false;
  onClose: (unit: false) => void;
}

export default function Component(props: Props) {
  const [form] = useForm<DataType>();
  const [edit, setEdit] = useState(false);

  const api = ApiHook.Inhouse.Discount.useUpdate();
  const cmd = useCallback(
    async (values: DataType) => {
      if (!props.open) {
        return;
      }

      await api.mutateAsync({
        id: props.open,
        data: {
          ...values,
          discountRateType: props.type,
        },
      });
      setEdit(false);
    },
    [api, props]
  );

  const data = ApiHook.Inhouse.Discount.useGetItem({
    id: props.open ? props.open : null,
    discountRateType: props.type,
  });

  useEffect(() => {
    if (!data.data || edit) {
      return;
    }

    form.setFieldsValue({
      paperDomainId: data.data.paperDomain?.id,
      paperGroupId: data.data.paperGroup?.id,
      paperTypeId: data.data.paperType?.id,
      manufacturerId: data.data.manufacturer?.id,
      packagingType: data.data.packagingType,
      grammage: data.data.grammage,
      sizeX: data.data.sizeX,
      sizeY: data.data.sizeY,
      paperColorGroupId: data.data.paperColorGroup?.id,
      paperColorId: data.data.paperColor?.id,
      paperPatternId: data.data.paperPattern?.id,
      paperCertId: data.data.paperCert?.id,
      basicDiscountRate: data.data.basicDiscountRate,
      specialDiscountRate: data.data.specialDiscountRate,
    } as DiscountRateCreateRequest | DiscountRateUpdateRequest);
  }, [form, data.data, edit]);

  useEffect(() => {
    if (!props.open) {
      return;
    }

    data.refetch();
    setEdit(false);
  }, [props.open]);

  return (
    <Popup.Template.Property title="할인율 상세" {...props} open={!!props.open}>
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

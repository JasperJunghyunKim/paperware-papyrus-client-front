import { CartCreateRequest } from "@/@shared/api/trade/cart.request";
import {
  Company,
  Packaging,
  PaperCert,
  PaperColor,
  PaperColorGroup,
  PaperPattern,
  Product,
  Warehouse,
} from "@/@shared/models";
import { ApiHook, Util } from "@/common";
import * as R from "@/common/rules";
import { Button, Popup } from "@/components";
import { Quantity } from "@/components/formControl";
import { Form, Input } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useCallback, useEffect } from "react";

export type PopupCartCreateOpenType =
  | false
  | {
      companyId: number;
      warehouseId: number | null;
      planId: number | null;
      product: Product;
      packaging: Packaging;
      grammage: number;
      sizeX: number;
      sizeY: number;
      paperColorGroup: PaperColorGroup | null;
      paperColor: PaperColor | null;
      paperPattern: PaperPattern | null;
      paperCert: PaperCert | null;
    };
interface PopupCreateProps {
  type: "SALES" | "PURCHASE";
  open: PopupCartCreateOpenType;
  onClose: (unit: false) => void;
}
export default function Component(props: PopupCreateProps) {
  const [form] = useForm<CartCreateRequest>();

  const apiCreate = ApiHook.Cart.useCreate();
  const cmdCreate = useCallback(async () => {
    if (!props.open) return;
    if (!(await Util.confirm("장바구니에 추가하시겠습니까?"))) return;
    const data = await form.validateFields();

    await apiCreate.mutateAsync({
      data: {
        type: props.type,
        companyId: props.open.companyId,
        warehouseId: props.open.warehouseId,
        planId: props.open.planId,
        productId: props.open.product.id,
        packagingId: props.open.packaging.id,
        grammage: props.open.grammage,
        sizeX: props.open.sizeX,
        sizeY: props.open.sizeY,
        paperColorGroupId: props.open.paperColorGroup?.id,
        paperColorId: props.open.paperColor?.id,
        paperPatternId: props.open.paperPattern?.id,
        paperCertId: props.open.paperCert?.id,
        quantity: data.quantity,
        memo: data.memo,
      },
    });
    props.onClose(false);
  }, [apiCreate, form, props]);

  useEffect(() => form.resetFields(), [form, props.open]);

  return (
    <Popup.Template.Property
      {...props}
      open={!!props.open}
      title="장바구니 추가"
      height="auto"
    >
      <Form
        layout="vertical"
        form={form}
        rootClassName="p-4 flex flex-col w-full"
      >
        {props.open && (
          <Form.Item label="수량" name="quantity" rules={[R.required()]}>
            <Quantity
              spec={{
                grammage: props.open.grammage,
                packaging: props.open.packaging,
                sizeX: props.open.sizeX,
                sizeY: props.open.sizeY,
              }}
            />
          </Form.Item>
        )}
        <Form.Item label="요청사항" name="memo" rules={[R.required()]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <div className="flex-initial flex gap-x-2 mt-4">
          <Button.Default
            label="장바구니 추가"
            onClick={cmdCreate}
            type="primary"
          />
        </div>
      </Form>
    </Popup.Template.Property>
  );
}

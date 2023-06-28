import { TbCircleCheck, TbPencil } from "react-icons/tb";
import { Button, Popup } from "..";
import { Model } from "@/@shared";
import { useState } from "react";

export interface BaseProps {
  label: string;
  hidden?: boolean;
  disabled?: boolean;
}

export interface BasePropsWithOnClick extends BaseProps {
  onClick: () => void;
}

export function Submit(props: BaseProps) {
  return (
    <Button.Default
      icon={<TbCircleCheck />}
      label={props.label}
      type="primary"
      hidden={props.hidden}
      disabled={props.disabled}
      submit
    />
  );
}

export function Edit(props: BasePropsWithOnClick) {
  return (
    <Button.Default
      icon={<TbPencil />}
      label={props.label}
      type="default"
      onClick={props.onClick}
      hidden={props.hidden}
    />
  );
}

interface SelectStockGroupInhouseProps {
  onSelect: (stockGroup: Model.StockGroup) => void;
  rootClassName?: string;
}
export function SelectStockGroupInhouse(props: SelectStockGroupInhouseProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button.Default
        icon={<TbPencil />}
        label="재고 선택"
        type="primary"
        rootClassName={props.rootClassName}
        onClick={() => {
          setOpen(true);
        }}
      />
      <Popup.StockFinder.Inhouse
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(stockGroup) => {
          props.onSelect(stockGroup);
          setOpen(false);
        }}
      />
    </>
  );
}

interface SelectPartnerStockGroupProps {
  companyId: number | null;
  onSelect: (stockGroup: Model.StockGroup) => void;
  rootClassName?: string;
}
export function SelectPartnerStockGroup(props: SelectPartnerStockGroupProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button.Default
        icon={<TbPencil />}
        label="매입처 재고 선택"
        type="primary"
        rootClassName={props.rootClassName}
        onClick={() => {
          setOpen(true);
        }}
      />
      <Popup.StockFinder.Partner
        open={open && props.companyId ? props.companyId : false}
        onClose={() => setOpen(false)}
        onSelect={(stockGroup) => {
          props.onSelect(stockGroup);
          setOpen(false);
        }}
      />
    </>
  );
}

interface SelectDepositProps {
  option: {
    type: "SALES" | "PURCHASE";
    companyRegistrationNumber: string;
  };
  onSelect: (stockGroup: Model.Deposit) => void;
  rootClassName?: string;
}
export function SelectDeposit(props: SelectDepositProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button.Default
        icon={<TbPencil />}
        label="보관 재고 선택"
        type="primary"
        rootClassName={props.rootClassName}
        onClick={() => {
          setOpen(true);
        }}
      />
      <Popup.DepositFinder.default
        open={open && props.option}
        onClose={() => setOpen(false)}
        onSelect={(deposit: Model.Deposit) => {
          props.onSelect(deposit);
          setOpen(false);
        }}
      />
    </>
  );
}

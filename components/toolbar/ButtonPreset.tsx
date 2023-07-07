import {
  TbCircleCheck,
  TbForbid,
  TbHandStop,
  TbList,
  TbPencil,
  TbPlus,
  TbPrinter,
  TbSearch,
  TbSend,
} from "react-icons/tb";
import { Button } from ".";
import { Util } from "@/common";

interface BaseProps {
  label?: string;
  onClick?: Util.PromiseOrFn;
  disabled?: boolean;
  tooltip?: string;
}

export function Create(props: BaseProps) {
  return (
    <Button
      icon={<TbPlus />}
      label={props.label}
      type="default"
      onClick={props.onClick}
      disabled={props.disabled}
      tooltip={props.tooltip}
    />
  );
}

export function Print(props: BaseProps) {
  return (
    <Button
      icon={<TbPrinter />}
      label={props.label}
      type="default"
      onClick={props.onClick}
      disabled={props.disabled}
      tooltip={props.tooltip}
    />
  );
}

export function Continue(props: BaseProps) {
  return (
    <Button
      icon={<TbCircleCheck />}
      label={props.label}
      type="primary"
      onClick={props.onClick}
      disabled={props.disabled}
      tooltip={props.tooltip}
    />
  );
}

export function Delete(props: BaseProps) {
  return (
    <Button
      icon={<TbForbid />}
      label={props.label}
      type="danger"
      onClick={props.onClick}
      disabled={props.disabled}
      tooltip={props.tooltip}
    />
  );
}

export function Reject(props: BaseProps) {
  return (
    <Button
      icon={<TbHandStop />}
      label={props.label}
      type="danger"
      onClick={props.onClick}
      disabled={props.disabled}
      tooltip={props.tooltip}
    />
  );
}

export function Update(props: BaseProps) {
  return (
    <Button
      icon={<TbPencil />}
      label={props.label}
      onClick={props.onClick}
      disabled={props.disabled}
      tooltip={props.tooltip}
    />
  );
}

export function Search(props: BaseProps) {
  return (
    <Button
      icon={<TbSearch />}
      label={props.label}
      type="default"
      onClick={props.onClick}
      disabled={props.disabled}
      tooltip={props.tooltip}
    />
  );
}

export function List(props: BaseProps) {
  return (
    <Button
      icon={<TbList />}
      label={props.label}
      type="default"
      onClick={props.onClick}
      disabled={props.disabled}
      tooltip={props.tooltip}
    />
  );
}

export function Send(props: BaseProps) {
  return (
    <Button
      icon={<TbSend />}
      label={props.label}
      type="secondary"
      onClick={props.onClick}
      disabled={props.disabled}
      tooltip={props.tooltip}
    />
  );
}

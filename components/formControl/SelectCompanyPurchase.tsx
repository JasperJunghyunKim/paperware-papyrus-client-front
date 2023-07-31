import { Model } from "@/@shared";
import { ApiHook, Util } from "@/common";
import { Record } from "@/common/protocol";
import { Select } from "antd";
import classNames from "classnames";
import { useMemo } from "react";

type RecordType = Record.BusinessRelationship;

interface Props {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  virtual?: boolean;
}

export default function Component(props: Props) {
  const me = ApiHook.Auth.useGetMe();

  const partners = ApiHook.Inhouse.Partner.useGetList({
    query: {},
  });

  const list = ApiHook.Inhouse.BusinessRelationship.useGetList({
    query: {
      dstCompanyId: me.data?.companyId,
    },
  });

  const options = useMemo(() => {
    return list.data?.items
      .filter(
        (x) =>
          props.virtual === undefined ||
          !!x.srcCompany.managedById === props.virtual
      )
      .map((x) => ({
        label: (
          <Item
            item={x}
            partner={partners.data?.items.find(
              (p) =>
                p.companyRegistrationNumber ===
                x.srcCompany.companyRegistrationNumber
            )}
          />
        ),
        text: `${x.srcCompany.businessName} ${
          partners.data?.items.find(
            (p) =>
              p.companyRegistrationNumber ===
              x.srcCompany.companyRegistrationNumber
          )?.partnerNickName
        }
          ${x.srcCompany.phoneNo}`,
        value: x.srcCompany.id,
      }));
  }, [list.data?.items, props.virtual, partners.data]);

  return (
    <div className="flex flex-col gap-y-1">
      <Select
        value={props.value}
        onChange={props.onChange}
        options={options}
        filterOption={(input, option) => {
          if (!option) {
            return false;
          }
          return option.text.toLowerCase().includes(input.toLowerCase());
        }}
        showSearch
        allowClear
        placeholder="매입처 선택"
        disabled={props.disabled}
      />
    </div>
  );
}

interface ItemProps {
  item: RecordType;
  partner: Model.Partner | undefined;
}

function Item(props: ItemProps) {
  const x = props.item;
  return (
    <div className="flex font-fixed gap-x-4">
      <div className="flex-initial whitespace-pre">
        {props.partner?.partnerNickName ?? x.dstCompany.businessName}
      </div>
      <div className="flex-1 text-gray-400 text-right font-fixed">
        {x.srcCompany.phoneNo}
      </div>
      <div
        className={classNames("flex-basis whitespace-pre font-fixed", {
          "text-gray-400": x.srcCompany.managedById === null,
          "text-purple-600": x.srcCompany.managedById !== null,
        })}
      >
        {x.srcCompany.managedById !== null ? "비연결" : "연결"}
      </div>
    </div>
  );
}

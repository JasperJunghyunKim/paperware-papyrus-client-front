import { ApiHook, Util } from "@/common";
import { Input, InputNumber, Select, Switch } from "antd";
import classNames from "classnames";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TbSearch } from "react-icons/tb";
import { match } from "ts-pattern";
import { Icon } from "..";
import { DatePicker } from "../formControl";
import { Model } from "@/@shared";

interface Props {
  items: SearchItem[];
  value: { [key: string]: string };
  onSearch: (value: { [key: string]: string }) => void;
}
interface SearchItem {
  field: string;
  label: string;
  type:
    | "text"
    | "number"
    | "range"
    | "select-warehouse"
    | "select-packaging"
    | "select-papertype"
    | "select-manufacturer"
    | "select-company-purchase"
    | "select-company-sales"
    | "select-company-registration-number"
    | "select-location"
    | "select-order-type"
    | "select-order-status"
    | "select-order-process-status"
    | "select-order-release-status"
    | "select-order-shipping-status"
    | "select-book-close-method"
    | "select-converting-status"
    | "select-guillotine-status"
    | "select-release-status"
    | "select-arrived"
    | "select-shipping-type"
    | "select-user"
    | "select-account-subject"
    | "select-account-method"
    | "date-range"
    | "check";
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  trade?: "SALES" | "PURCHASE";
  virtual?: boolean;
  accountedType?: "COLLECTED" | "PAID";
}

export default function Component(props: Props) {
  const [data, setData] = useState<any>(props.value);

  const getFieldValue = useCallback(
    (field: string) => {
      return {
        field: field,
        label: props.items.find((item) => item.field === field)?.label ?? "",
        value: data[field] ?? null,
      };
    },
    [props.items, data]
  );

  const setFieldValue = useCallback(
    (field: string) => (value: string | null) => {
      const prev = _.cloneDeep(data);
      if (!Util.emptyStringToUndefined(value)) {
        delete prev[field];
      } else {
        prev[field] = value;
      }
      setData(prev);
    },
    [data]
  );

  const search = useCallback(() => {
    props.onSearch(data);
  }, [data, props.onSearch]);

  useEffect(() => {
    setData(props.value);
  }, [props.value]);

  const valueFieldCount = useMemo(() => {
    return Object.keys(props.value).length;
  }, [props.value]);

  return (
    <div
      className={classNames(
        "flex-initial basis-8 flex bg-white p-2 gap-x-4 rounded outline",
        {
          "outline-gray-200 outline-1": valueFieldCount === 0,
          "outline-blue-800 outline-2": valueFieldCount > 0,
        }
      )}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          search();
        }
      }}
    >
      <div className="flex-1 flex flex-wrap gap-4 p-2">
        {props.items.map((item) => (
          <div key={item.field} className="flex-initial flex ">
            {match(item.type)
              .with("text", () => (
                <Text
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("number", () => (
                <Number
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                  min={item.min ?? 0}
                  max={item.max ?? 999999999}
                />
              ))
              .with("range", () => (
                <Range
                  {...getFieldValue(item.field)}
                  minValue={
                    data[
                      `min${
                        item.field.charAt(0).toUpperCase() + item.field.slice(1)
                      }`
                    ] ?? null
                  }
                  maxValue={
                    data[
                      `max${
                        item.field.charAt(0).toUpperCase() + item.field.slice(1)
                      }`
                    ] ?? null
                  }
                  onMinChange={setFieldValue(
                    `min${
                      item.field.charAt(0).toUpperCase() + item.field.slice(1)
                    }`
                  )}
                  onMaxChange={setFieldValue(
                    `max${
                      item.field.charAt(0).toUpperCase() + item.field.slice(1)
                    }`
                  )}
                  min={item.min ?? 0}
                  max={item.max ?? 999999999}
                />
              ))
              .with("date-range", () => (
                <DateRange
                  {...getFieldValue(item.field)}
                  minValue={
                    data[
                      `min${
                        item.field.charAt(0).toUpperCase() + item.field.slice(1)
                      }`
                    ] ?? null
                  }
                  maxValue={
                    data[
                      `max${
                        item.field.charAt(0).toUpperCase() + item.field.slice(1)
                      }`
                    ] ?? null
                  }
                  onMinChange={setFieldValue(
                    `min${
                      item.field.charAt(0).toUpperCase() + item.field.slice(1)
                    }`
                  )}
                  onMaxChange={setFieldValue(
                    `max${
                      item.field.charAt(0).toUpperCase() + item.field.slice(1)
                    }`
                  )}
                />
              ))
              .with("select-warehouse", () => (
                <SelectWarehouse
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-packaging", () => (
                <SelectPackaging
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-papertype", () => (
                <SelectPaperType
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-manufacturer", () => (
                <SelectManufacturer
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-company-purchase", () => (
                <SelectCompanyPurchase
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-company-sales", () => (
                <SelectCompanySales
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-company-registration-number", () => (
                <SelectCompanyRegistrationNumber
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-location", () => (
                <SelectLocation
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-order-type", () => (
                <SelectOrderType
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                  trade={item.trade ?? "SALES"}
                />
              ))
              .with("select-order-status", () => (
                <SelectOrderStatus
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                  trade={item.trade ?? "SALES"}
                />
              ))
              .with("select-order-process-status", () => (
                <SelectOrderProcessStatus
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-order-release-status", () => (
                <SelectOrderReleaseStatus
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-order-shipping-status", () => (
                <SelectOrderShippingStatus
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-book-close-method", () => (
                <SelectBookCloseMethod
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-converting-status", () => (
                <SelectConvertingStatus
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-guillotine-status", () => (
                <SelectGuillotineStatus
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-release-status", () => (
                <SelectReleaseStatus
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-arrived", () => (
                <SelectArrived
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-shipping-type", () => (
                <SelectShippingType
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-user", () => (
                <SelectUser
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .with("select-account-subject", () => (
                <SelectAccountSubject
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                  accountedType={item.accountedType ?? "COLLECTED"}
                />
              ))
              .with("select-account-method", () => (
                <SelectAccountMethod
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                  type={item.accountedType ?? "COLLECTED"}
                />
              ))
              .with("check", () => (
                <Check
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
                />
              ))
              .exhaustive()}
          </div>
        ))}
      </div>
      <div className="flex-initial flex flex-col basis-24 gap-y-2">
        <button
          className="flex-1 bg-blue-800 hover:bg-blue-700 text-white w-full h-full py-2 rounded"
          onClick={search}
        >
          <TbSearch size={24} />
        </button>
        {valueFieldCount !== 0 && (
          <button
            className="flex-initial bg-gray-200 hover:bg-gray-300 text-sm text-gray-700 w-full py-2 rounded"
            onClick={() => {
              setData({});
              props.onSearch({});
            }}
          >
            검색 초기화
          </button>
        )}
      </div>
    </div>
  );
}

type ItemProps<T = {}> = {
  field: string;
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
} & T;

function Text(props: ItemProps) {
  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Input
        value={props.value ?? undefined}
        onChange={(e) =>
          props.onChange(Util.emptyStringToUndefined(e.target.value) ?? null)
        }
        rootClassName="flex-1 w-64"
        placeholder={`${props.label} 입력`}
      />
    </div>
  );
}

function Number(props: ItemProps<{ min: number; max: number }>) {
  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <InputNumber
        min={props.min}
        max={props.max}
        placeholder={`${props.label} 입력`}
        value={props.value ? parseInt(props.value) : undefined}
        onChange={(value) =>
          props.onChange(Util.emptyStringToUndefined(value?.toString()) ?? null)
        }
      />
    </div>
  );
}

function Range(props: {
  field: string;
  label: string;
  minValue: string | null;
  maxValue: string | null;
  min: number;
  max: number;
  onMinChange: (value: string | null) => void;
  onMaxChange: (value: string | null) => void;
}) {
  return (
    <div className="flex-iniital flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <InputNumber
        style={{ minWidth: 100, flex: "1 0 auto" }}
        min={props.min}
        max={props.max}
        placeholder="최소"
        value={props.minValue ? parseInt(props.minValue) : undefined}
        onChange={(value) =>
          props.onMinChange(
            Util.emptyStringToUndefined(value?.toString()) ?? null
          )
        }
      />
      ~
      <InputNumber
        style={{ minWidth: 100, flex: "1 0 auto" }}
        min={props.min}
        max={props.max}
        placeholder="최대"
        value={props.maxValue ? parseInt(props.maxValue) : undefined}
        onChange={(value) =>
          props.onMaxChange(
            Util.emptyStringToUndefined(value?.toString()) ?? null
          )
        }
      />
    </div>
  );
}

function DateRange(props: {
  field: string;
  label: string;
  minValue: string | null;
  maxValue: string | null;
  onMinChange: (value: string | null) => void;
  onMaxChange: (value: string | null) => void;
}) {
  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <DatePicker
        value={props.minValue ?? undefined}
        onChange={(value) => props.onMinChange(value ?? null)}
        rootClassName="w-32"
      />
      ~
      <DatePicker
        value={props.maxValue ?? undefined}
        onChange={(value) => props.onMaxChange(value ?? null)}
        rootClassName="w-32"
      />
    </div>
  );
}

function Check(props: ItemProps) {
  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Switch
        checked={props.value === "true"}
        onChange={(x) => props.onChange(x ? "true" : null)}
      />
    </div>
  );
}

function SelectWarehouse(props: ItemProps) {
  const list = ApiHook.Inhouse.Warehouse.useGetList({ query: {} });
  const options = list.data?.items?.map((item) => ({
    label: item.name,
    value: item.id.toString(),
  }));
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Select
        options={options}
        placeholder="창고 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, maxWidth: 400, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectPackaging(props: ItemProps) {
  const list = ApiHook.Static.PaperMetadata.useGetAll();
  const options = list.data?.packagings.map((item) => ({
    label: (
      <div className="flex font-fixed gap-x-4">
        <div className="flex-initial whitespace-pre flex flex-col justify-center text-lg">
          <Icon.PackagingType packagingType={item.type} />
        </div>
        <div className="flex-initial whitespace-pre">{item.type.padEnd(4)}</div>
        <div className="flex-1">{Util.formatPackaging(item)}</div>
      </div>
    ),
    value: item.id.toString(),
    text: `${Util.formatPackaging(item)})`,
    type: item.type,
  }));
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Select
        options={options}
        placeholder="포장 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? `${option.type} ${option.text}`
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectPaperType(props: ItemProps) {
  const list = ApiHook.Static.PaperMetadata.useGetAll();
  const options = list.data?.paperTypes.map((item) => ({
    label: item.name,
    value: item.id.toString(),
  }));
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Select
        options={options}
        placeholder="지종 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectManufacturer(props: ItemProps) {
  const list = ApiHook.Static.PaperMetadata.useGetAll();
  const options = list.data?.manufacturers.map((item) => ({
    label: item.name,
    value: item.id.toString(),
  }));
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Select
        options={options}
        placeholder="제지사 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectCompanyPurchase(props: ItemProps<{ virtual?: boolean }>) {
  const me = ApiHook.Auth.useGetMe();

  const partners = ApiHook.Inhouse.Partner.useGetList({ query: {} });

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
          <div className="flex font-fixed gap-x-4">
            <div className="flex-initial whitespace-pre">
              {partners.data?.items.find(
                (p) =>
                  p.companyRegistrationNumber ===
                  x.srcCompany.companyRegistrationNumber
              )?.partnerNickName ?? x.srcCompany.businessName}
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
        ),
        text: `${x.srcCompany.businessName} ${
          partners.data?.items.find(
            (p) =>
              p.companyRegistrationNumber ===
              x.srcCompany.companyRegistrationNumber
          )?.partnerNickName
        } ${x.srcCompany.phoneNo}`,
        value: x.srcCompany.id.toString(),
      }));
  }, [list.data, props.virtual]);
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Select
        options={options}
        placeholder="매입처 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.text.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectCompanySales(props: ItemProps<{ virtual?: boolean }>) {
  const me = ApiHook.Auth.useGetMe();

  const partners = ApiHook.Inhouse.Partner.useGetList({ query: {} });

  const list = ApiHook.Inhouse.BusinessRelationship.useGetList({
    query: {
      srcCompanyId: me.data?.companyId,
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
          <div className="flex font-fixed gap-x-4">
            <div className="flex-initial whitespace-pre">
              {partners.data?.items.find(
                (p) =>
                  p.companyRegistrationNumber ===
                  x.dstCompany.companyRegistrationNumber
              )?.partnerNickName ?? x.dstCompany.businessName}
            </div>
            <div className="flex-1 text-gray-400 text-right font-fixed">
              {x.dstCompany.phoneNo}
            </div>
            <div
              className={classNames("flex-basis whitespace-pre font-fixed", {
                "text-gray-400": x.dstCompany.managedById === null,
                "text-purple-600": x.dstCompany.managedById !== null,
              })}
            >
              {x.dstCompany.managedById !== null ? "비연결" : "연결"}
            </div>
          </div>
        ),
        text: `${x.dstCompany.businessName} ${
          partners.data?.items.find(
            (p) =>
              p.companyRegistrationNumber ===
              x.dstCompany.companyRegistrationNumber
          )?.partnerNickName
        } ${x.dstCompany.phoneNo}`,
        value: x.dstCompany.id.toString(),
      }));
  }, [list.data, props.virtual]);
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Select
        options={options}
        placeholder="매출처 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.text.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectCompanyRegistrationNumber(props: ItemProps) {
  const partners = ApiHook.Inhouse.Partner.useGetList({
    query: {},
  });
  const list = ApiHook.Inhouse.BusinessRelationship.useGetCompactList({
    query: {},
  });
  const options = list.data?.items.map((item) => ({
    label: (
      <div className="flex font-fixed gap-x-4">
        <div className="flex-1 whitespace-pre">
          {partners.data?.items.find(
            (p) =>
              p.companyRegistrationNumber === item.companyRegistrationNumber
          )?.partnerNickName ?? item.businessName}
        </div>
        <div className="flex-basis whitespace-pre font-fixed">
          {Util.formatCompanyRegistrationNo(item.companyRegistrationNumber)}
        </div>
      </div>
    ),
    text: `${
      partners.data?.items.find(
        (p) => p.companyRegistrationNumber === item.companyRegistrationNumber
      )?.partnerNickName ?? item.businessName
    } ${item.phoneNo}`,
    value: item.companyRegistrationNumber,
  }));
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Select
        options={options}
        placeholder="거래처 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.text.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectLocation(props: ItemProps<{ isPublic?: boolean }>) {
  const list = ApiHook.Inhouse.Location.useGetList({
    query: {},
  });
  const options = useMemo(() => {
    const a = list.data?.items
      .filter((x) => x.isPublic)
      .map((x) => ({
        label: (
          <div className="flex font-fixed gap-x-4">
            <div className="flex-initial whitespace-pre">
              {x.name.padEnd(8)}
            </div>
          </div>
        ),
        text: `${x.name} ${Util.formatAddress(x.address)}`,
        value: x.id.toString(),
      }));

    const b = list.data?.items
      .filter((x) => !x.isPublic)
      .map((x) => ({
        label: (
          <div className="flex font-fixed gap-x-4">
            <div className="flex-initial whitespace-pre">
              {x.name.padEnd(8)}
            </div>
          </div>
        ),
        text: `${x.name} ${Util.formatAddress(x.address)}`,
        value: x.id.toString(),
      }));

    return props.isPublic
      ? a
      : [
          {
            label: "자사 도착지",
            options: b ?? [],
          },
          {
            label: "기타 도착지",
            options: a ?? [],
          },
        ];
  }, [list, props.isPublic]);

  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Select
        options={options as any}
        placeholder="도착지 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.text?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectOrderType(props: ItemProps & { trade: "SALES" | "PURCHASE" }) {
  const options = useMemo(
    () => [
      {
        label: `정상 ${props.trade === "SALES" ? "매출" : "매입"}`,
        value: "NORMAL",
      },
      {
        label: `${props.trade === "SALES" ? "매출" : "매입"} 보관`,
        value: "NORMAL_DEPOSIT",
      },
      {
        label: `외주 공정 ${props.trade === "SALES" ? "매출" : "매입"}`,
        value: "PROCESS",
      },
      {
        label: `기타 ${props.trade === "SALES" ? "매출" : "매입"}`,
        value: "ETC",
      },
    ],
    [props.trade]
  );
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Select
        options={options}
        placeholder={`${props.trade === "SALES" ? "매출" : "매입"} 유형 선택`}
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectOrderStatus(props: ItemProps & { trade: "SALES" | "PURCHASE" }) {
  const options = useMemo(
    () => [
      {
        label: "작성중",
        value: props.trade === "SALES" ? "OFFER_PREPARING" : "ORDER_PREPARING",
      },
      { label: "구매 제안 요청", value: "OFFER_REQUESTED" },
      { label: "구매 제안 반려", value: "OFFER_REJECTED" },
      { label: "주문 접수", value: "ORDER_REQUESTED" },
      { label: "주문 반려", value: "ORDER_REJECTED" },
      { label: "주문 취소", value: "CANCELLED" },
      { label: "주문 확정", value: "ACCEPTED" },
    ],
    [props.trade]
  );
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Select
        options={options}
        placeholder={`${props.trade === "SALES" ? "매출" : "매입"} 상태 선택`}
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectOrderProcessStatus(props: ItemProps) {
  const options = useMemo(
    () => [
      { label: "공정 대기", value: "PREPARING" },
      { label: "공정 진행", value: "PROGRESSING" },
      { label: "공정 완료", value: "PROGRESSED" },
    ],
    []
  );
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label}</div>
      <Select
        options={options}
        placeholder="공정 상태 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectOrderReleaseStatus(props: ItemProps) {
  const options = useMemo(
    () => [
      { label: "출고 대기", value: "PREPARING" },
      { label: "출고 완료", value: "PROGRESSED" },
    ],
    []
  );
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">
        {props.label ?? "출고 상태 선택"}
      </div>
      <Select
        options={options}
        placeholder="출고 상태 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectOrderShippingStatus(props: ItemProps) {
  const options = useMemo(
    () => [
      { label: "상차 완료", value: "WAIT_SHIPPING" },
      { label: "배송 중", value: "ON_SHIPPING" },
      { label: "배송 완료", value: "DONE_SHIPPING" },
    ],
    []
  );
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className={"flex-initial flex items-center gap-x-2"}>
      <div className="flex-initial text-sm">
        {props.label ?? "배송 상태 선택"}
      </div>
      <Select
        options={options}
        placeholder="배송 상태 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectBookCloseMethod(props: ItemProps) {
  const options = useMemo(
    () => [{ label: "전자세금계산서", value: "TAX_INVOICE" }],
    []
  );
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );

  return (
    <div className={"flex-initial flex items-center gap-x-2"}>
      <div className="flex-initial text-sm">{props.label ?? "마감 선택"}</div>
      <Select
        options={options}
        placeholder="마감 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        filterOption={(input, option) =>
          option
            ? option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
            : false
        }
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectConvertingStatus(props: ItemProps) {
  const options = useMemo(
    () => [
      { label: "작업 대기", value: "PREPARING" },
      { label: "작업 진행", value: "PROGRESSING" },
      { label: "작업 완료", value: "PROGRESSED" },
    ],
    []
  );
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );
  return (
    <div className={"flex-initial flex items-center gap-x-2"}>
      <div className="flex-initial text-sm">
        {props.label ?? "컨버팅 상태 선택"}
      </div>
      <Select
        options={options}
        placeholder="컨버팅 상태 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectGuillotineStatus(props: ItemProps) {
  const options = useMemo(
    () => [
      { label: "작업 대기", value: "PREPARING" },
      { label: "작업 진행", value: "PROGRESSING" },
      { label: "작업 완료", value: "PROGRESSED" },
    ],
    []
  );
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );
  return (
    <div className={"flex-initial flex items-center gap-x-2"}>
      <div className="flex-initial text-sm">
        {props.label ?? "길로틴 상태 선택"}
      </div>
      <Select
        options={options}
        placeholder="길로틴 상태 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectReleaseStatus(props: ItemProps) {
  const options = useMemo(
    () => [
      { label: "출고 대기", value: "PREPARING" },
      { label: "출고 완료", value: "PROGRESSED" },
    ],
    []
  );
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );
  return (
    <div className={"flex-initial flex items-center gap-x-2"}>
      <div className="flex-initial text-sm">
        {props.label ?? "출고 상태 선택"}
      </div>
      <Select
        options={options}
        placeholder="출고 상태 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectArrived(props: ItemProps) {
  const options = useMemo(
    () => [
      { label: "도착 재고 (자사 재고)", value: "true" },
      { label: "예정 재고", value: "false" },
    ],
    []
  );
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );
  return (
    <div className={"flex-initial flex items-center gap-x-2"}>
      <div className="flex-initial text-sm">{props.label ?? "수금 선택"}</div>
      <Select
        options={options}
        placeholder="수금 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectShippingType(props: ItemProps) {
  const options = useMemo(
    () => [
      { label: "자사 배송", value: "INHOUSE" },
      { label: "거래처 픽업", value: "PARTNER_PICKUP" },
      { label: "외주 배송", value: "OUTSOURCE" },
    ],
    []
  );
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange]
  );
  return (
    <div className={"flex-initial flex items-center gap-x-2"}>
      <div className="flex-initial text-sm">{props.label ?? "배송 구분"}</div>
      <Select
        options={options}
        placeholder="배송 구분 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectUser(props: ItemProps) {
  const list = ApiHook.Setting.User.useGetList({ query: {} });
  const options = list.data?.items.map((item: Omit<Model.User, "company">) => ({
    label: item.name,
    value: item.id.toString(),
  }));
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props.onChange, props.value]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">{props.label ?? "담당자 선택"}</div>
      <Select
        options={options}
        placeholder="담당자 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectAccountSubject(
  props: ItemProps<{ accountedType: "COLLECTED" | "PAID" }>
) {
  const options = Array.from<Model.Enum.Subject>([
    "ACCOUNTS_RECEIVABLE",
    "UNPAID",
    "ADVANCES",
    "MISCELLANEOUS_INCOME",
    "PRODUCT_SALES",
    "ETC",
  ]).map((item) => ({
    label: Util.accountSubjectToString(item, props.accountedType),
    value: item,
  }));
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">
        {props.label ?? "계정과목 선택"}
      </div>
      <Select
        options={options}
        placeholder="계정과목 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectAccountMethod(props: ItemProps<{ type: "PAID" | "COLLECTED" }>) {
  const options = Array.from<Model.Enum.Method>([
    "ACCOUNT_TRANSFER",
    "PROMISSORY_NOTE",
    "CARD_PAYMENT",
    "CASH",
    "OFFSET",
    "ETC",
  ]).map((item) => ({
    label: Util.accountMethodToString(item, props.type),
    value: item,
  }));
  const change = useCallback(
    (value: string[]) => {
      props.onChange(value.join("|"));
    },
    [props]
  );

  return (
    <div className="flex-initial flex items-center gap-x-2">
      <div className="flex-initial text-sm">
        {props.label ?? "수금수단 선택"}
      </div>
      <Select
        options={options}
        placeholder="수금수단 선택"
        mode="multiple"
        maxTagCount={3}
        dropdownMatchSelectWidth={false}
        value={props.value?.split("|")}
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

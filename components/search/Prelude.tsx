import { ApiHook, Util } from "@/common";
import { Input, InputNumber, Select, Switch } from "antd";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { match } from "ts-pattern";
import { Icon } from "..";
import { DatePicker } from "../formControl";
import classNames from "classnames";

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
    | "select-company-registration-number"
    | "select-location"
    | "date-range"
    | "check";
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
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

  return (
    <div className="flex-initial basis-8 flex bg-white p-4 gap-x-4 rounded border border-solid border-gray-200">
      <div className="flex-1 flex flex-wrap gap-4">
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
                  virtual={false}
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
      <div className="flex-initial basis-24">
        <button
          className="bg-blue-800 hover:bg-blue-700 text-white w-full h-full rounded"
          onClick={search}
        >
          검색
        </button>
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
    <div>
      <Input
        value={props.value ?? undefined}
        onChange={(e) =>
          props.onChange(Util.emptyStringToUndefined(e.target.value) ?? null)
        }
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
      />
      ~
      <DatePicker
        value={props.maxValue ?? undefined}
        onChange={(value) => props.onMaxChange(value ?? null)}
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
    value: item.id,
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
        onChange={change}
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
    value: item.id,
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
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectPaperType(props: ItemProps) {
  const list = ApiHook.Static.PaperMetadata.useGetAll();
  const options = list.data?.paperTypes.map((item) => ({
    label: item.name,
    value: item.id,
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
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectManufacturer(props: ItemProps) {
  const list = ApiHook.Static.PaperMetadata.useGetAll();
  const options = list.data?.manufacturers.map((item) => ({
    label: item.name,
    value: item.id,
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
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectCompanyPurchase(props: ItemProps<{ virtual?: boolean }>) {
  const me = ApiHook.Auth.useGetMe();

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
          (x.srcCompany.managedById !== undefined) === props.virtual
      )
      .map((x) => ({
        label: (
          <div className="flex font-fixed gap-x-4">
            <div className="flex-initial whitespace-pre">
              {x.srcCompany.businessName}
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
        text: `${x.srcCompany.businessName} ${x.srcCompany.phoneNo}`,
        value: x.srcCompany.id,
      }));
  }, [list.data?.items, props.virtual]);
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
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

function SelectCompanyRegistrationNumber(props: ItemProps) {
  const list = ApiHook.Inhouse.BusinessRelationship.useGetCompactList({
    query: {},
  });
  const options = list.data?.items.map((item) => ({
    label: (
      <div className="flex font-fixed gap-x-4">
        <div className="flex-1 whitespace-pre">
          {item.partner?.partnerNickName ?? item.businessName}
        </div>
        <div className="flex-basis whitespace-pre font-fixed">
          {Util.formatCompanyRegistrationNo(item.companyRegistrationNumber)}
        </div>
      </div>
    ),
    text: `${item.businessName} ${item.phoneNo}`,
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
        onChange={change}
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
        value: x.id,
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
        value: x.id,
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
        onChange={change}
        style={{ minWidth: 150, flex: "1 0 auto" }}
      />
    </div>
  );
}

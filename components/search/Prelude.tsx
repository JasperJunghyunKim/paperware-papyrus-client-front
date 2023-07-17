import { ApiHook, Util } from "@/common";
import { Input, InputNumber, Select } from "antd";
import _ from "lodash";
import { useCallback, useEffect, useState } from "react";
import { match } from "ts-pattern";
import { Icon } from "..";

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
    | "date"
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
                  minValue={data[item.field]?.split("|")[0] ?? null}
                  maxValue={data[item.field]?.split("|")[1] ?? null}
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
              .with("date", () => (
                <Date
                  {...getFieldValue(item.field)}
                  onChange={setFieldValue(item.field)}
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
              .with("check", () => <div></div>)
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

function Date(props: ItemProps) {
  return <div></div>;
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

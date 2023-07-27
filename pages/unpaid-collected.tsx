import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Search, Table } from "@/components";
import { Page } from "@/components/layout";
import dayjs from "dayjs";
import { useState } from "react";
import { Table as T } from "antd";

type RecordType = {
  companyRegistrationNumber: string;
  partnerNickName: string;
  creditLimit: number;
  totalPrice: number;
  price1: number; // N+1월
  price2: number; // N월
  price3: number; // N-1월
  price4: number; // N-2월
  price5: number; // N-3월
  price6: number; // N-4월
  price7: number; // N-5월 이전
};

export default function Component() {
  const [search, setSearch] = useState<any>({});
  const [page, setPage] = usePage();
  const list = ApiHook.Accounted.Unpaid.useGetList({
    query: { ...page, ...search, accountedType: "COLLECTED" },
  });
  const getMonthAfter = (month: number) => {
    return ((dayjs().month() + 12 + month) % 12) + 1;
  };

  return (
    <Page title="미수금 잔액">
      <Search
        items={[
          {
            type: "select-company-registration-number",
            field: "companyRegistrationNumbers",
            label: "거래처",
          },
          {
            type: "range",
            field: "amount",
            label: "전체 잔액",
            min: -9999999999,
            max: 9999999999,
          },
        ]}
        value={search}
        onSearch={setSearch}
      />
      <Table.Default<RecordType>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.companyRegistrationNumber}
        selection={"none"}
        columns={[
          ...Table.Preset.useColumnPartner2<RecordType>({
            getValue: (record: RecordType) => record.companyRegistrationNumber,
          }),
          {
            title: "여신",
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {Util.comma(record.creditLimit)} 원
              </div>
            ),
          },
          {
            title: "전체 잔액",
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {Util.comma(record.totalPrice)} 원
              </div>
            ),
          },
          {
            title: `${getMonthAfter(1)}월 이후 누적 잔액`,
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {Util.comma(record.price1)} 원
              </div>
            ),
          },
          {
            title: `${getMonthAfter(0)}월 잔액`,
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {Util.comma(record.price2)} 원
              </div>
            ),
          },
          {
            title: `${getMonthAfter(-1)}월 잔액`,
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {Util.comma(record.price3)} 원
              </div>
            ),
          },
          {
            title: `${getMonthAfter(-2)}월 잔액`,
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {Util.comma(record.price4)} 원
              </div>
            ),
          },
          {
            title: `${getMonthAfter(-3)}월 잔액`,
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {Util.comma(record.price5)} 원
              </div>
            ),
          },
          {
            title: `${getMonthAfter(-4)}월 잔액`,
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {Util.comma(record.price6)} 원
              </div>
            ),
          },
          {
            title: `${getMonthAfter(-5)}월 이전 누적 잔액`,
            render: (record: RecordType) => (
              <div className="font-fixed text-right">
                {Util.comma(record.price7)} 원
              </div>
            ),
          },
        ]}
        footer={() => (
          <>
            <T.Summary.Row className="bg-gray-200 font-fixed text-right">
              <T.Summary.Cell index={1}></T.Summary.Cell>
              <T.Summary.Cell index={2}>{list.data?.total} 원</T.Summary.Cell>
              <T.Summary.Cell index={3}>
                {Util.comma(list.data?.totalPrice.totalPrice)} 원
              </T.Summary.Cell>
              <T.Summary.Cell index={4}>
                {Util.comma(list.data?.totalPrice.price1)} 원
              </T.Summary.Cell>
              <T.Summary.Cell index={5}>
                {Util.comma(list.data?.totalPrice.price2)} 원
              </T.Summary.Cell>
              <T.Summary.Cell index={6}>
                {Util.comma(list.data?.totalPrice.price3)} 원
              </T.Summary.Cell>
              <T.Summary.Cell index={7}>
                {Util.comma(list.data?.totalPrice.price4)} 원
              </T.Summary.Cell>
              <T.Summary.Cell index={8}>
                {Util.comma(list.data?.totalPrice.price5)} 원
              </T.Summary.Cell>
              <T.Summary.Cell index={9}>
                {Util.comma(list.data?.totalPrice.price6)} 원
              </T.Summary.Cell>
              <T.Summary.Cell index={10}>
                {Util.comma(list.data?.totalPrice.price7)} 원
              </T.Summary.Cell>
            </T.Summary.Row>
          </>
        )}
      />
    </Page>
  );
}

import { Api, Model } from "@/@shared";
import PartnerTaxManager from "@/@shared/models/partner-tax-manager";
import { ApiHook, Util } from "@/common";
import { usePage } from "@/common/hook";
import { emptyStringToUndefined } from "@/common/util";
import { Button, FormControl, Icon, Popup, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { Alert, Form, Input, Modal, Radio, Select } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import classNames from "classnames";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TbArrowBack,
  TbCash,
  TbCheck,
  TbEraser,
  TbNote,
  TbPencil,
  TbPlus,
  TbSend,
  TbX,
} from "react-icons/tb";

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Tax.TaxInvoice.useGetList({ query: page });
  const [selected, setSelected] = useState<Model.TaxInvoice[]>([]);

  const only = Util.only(selected);

  const apiDelete = ApiHook.Tax.TaxInvoice.useDelete();
  const cmdDelete = useCallback(async () => {
    if (!only) return;
    if (!(await Util.confirm("선택한 전자세금계산서를 삭제하시겠습니까?")))
      return;

    await apiDelete.mutateAsync({
      id: only.id,
    });
    setSelected([]);
  }, [apiDelete, only]);

  return (
    <Page title="전자세금계산서 목록">
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="전자세금계산서 추가"
          onClick={() => setOpenCreate(true)}
        />
        <div className="flex-1" />
        {only && (
          <>
            <Toolbar.ButtonPreset.Delete
              label="전자세금계산서 삭제"
              onClick={cmdDelete}
            />
            <Toolbar.ButtonPreset.Update
              label="전자세금계산서 상세"
              onClick={() => setOpenUpdate(only.id)}
            />
          </>
        )}
      </Toolbar.Container>
      <Table.Default
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(record) => record.id}
        selection="single"
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "국세청 승인번호",
            render: (record: Model.TaxInvoice) => record.invoicerMgtKey,
          },
          {
            title: "상태",
            render: (record: Model.TaxInvoice) =>
              Util.taxInvoiceStatusToString(record.status),
          },
          {
            title: "작성일자",
            render: (record: Model.TaxInvoice) =>
              Util.formatIso8601ToLocalDate(record.writeDate),
          },
          {
            title: "발급일자",
            render: (record: Model.TaxInvoice) =>
              Util.formatIso8601ToLocalDate(record.issuedDate),
          },
          {
            title: "전송일자",
            render: (record: Model.TaxInvoice) =>
              Util.formatIso8601ToLocalDate(record.sendedDate),
          },
          {
            title: "공급받는자 등록번호",
            render: (record: Model.TaxInvoice) => (
              <div className="font-fixed">
                {Util.formatCompanyRegistrationNo(
                  record.srcCompanyRegistrationNumber
                )}
              </div>
            ),
          },
          {
            title: "상호",
            render: (record: Model.TaxInvoice) => record.srcCompanyName,
          },
          {
            title: "대표자명",
            render: (record: Model.TaxInvoice) =>
              record.srcCompanyRepresentative,
          },
          {
            title: "품목명",
            render: (record: Model.TaxInvoice) => record.item,
          },
          {
            title: "합계금액",
            render: (record: Model.TaxInvoice) => (
              <div className="text-right font-fixed">
                {`${Util.comma(record.totalPrice)} 원`}
              </div>
            ),
          },
          {
            title: "공급가액",
            render: (record: Model.TaxInvoice) => (
              <div className="text-right font-fixed">
                {`${Util.comma(record.suppliedPrice)} 원`}
              </div>
            ),
          },
          {
            title: "세액",
            render: (record: Model.TaxInvoice) => (
              <div className="text-right font-fixed">
                {`${Util.comma(record.vatPrice)} 원`}
              </div>
            ),
          },
          {
            title: "영수/청구",
            render: (record: Model.TaxInvoice) =>
              Util.taxInvoicePurposeTypeToString(record.purposeType),
          },
          { title: "비고", render: (record: Model.TaxInvoice) => record.memo },
          {
            title: "공급받는자 이메일1",
            render: (record: Model.TaxInvoice) => record.srcEmail,
          },
          {
            title: "공급받는자 이메일2",
            render: (record: Model.TaxInvoice) => record.srcEmail2,
          },
        ]}
      />
      <PopupCreate
        open={openCreate}
        onClose={setOpenCreate}
        onCreated={setOpenUpdate}
      />
      <PopupUpdate open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}

type PopupCreateOpenType = boolean;
interface PopupCreateProps {
  open: PopupCreateOpenType;
  onClose: (value: false) => void;
  onCreated: (value: number) => void;
}
function PopupCreate(props: PopupCreateProps) {
  const me = ApiHook.Auth.useGetMe();
  const companies = ApiHook.Inhouse.BusinessRelationship.useGetList({
    query: {
      srcCompanyId: me.data?.companyId,
    },
  });

  const [form] = useForm<Api.CreateTaxInvoiceRequest>();
  const companyId = useWatch("companyId", form);

  const selectedCompany = companies.data?.items.find(
    (p) => p.dstCompany.id === companyId
  );

  const apiCreate = ApiHook.Tax.TaxInvoice.useCreate();
  const cmdCreate = useCallback(async () => {
    if (!selectedCompany) return;

    const values = await form.validateFields();
    const result = await apiCreate.mutateAsync({
      data: {
        ...values,
      },
    });
    props.onClose(false);
    props.onCreated(result.id);
  }, [apiCreate, form, selectedCompany]);

  return (
    <Popup.Template.Property
      title={`전자세금계산서 추가`}
      open={props.open !== false}
      onClose={() => props.onClose(false)}
      width="600px"
      height="600px"
    >
      <div className="flex flex-col w-full h-full justify-center gap-y-4">
        <div className="flex justify-center gap-x-2">
          <IssueButton icon={<TbCash />} label="정발행" active />
          <IssueButton
            icon={<TbCash />}
            label="역발행"
            active={false}
            disabled
          />
        </div>
        <div className="flex justify-center">
          <Alert
            message="정발행이 뭔지는 저도 잘 모르겠습니다."
            className="w-[400px]"
          />
        </div>
        <div className="flex justify-center">
          <Form form={form} layout="vertical" className="w-[400px]">
            <Form.Item
              name={["writeDate"]}
              label="작성일자"
              initialValue={Util.dateToIso8601(dayjs())}
              rules={[{ required: true, message: "작성일자를 입력해주세요" }]}
              rootClassName="w-full"
            >
              <FormControl.DatePicker placeholder="작성일자를 입력해주세요" />
            </Form.Item>
            <Form.Item
              name={["companyId"]}
              label="공급받는자"
              rules={[{ required: true, message: "공급받는자를 입력해주세요" }]}
              rootClassName="w-full"
            >
              <FormControl.SelectCompanySales placeholder="공급받는자를 입력해주세요" />
            </Form.Item>
            {selectedCompany && (
              <Form.Item
                label="사업자등록번호 (공급받는자)"
                rootClassName="w-full"
              >
                <Input
                  value={selectedCompany.dstCompany.companyRegistrationNumber}
                  disabled
                />
              </Form.Item>
            )}
            <Form.Item
              label="영수/청구"
              name={["purposeType"]}
              initialValue="RECEIPT"
            >
              <Radio.Group
                options={[
                  { label: "영수", value: "RECEIPT" },
                  { label: "청구", value: "CHARGE" },
                ]}
              />
            </Form.Item>
          </Form>
        </div>
        <div className="flex justify-center">
          <Button.Default label="다음" type="primary" onClick={cmdCreate} />
        </div>
      </div>
    </Popup.Template.Property>
  );
}

interface IssueButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  disabled?: boolean;
}
function IssueButton(props: IssueButtonProps) {
  return (
    <button
      disabled={props.disabled}
      className={classNames(
        "flex-[0_0_80px] h-[90px] text-gray-400 rounded flex flex-col justify-center items-center",
        {
          "bg-blue-600 text-white": props.active,
          "cursor-not-allowed": props.disabled,
        }
      )}
    >
      <div className="text-4xl">{props.icon}</div>
      <div className="font-bold">{props.label}</div>
    </button>
  );
}

type PopupUpdateOpenType = number | false;
interface PopupUpdateProps {
  open: PopupUpdateOpenType;
  onClose: (value: false) => void;
}
function PopupUpdate(props: PopupUpdateProps) {
  const me = ApiHook.Auth.useGetMe();

  const [edit, setEdit] = useState(false);
  const [openPopupOrders, setOpenPopupOrders] = useState<
    PopupOrdersOpenType | false
  >(false);
  const [openPopupSelectTaxManager, setOpenPopupSelectTaxManager] = useState<
    | {
        companyRegistrationNumber: string;
        flag: string;
      }
    | false
  >(false);
  const [openIssue, setOpenIssue] = useState<PopupIssueOpenType>(false);
  const [openSend, setOpenSend] = useState<PopupSendOpenType>(false);
  const [openCancelIssue, setOpenCancelIssue] =
    useState<PopupCancelIssueOpenType>(false);

  const [writeDate, setWriteDate] = useState<string | undefined>(
    dayjs().toISOString()
  );
  const [dstEmail, setDstEmail] = useState<string>();
  const [srcEmail, setSrcEmail] = useState<string>();
  const [srcEmailName, setSrcEmailName] = useState<string>();
  const [srcEmail2, setSrcEmail2] = useState<string>();
  const [srcEmail2Name, setSrcEmail2Name] = useState<string>();
  const [memo, setMemo] = useState<string>("");
  const [cash, setCash] = useState<number>();
  const [check, setCheck] = useState<number>();
  const [note, setNote] = useState<number>();
  const [credit, setCredit] = useState<number>();
  const [purposeType, setPurposeType] =
    useState<Model.Enum.TaxInvoicePurposeType>("CHARGE");

  const taxInvoice = ApiHook.Tax.TaxInvoice.useGetItem({
    id: props.open ? props.open : null,
  });
  const orders = ApiHook.Tax.TaxInvoice.useGetInvoiceOrderList({
    id: props.open ? props.open : null,
  });

  const [selectedOrders, setSelectedOrders] = useState<Model.Order[]>([]);

  const apiUpdate = ApiHook.Tax.TaxInvoice.useUpdate();
  const cmdUpdate = useCallback(async () => {
    if (!taxInvoice.data || !writeDate) return;
    if (!(await Util.confirm("전자세금계산서 수정 내용을 저장하시겠습니까?")))
      return;

    await apiUpdate.mutateAsync({
      id: taxInvoice.data.id,
      data: {
        writeDate,
        dstEmail: emptyStringToUndefined(dstEmail),
        srcEmail: emptyStringToUndefined(srcEmail),
        srcEmailName: emptyStringToUndefined(srcEmailName),
        srcEmail2: emptyStringToUndefined(srcEmail2),
        srcEmailName2: emptyStringToUndefined(srcEmail2Name),
        memo,
        cash,
        check,
        note,
        credit,
        purposeType,
      },
    });
    setEdit(false);
  }, [
    apiUpdate,
    writeDate,
    dstEmail,
    srcEmail,
    srcEmail2,
    memo,
    cash,
    check,
    note,
    credit,
    purposeType,
    taxInvoice.data,
  ]);

  const apiDeleteInvoiceOrder = ApiHook.Tax.TaxInvoice.useDeleteInvoiceOrder();
  const cmdDeleteInvoiceOrder = useCallback(async () => {
    if (!taxInvoice.data || !selectedOrders.length) return;
    if (
      !(await Util.confirm(
        `선택한 ${selectedOrders.length}개 품목을 목록에서 삭제하시겠습니까?`
      ))
    )
      return;

    await apiDeleteInvoiceOrder.mutateAsync({
      id: taxInvoice.data.id,
      data: {
        orderIds: selectedOrders.map((p) => p.id),
      },
    });
    setSelectedOrders([]);
  }, [apiDeleteInvoiceOrder, selectedOrders, taxInvoice.data]);

  const apiSend = ApiHook.Tax.TaxInvoice.useSendInvoice();
  const cmdSend = useCallback(
    async (skip: boolean) => {
      if (!taxInvoice.data) return;
      if (!skip && !(await Util.confirm("전자세금계산서를 전송하시겠습니까?")))
        return;

      try {
        const resp = await apiSend.mutateAsync({
          id: taxInvoice.data.id,
        });

        if (resp.certUrl) {
          window.open(
            resp.certUrl,
            "공인인증서 등록",
            "width=1100,height=800,location=no,toolbar=no,status=no"
          );
          setOpenIssue({
            certUrl: resp.certUrl,
            taxInvoiceId: taxInvoice.data.id,
          });
        } else {
        }
      } catch (e) {
        await Util.warn("전자세금계산서 전송 실패했습니다.");
        props.onClose(false);
      }
    },
    [apiSend, taxInvoice.data]
  );

  const apiIssue = ApiHook.Tax.TaxInvoice.useIssueInvoice();
  const cmdIssue = useCallback(async () => {
    if (!taxInvoice.data) return;
    if (!(await Util.confirm("전자세금계산서를 발행하시겠습니까?"))) return;

    try {
      const resp = await apiIssue.mutateAsync({
        id: taxInvoice.data.id,
      });

      if (resp.certUrl) {
        window.open(
          resp.certUrl,
          "공인인증서 등록",
          "width=1100,height=800,location=no,toolbar=no,status=no"
        );
        setOpenIssue({
          certUrl: resp.certUrl,
          taxInvoiceId: taxInvoice.data.id,
        });
      } else {
        if (!(await Util.confirm("국세청에 즉시 전송하시겠습니까?"))) return;
        cmdSend(true);
      }
    } catch (e) {
      await Util.warn("전자세금계산서 발행 실패했습니다.");
    }
  }, [apiIssue, taxInvoice.data]);

  const apiCancelIssue = ApiHook.Tax.TaxInvoice.useCancelIssueInvoice();
  const cmdCancelIssue = useCallback(async () => {
    if (!taxInvoice.data) return;
    if (!(await Util.confirm("전자세금계산서 발행을 취소하시겠습니까?")))
      return;

    try {
      const resp = await apiCancelIssue.mutateAsync({
        id: taxInvoice.data.id,
      });

      if (resp.certUrl) {
        window.open(
          resp.certUrl,
          "공인인증서 등록",
          "width=1100,height=800,location=no,toolbar=no,status=no"
        );
        setOpenCancelIssue({
          certUrl: resp.certUrl,
          taxInvoiceId: taxInvoice.data.id,
        });
      } else {
      }
    } catch (e) {
      await Util.warn("전자세금계산서 발행 취소 실패했습니다.");
    }
  }, [apiCancelIssue, taxInvoice.data]);

  const myTradePrice = useCallback(
    (record: Model.Order) =>
      record.tradePrice.find((p) => p.companyId === me.data?.companyId),
    [me]
  );

  const reset = useCallback(() => {
    if (!taxInvoice.data) return;

    setWriteDate(taxInvoice.data.writeDate);
    setDstEmail(taxInvoice.data.dstEmail);
    setSrcEmail(taxInvoice.data.srcEmail);
    setSrcEmailName(taxInvoice.data.srcEmailName);
    setSrcEmail2(taxInvoice.data.srcEmail2);
    setSrcEmail2Name(taxInvoice.data.srcEmailName2);
    setMemo(taxInvoice.data.memo);
    setPurposeType(taxInvoice.data.purposeType);

    setEdit(false);
  }, [taxInvoice.data]);

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <Popup.Template.Property
      title={`전자세금계산서 상세`}
      open={props.open !== false}
      onClose={() => props.onClose(false)}
      width="1200px"
      height="calc(100vh - 40px)"
    >
      <div className="w-full h-full flex flex-col">
        <div className="flex-initial flex">
          <table className="w-full h-full bg-gray-50 red">
            <tr>
              <td
                rowSpan={6}
                className="bg-red-100 text-center font-bold vtext"
              >
                공급자
              </td>
              <td className="bg-red-50 text-red-700 req">등록번호</td>
              <td>
                {Util.formatCompanyRegistrationNo(
                  taxInvoice.data?.dstCompanyRegistrationNumber
                )}
              </td>
              <td className="bg-red-50 text-red-700">종사업장 번호</td>
              <td></td>
            </tr>
            <tr>
              <td className="bg-red-50 text-red-700 req">상호</td>
              <td>{taxInvoice.data?.dstCompanyName}</td>
              <td className="bg-red-50 text-red-700 req">성명</td>
              <td>{taxInvoice.data?.dstCompanyRepresentative}</td>
            </tr>
            <tr>
              <td className="bg-red-50 text-red-700 req">사업장</td>
              <td colSpan={3}>
                {Util.formatAddress(taxInvoice.data?.dstCompanyAddress)}
              </td>
            </tr>
            <tr>
              <td className="bg-red-50 text-red-700">업태</td>
              <td>{taxInvoice.data?.dstCompanyBizType}</td>
              <td className="bg-red-50 text-red-700">종목</td>
              <td>{taxInvoice.data?.dstCompanyBizItem}</td>
            </tr>
            <tr>
              <td className="bg-red-50 text-red-700">이메일</td>
              <td colSpan={3}>
                <Input
                  value={dstEmail}
                  onChange={(e) => setDstEmail(e.target.value)}
                  disabled={!edit}
                />
              </td>
            </tr>
          </table>
          <table className="w-full h-full bg-gray-50 blue">
            <tr>
              <td
                rowSpan={6}
                className="bg-blue-100 text-center font-bold vtext"
              >
                공급받는자
              </td>
              <td className="bg-blue-50 text-blue-800 req">등록번호</td>
              <td>
                {Util.formatCompanyRegistrationNo(
                  taxInvoice.data?.srcCompanyRegistrationNumber
                )}
              </td>
              <td className="bg-blue-50 text-blue-800">종사업장 번호</td>
              <td></td>
            </tr>
            <tr>
              <td className="bg-blue-50 text-blue-800 req">상호</td>
              <td>{taxInvoice.data?.srcCompanyName}</td>
              <td className="bg-blue-50 text-blue-800 req">성명</td>
              <td>{taxInvoice.data?.srcCompanyRepresentative}</td>
            </tr>
            <tr>
              <td className="bg-blue-50 text-blue-800">사업장</td>
              <td colSpan={3}>
                {Util.formatAddress(taxInvoice.data?.srcCompanyAddress)}
              </td>
            </tr>
            <tr>
              <td className="bg-blue-50 text-blue-800">업태</td>
              <td>{taxInvoice.data?.srcCompanyBizType}</td>
              <td className="bg-blue-50 text-blue-800">종목</td>
              <td>{taxInvoice.data?.srcCompanyBizItem}</td>
            </tr>
            <tr>
              <td className="bg-blue-50 text-blue-800 w-24">이메일 1</td>
              <td colSpan={3}>
                <div className="flex gap-x-2">
                  {taxInvoice.data && (
                    <>
                      <Input
                        value={srcEmailName}
                        disabled
                        rootClassName="flex-1"
                        placeholder="이름"
                      />
                      <Input
                        value={srcEmail}
                        disabled
                        rootClassName="flex-1"
                        placeholder="이메일"
                      />
                      {edit && (
                        <>
                          <button
                            className="flex-initial bg-blue-600 text-white px-2 rounded"
                            onClick={() =>
                              setOpenPopupSelectTaxManager({
                                companyRegistrationNumber:
                                  taxInvoice.data.srcCompanyRegistrationNumber,
                                flag: "1",
                              })
                            }
                          >
                            불러오기
                          </button>
                          <button
                            className="flex-initial bg-red-600 text-white px-2 rounded"
                            onClick={() => {
                              setSrcEmail(undefined);
                              setSrcEmailName(undefined);
                            }}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
            <tr>
              <td className="bg-blue-50 text-blue-800 w-24">이메일 2</td>
              <td colSpan={3}>
                <div className="flex gap-x-2">
                  {taxInvoice.data && (
                    <>
                      <Input
                        value={srcEmail2Name}
                        disabled
                        rootClassName="flex-1"
                        placeholder="이름"
                      />
                      <Input
                        value={srcEmail2}
                        disabled
                        rootClassName="flex-1"
                        placeholder="이메일"
                      />
                      {edit && (
                        <>
                          <button
                            className="flex-initial bg-blue-600 text-white px-2 rounded"
                            onClick={() =>
                              setOpenPopupSelectTaxManager({
                                companyRegistrationNumber:
                                  taxInvoice.data.srcCompanyRegistrationNumber,
                                flag: "2",
                              })
                            }
                          >
                            불러오기
                          </button>
                          <button
                            className="flex-initial bg-red-600 text-white px-2 rounded"
                            onClick={() => {
                              setSrcEmail2(undefined);
                              setSrcEmail2Name(undefined);
                            }}
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          </table>
        </div>
        <div className="flex-initial flex">
          <table className="w-full h-full bg-gray-50 gray">
            <tr>
              <td width="200px" className="bg-gray-100 text-gray-700 req">
                작성일자
              </td>
              <td colSpan={5}>
                <div className="w-64">
                  <FormControl.DatePicker
                    value={writeDate}
                    onChange={(p) => setWriteDate(p ?? undefined)}
                    disabled={!edit}
                  />
                </div>
              </td>
            </tr>
            <tr>
              <td className="bg-gray-100 text-gray-700">비고</td>
              <td colSpan={5}>
                <Input.TextArea
                  className="w-full"
                  autoSize={{
                    minRows: 2,
                    maxRows: 2,
                  }}
                  maxLength={400}
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  disabled={!edit}
                />
              </td>
            </tr>
            <tr>
              <td className="bg-gray-100 text-gray-700">합계금액</td>
              <td className="text-right font-fixed">
                {Util.comma(
                  orders.data?.items.reduce(
                    (p, c) =>
                      p +
                      (myTradePrice(c)?.suppliedPrice ?? 0) +
                      (myTradePrice(c)?.vatPrice ?? 0),
                    0
                  )
                )}{" "}
                원
              </td>
              <td className="bg-gray-100 text-gray-700">공급가액</td>
              <td className="text-right">
                {Util.comma(
                  orders.data?.items.reduce(
                    (p, c) => p + (myTradePrice(c)?.suppliedPrice ?? 0),
                    0
                  )
                )}{" "}
                원
              </td>
              <td className="bg-gray-100 text-gray-700">세액</td>
              <td className="text-right">
                {Util.comma(
                  orders.data?.items.reduce(
                    (p, c) => p + (myTradePrice(c)?.vatPrice ?? 0),
                    0
                  )
                )}{" "}
                원
              </td>
            </tr>
          </table>
        </div>
        <div className="flex-1">
          <Table.Default<Model.Order>
            columns={[
              {
                title: "월",
                render: (record) => dayjs(record.orderDate).format("MM"),
              },
              {
                title: "일",
                render: (record) => dayjs(record.orderDate).format("DD"),
              },
              {
                title: "품목명",
                render: (record: Model.Order) => getOrderItem(record),
              },
              { title: "규격" },
              { title: "수량" },
              { title: "단가" },
              {
                title: "공급가액",
                render: (record: Model.Order) => (
                  <div className="font-fixed text-right">
                    {Util.comma(myTradePrice(record)?.suppliedPrice)} 원
                  </div>
                ),
              },
              {
                title: "세액",
                render: (record: Model.Order) => (
                  <div className="font-fixed text-right">
                    {Util.comma(myTradePrice(record)?.vatPrice)} 원
                  </div>
                ),
              },
              {
                title: "합계",
                render: (record: Model.Order) => (
                  <div className="font-fixed text-right">
                    {Util.comma(
                      (myTradePrice(record)?.suppliedPrice ?? 0) +
                        (myTradePrice(record)?.vatPrice ?? 0)
                    )}{" "}
                    원
                  </div>
                ),
              },
              {
                title: "비고",
                render: (record: Model.Order) => record.memo,
              },
            ]}
            data={orders.data}
            keySelector={(p) => p.id}
            selection={
              taxInvoice.data?.status === "PREPARING" ? "multiple" : "none"
            }
            selected={selectedOrders}
            onSelectedChange={setSelectedOrders}
            className="h-full"
          />
        </div>
        <div className="flex-initial flex">
          <table className="w-full h-full bg-gray-50 gray">
            <tr>
              <td width={80} className="bg-gray-100 text-gray-700">
                현금
              </td>
              <td>
                <FormControl.Number
                  min={0}
                  max={9999999999}
                  value={cash}
                  onChange={(p) => setCash(p ?? undefined)}
                  disabled={!edit}
                />
              </td>
              <td width={80} className="bg-gray-100 text-gray-700">
                수표
              </td>
              <td>
                <FormControl.Number
                  min={0}
                  max={9999999999}
                  value={check}
                  onChange={(p) => setCheck(p ?? undefined)}
                  disabled={!edit}
                />
              </td>
              <td width={80} className="bg-gray-100 text-gray-700">
                어음
              </td>
              <td>
                <FormControl.Number
                  min={0}
                  max={9999999999}
                  value={note}
                  onChange={(p) => setNote(p ?? undefined)}
                  disabled={!edit}
                />
              </td>
              <td width={90} className="bg-gray-100 text-gray-700">
                외상미수금
              </td>
              <td>
                <FormControl.Number
                  min={0}
                  max={9999999999}
                  value={credit}
                  onChange={(p) => setCredit(p ?? undefined)}
                  disabled={!edit}
                />
              </td>
              <td width={100} className="bg-gray-100 text-gray-700">
                영수/청구
              </td>
              <td style={{ padding: "0px 8px" }}>
                <Radio.Group
                  options={[
                    { label: "영수", value: "RECEIPT" },
                    { label: "청구", value: "CHARGE" },
                  ]}
                  value={purposeType}
                  onChange={(e) => setPurposeType(e.target.value)}
                  disabled={!edit}
                />
              </td>
            </tr>
          </table>
        </div>
        <div className="flex-initial p-2 flex justify-center gap-2">
          {edit ? (
            <>
              <Button.Default
                icon={<TbArrowBack />}
                label="취소"
                onClick={reset}
              />
              <Button.Default
                icon={<TbCheck />}
                label="내용 저장"
                type="primary"
                onClick={cmdUpdate}
              />
            </>
          ) : taxInvoice.data &&
            (taxInvoice.data?.status === "PREPARING" ||
              taxInvoice.data.status === "ISSUE_FAILED") ? (
            <>
              <Button.Default
                icon={<TbPlus />}
                label="품목 추가"
                onClick={() =>
                  setOpenPopupOrders({
                    taxInvoiceId: taxInvoice.data.id,
                    writeDate: taxInvoice.data.writeDate,
                    srcCompanyRegistrationNumber:
                      taxInvoice.data.srcCompanyRegistrationNumber,
                  })
                }
              />
              {selectedOrders.length > 0 ? (
                <Button.Default
                  icon={<TbEraser />}
                  label="품목 삭제"
                  onClick={cmdDeleteInvoiceOrder}
                />
              ) : null}
              <div className="flex-1" />
              <Button.Default
                icon={<TbPencil />}
                label="내용 수정"
                onClick={() => setEdit(true)}
              />
              <Button.Default
                icon={<TbSend />}
                label="계산서 발행"
                type="primary"
                onClick={cmdIssue}
              />
            </>
          ) : taxInvoice.data &&
            (taxInvoice.data.status === "ISSUED" ||
              taxInvoice.data.status === "SEND_FAILED") ? (
            <>
              <Button.Default
                icon={<TbArrowBack />}
                label="발행 취소"
                onClick={cmdCancelIssue}
              />
              <Button.Default
                icon={<TbSend />}
                label="계산서 전송"
                type="primary"
                onClick={async () => await cmdSend(false)}
              />
            </>
          ) : null}
        </div>
      </div>
      <PopupSelectTaxManager
        open={openPopupSelectTaxManager}
        onClose={() => setOpenPopupSelectTaxManager(false)}
        onSelect={(name: string, email: string, flag: string) => {
          if (flag === "1") {
            setSrcEmailName(name);
            setSrcEmail(email);
          } else if (flag === "2") {
            setSrcEmail2Name(name);
            setSrcEmail2(email);
          }
        }}
      />
      <PopupOrders
        open={openPopupOrders}
        onClose={() => setOpenPopupOrders(false)}
      />
      <PopupIssue
        open={openIssue}
        onClose={() => setOpenIssue(false)}
        trySend={() => cmdSend(true)}
      />
      <PopupSend open={openSend} onClose={() => setOpenSend(false)} />
      <PopupCancelIssue
        open={openCancelIssue}
        onClose={() => setOpenCancelIssue(false)}
      />
      <style jsx>{`
        .red table,
        .red tr,
        .red td {
          border-collapse: collapse;
          border: 1px solid #ffaaaa;
          padding: 10px;
        }
        .blue table,
        .blue tr,
        .blue td {
          border-collapse: collapse;
          border: 1px solid #ccccff;
          padding: 10px;
        }
        .gray table,
        .gray tr,
        .gray td {
          border-collapse: collapse;
          border: 1px solid #cccccc;
          padding: 10px;
        }
        .vtext {
          writing-mode: vertical-lr;
          width: 42px;
          letter-spacing: 5px;
        }
        .req::before {
          content: "*";
          color: red;
          margin-right: 4px;
        }
      `}</style>
    </Popup.Template.Property>
  );
}

type PopupOrdersOpenType = {
  taxInvoiceId: number;
  writeDate: string;
  srcCompanyRegistrationNumber: string;
};
function PopupOrders(props: {
  open: PopupOrdersOpenType | false;
  onClose: (unit: false) => void;
}) {
  const me = ApiHook.Auth.useGetMe();
  const [page, setPage] = usePage();
  const orders = ApiHook.Trade.Common.useGetList({
    query:
      props.open && me.data
        ? {
            dstCompanyId: me.data.companyId,
            year: dayjs(props.open.writeDate).format("YYYY"),
            month: dayjs(props.open.writeDate).format("M"),
            bookClosed: "false",
            srcCompanyRegistrationNumber:
              props.open.srcCompanyRegistrationNumber,
            skip: page.skip,
            take: page.take,
          }
        : null,
  });
  const [selected, setSelected] = useState<Model.Order[]>([]);

  const partnerColumn = Table.Preset.useColumnPartner<Model.Order>(
    ["srcCompany", "companyRegistrationNumber"],
    { title: "매출처", fallback: (record) => record.srcCompany.businessName }
  );

  const apiSubmit = ApiHook.Tax.TaxInvoice.useRegisterInvoiceOrder();
  const cmdSubmit = useCallback(async () => {
    if (!props.open) return;
    if (selected.length === 0) return;
    if (!(await Util.confirm("품목을 추가하시겠습니까?"))) return;

    await apiSubmit.mutateAsync({
      id: props.open.taxInvoiceId,
      data: {
        orderIds: selected.map((p) => p.id),
      },
    });
    props.onClose(false);
  }, [selected]);

  useEffect(() => {
    if (!props.open) return;
    setSelected([]);
    setPage({ skip: 0, take: 100 });
  }, [props.open]);

  return (
    <Popup.Template.Property
      title="품목 추가"
      open={!!props.open}
      onClose={() => props.onClose(false)}
      width="calc(100vw - 200px)"
      height="calc(100vh - 120px)"
    >
      <div className="flex flex-col w-full h-full">
        <div className="flex-1">
          <Table.Default<Model.Order>
            data={orders.data}
            page={page}
            setPage={setPage}
            keySelector={(record) => `${record.id}`}
            selected={selected}
            onSelectedChange={setSelected}
            columns={[
              {
                title: "매출 유형",
                render: (_value, record) => (
                  <div>
                    {Util.orderTypeToString(
                      record.orderType,
                      !!record.depositEvent,
                      "SALES"
                    )}
                  </div>
                ),
              },
              {
                title: "매출 번호",
                dataIndex: "orderNo",
                render: (value) => (
                  <div className="flex">
                    <div className="font-fixed bg-sky-100 px-1 text-sky-800 rounded-md">
                      {value}
                    </div>
                  </div>
                ),
              },
              ...partnerColumn,
              {
                title: "매출일",
                dataIndex: "orderDate",
                render: (value) => Util.formatIso8601ToLocalDate(value),
              },
              {
                title: "납품 요청일",
                render: (_, record) =>
                  Util.formatIso8601ToLocalDate(
                    record.orderStock?.wantedDate ??
                      record.orderProcess?.srcWantedDate ??
                      null
                  ),
              },
              {
                title: "납품 도착지",
                render: (_, record) =>
                  record.orderStock?.dstLocation.name ??
                  record.orderProcess?.srcLocation.name,
              },
              {
                title: "매출 상태",
                dataIndex: "status",
                render: (value: Model.Enum.OrderStatus) => (
                  <div
                    className={classNames("flex gap-x-2", {
                      "text-amber-600": Util.inc(
                        value,
                        "OFFER_PREPARING",
                        "ORDER_PREPARING"
                      ),
                      "text-green-600": Util.inc(
                        value,
                        "OFFER_REQUESTED",
                        "ORDER_REQUESTED"
                      ),
                      "text-red-600": Util.inc(
                        value,
                        "OFFER_REJECTED",
                        "ORDER_REJECTED"
                      ),
                      "text-black": Util.inc(value, "ACCEPTED"),
                    })}
                  >
                    <div className="flex-initial flex flex-col justify-center">
                      <Icon.OrderStatus value={value} />
                    </div>
                    <div className="flex-initial flex flex-col justify-center">
                      {Util.orderStatusToString(value)}
                    </div>
                  </div>
                ),
              },
              ...Table.Preset.columnStockGroup<Model.Order>((record) =>
                Util.assignStockFromOrder(record)
              ),
              ...Table.Preset.columnQuantity<Model.Order>(
                (record) => Util.assignStockFromOrder(record),
                (record) => Util.assignQuantityFromOrder(record),
                { prefix: "매출", negative: false }
              ),
            ]}
          />
        </div>
        <div className="flex-initial basis-px bg-gray-200" />
        <div className="flex-initial p-2 flex justify-center">
          <Button.Default
            label="품목 등록"
            type="primary"
            onClick={cmdSubmit}
            disabled={selected.length === 0}
          />
        </div>
      </div>
    </Popup.Template.Property>
  );
}

function SelectTaxInvoiceManagerEmail(props: {
  companyRegistrationNumber: string;
  onChange?: (
    value:
      | {
          name: string;
          email: string;
        }
      | undefined
  ) => void;
  disabled?: boolean;
}) {
  const taxInvoiceManagers =
    ApiHook.Inhouse.BusinessRelationship.useGetTaxManagerList({
      companyRegistrationNumber: props.companyRegistrationNumber,
    });

  const options = useMemo(() => {
    return taxInvoiceManagers.data?.items.map((x) => ({
      label: (
        <div className="flex font-fixed gap-x-4">
          <div className="flex-1 text-gray-600">{x.email}</div>
          <div className="flex-initial">{x.name}</div>
          <div className="flex-initial whitespace-pre">
            {x.isDefault ? "대표" : "    "}
          </div>
        </div>
      ),
      text: `${x.name} ${x.email}`,
      value: `${x.name}/${x.email}`,
    }));
  }, [taxInvoiceManagers.data]);

  return (
    <Select
      className="w-full"
      placeholder="전자세금계산서 담당자 이메일 선택"
      options={options}
      onChange={(p) =>
        props.onChange?.(
          p
            ? {
                name: p.split("/")[0],
                email: p.split("/")[1],
              }
            : undefined
        )
      }
      disabled={props.disabled}
      allowClear
    />
  );
}

function getQuantity(
  packaging: {
    type: Model.Enum.PackagingType;
    packA: number;
    packB: number;
  },
  quantity: number
): string {
  switch (packaging.type) {
    case "ROLL":
      return `${(quantity / (1000 * 1000)).toFixed(3)}T`;
    case "REAM":
    case "SKID":
      return `${(quantity / 500).toFixed(3)}R`;
    case "BOX":
      return `${quantity}BOX`;
    default:
      return ``;
  }
}

function getOrderItem(order: Model.Order): string {
  let orderType = "";
  let item = "";

  switch (order.orderType) {
    case "NORMAL":
      orderType = order.depositEvent ? "보관출고" : "정상매출";
      break;
    case "DEPOSIT":
      orderType = "매출보관";
      break;
    case "OUTSOURCE_PROCESS":
      orderType = "외주공정매출";
      break;
    case "ETC":
      orderType = "기타매출";
      break;
  }

  if (order.orderType === "NORMAL" && order.orderStock) {
    item =
      order.orderStock.packaging.type +
      " " +
      order.orderStock.product.paperType.name +
      " " +
      order.orderStock.grammage.toString() +
      "g/m²" +
      " " +
      `${order.orderStock.sizeX}X${order.orderStock.sizeY}` +
      " " +
      getQuantity(order.orderStock.packaging, order.orderStock.quantity);
  } else if (order.orderType === "OUTSOURCE_PROCESS" && order.orderProcess) {
    item =
      order.orderProcess.packaging.type +
      " " +
      order.orderProcess.product.paperType.name +
      " " +
      order.orderProcess.grammage.toString() +
      "g/m²" +
      " " +
      `${order.orderProcess.sizeX}X${order.orderProcess.sizeY}` +
      " " +
      getQuantity(order.orderProcess.packaging, order.orderProcess.quantity);
  } else if (order.orderType === "DEPOSIT" && order.orderDeposit) {
    item =
      order.orderDeposit.packaging.type +
      " " +
      order.orderDeposit.product.paperType.name +
      " " +
      order.orderDeposit.grammage.toString() +
      "g/m²" +
      " " +
      `${order.orderDeposit.sizeX}X${order.orderDeposit.sizeY}` +
      " " +
      getQuantity(order.orderDeposit.packaging, order.orderDeposit.quantity);
  } else if (order.orderType === "ETC" && order.orderEtc) {
    item = order.orderEtc.item;
  }

  return `${orderType} ${order.orderNo} ${item}`;
}

function PopupSelectTaxManager(props: {
  open: { companyRegistrationNumber: string; flag: string } | false;
  onClose: (unit: false) => void;
  onSelect: (name: string, email: string, flag: string) => void;
}) {
  const taxManagers = ApiHook.Inhouse.BusinessRelationship.useGetTaxManagerList(
    {
      companyRegistrationNumber: props.open
        ? props.open.companyRegistrationNumber
        : null,
    }
  );

  const [selected, setSelected] = useState<PartnerTaxManager[]>([]);
  const only = Util.only(selected);

  useEffect(() => {
    setSelected([]);
  }, [props.open]);

  return (
    <Popup.Template.Property
      title="담당자 선택"
      open={!!props.open}
      onClose={() => props.onClose(false)}
    >
      <div className="flex flex-col w-full h-full">
        <div className="flex-1">
          <Table.Default<PartnerTaxManager>
            data={taxManagers.data}
            keySelector={(record) => `${record.id}`}
            selected={selected}
            onSelectedChange={setSelected}
            selection="single"
            columns={[
              {
                title: "이름",
                dataIndex: "name",
              },
              {
                title: "이메일",
                dataIndex: "email",
              },
            ]}
          />
        </div>
        <div className="flex-initial basis-px bg-gray-200" />
        <div className="flex-initial p-2 flex justify-center">
          <Button.Default
            label="선택"
            type="primary"
            onClick={() => {
              if (only && props.open)
                props.onSelect(only.name, only.email, props.open.flag);
              props.onClose(false);
            }}
            disabled={!only}
          />
        </div>
      </div>
    </Popup.Template.Property>
  );
}

type PopupIssueOpenType = { certUrl: string; taxInvoiceId: number } | false;
function PopupIssue(props: {
  open: PopupIssueOpenType;
  onClose: (unit: false) => void;
  trySend: () => void;
}) {
  const apiIssue = ApiHook.Tax.TaxInvoice.useIssueInvoice();
  const cmdIssue = useCallback(async () => {
    if (!props.open) return;
    if (!(await Util.confirm("전자세금계산서를 다시 발행하시겠습니까?")))
      return;

    const resp = await apiIssue.mutateAsync({
      id: props.open.taxInvoiceId,
    });

    if (resp.certUrl) {
      if (
        !(await Util.confirm(
          "공인인증서가 정상적으로 등록되지 않았습니다. 다시 등록하시겠습니까?"
        ))
      )
        return;
      window.open(
        resp.certUrl,
        "공인인증서 등록",
        "width=1100,height=800,location=no,toolbar=no,status=no"
      );
    } else {
      if (await Util.confirm("국세청에 즉시 전송하시겠습니까?")) {
        props.trySend();
      }
      props.onClose(false);
    }
  }, [apiIssue, props.open]);

  return (
    <Modal
      open={!!props.open}
      maskClosable={false}
      closable={false}
      footer={null}
      centered
      className="custom-modal"
    >
      <div className="flex flex-col justify-center p-4 gap-y-4">
        <div className="flex-initial text-center text-lg font-bold">
          공인인증서 등록이 필요합니다.
        </div>
        <div className="flex-initial text-center">
          공인인증서 등록 팝업에서 인증서를 등록하신 다음,
          <br />
          아래 '다시 발행' 버튼을 눌러주세요.
        </div>
        <div className="flex-initial flex justify-center gap-x-2">
          <Button.Default label="다시 발행" type="primary" onClick={cmdIssue} />
          <Button.Default label="취소" onClick={() => props.onClose(false)} />
        </div>
      </div>
    </Modal>
  );
}

type PopupSendOpenType = { certUrl: string; taxInvoiceId: number } | false;
function PopupSend(props: {
  open: PopupSendOpenType;
  onClose: (unit: false) => void;
}) {
  const apiSend = ApiHook.Tax.TaxInvoice.useSendInvoice();
  const cmdSend = useCallback(async () => {
    if (!props.open) return;
    if (!(await Util.confirm("전자세금계산서를 다시 전송하시겠습니까?")))
      return;

    const resp = await apiSend.mutateAsync({
      id: props.open.taxInvoiceId,
    });

    if (resp.certUrl) {
      if (
        !(await Util.confirm(
          "공인인증서가 정상적으로 등록되지 않았습니다. 다시 등록하시겠습니까?"
        ))
      )
        return;
      window.open(
        resp.certUrl,
        "공인인증서 등록",
        "width=1100,height=800,location=no,toolbar=no,status=no"
      );
    } else {
      props.onClose(false);
    }
  }, [apiSend, props.open]);

  return (
    <Modal
      open={!!props.open}
      maskClosable={false}
      closable={false}
      footer={null}
      centered
      className="custom-modal"
    >
      <div className="flex flex-col justify-center p-4 gap-y-4">
        <div className="flex-initial text-center text-lg font-bold">
          공인인증서 등록이 필요합니다.
        </div>
        <div className="flex-initial text-center">
          공인인증서 등록 팝업에서 인증서를 등록하신 다음,
          <br />
          아래 '다시 전송' 버튼을 눌러주세요.
        </div>
        <div className="flex-initial flex justify-center gap-x-2">
          <Button.Default label="다시 전송" type="primary" onClick={cmdSend} />
          <Button.Default label="취소" onClick={() => props.onClose(false)} />
        </div>
      </div>
    </Modal>
  );
}

type PopupCancelIssueOpenType =
  | { certUrl: string; taxInvoiceId: number }
  | false;
function PopupCancelIssue(props: {
  open: PopupCancelIssueOpenType;
  onClose: (unit: false) => void;
}) {
  const apiCancelIssue = ApiHook.Tax.TaxInvoice.useCancelIssueInvoice();
  const cmdCancelIssue = useCallback(async () => {
    if (!props.open) return;
    if (
      !(await Util.confirm("전자세금계산서 발행 취소를 다시 요청하시겠습니까?"))
    )
      return;

    const resp = await apiCancelIssue.mutateAsync({
      id: props.open.taxInvoiceId,
    });

    if (resp.certUrl) {
      if (
        !(await Util.confirm(
          "공인인증서가 정상적으로 등록되지 않았습니다. 다시 등록하시겠습니까?"
        ))
      )
        return;
      window.open(
        resp.certUrl,
        "공인인증서 등록",
        "width=1100,height=800,location=no,toolbar=no,status=no"
      );
    } else {
      props.onClose(false);
    }
  }, [apiCancelIssue, props.open]);

  return (
    <Modal
      open={!!props.open}
      maskClosable={false}
      closable={false}
      footer={null}
      centered
      className="custom-modal"
    >
      <div className="flex flex-col justify-center p-4 gap-y-4">
        <div className="flex-initial text-center text-lg font-bold">
          공인인증서 등록이 필요합니다.
        </div>
        <div className="flex-initial text-center">
          공인인증서 등록 팝업에서 인증서를 등록하신 다음,
          <br />
          아래 '발행 취소 다시 요청' 버튼을 눌러주세요.
        </div>
        <div className="flex-initial flex justify-center gap-x-2">
          <Button.Default
            label="발행 취소 다시 요청"
            type="primary"
            onClick={cmdCancelIssue}
          />
          <Button.Default label="취소" onClick={() => props.onClose(false)} />
        </div>
      </div>
    </Modal>
  );
}

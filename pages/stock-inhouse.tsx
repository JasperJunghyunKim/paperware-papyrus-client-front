import { Model } from "@/@shared";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import { Popup, Search, StatBar, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { useEffect, useState } from "react";
import { TbMapPin, TbMapPinFilled } from "react-icons/tb";
import { OpenType as DetailOpenType } from "../components/popup/stock/Detail";
import { CartListResponse } from "@/@shared/api/trade/cart.response";
import { PopupCartCreateOpenType } from "@/components/popup/cart/Create";

export default function Component() {
  const me = ApiHook.Auth.useGetMe();
  const [openCreate, setOpenCreate] = useState(false);
  const [openCreateArrival, setOpenCreateArrival] = useState(false);
  const [openModify, setOpenModify] = useState<number | false>(false);
  const [openDetail, setOpenDetail] = useState<DetailOpenType | false>(false);
  const [openPrint, setOpenPrint] = useState<number | false>(false);

  const [search, setSearch] = useState<any>({});
  const [groupPage, setGroupPage] = usePage();
  const groupList = ApiHook.Stock.StockInhouse.useGetGroupList({
    query: {
      ...groupPage,
      ...search,
    },
  });
  const [selectedGroup, setSelectedGroup] = useState<Model.StockGroup[]>([]);

  const onlyGroup = Util.only(selectedGroup);
  const list = ApiHook.Stock.StockInhouse.useGetList({
    query: {
      productId: onlyGroup?.product.id,
      packagingId: onlyGroup?.packaging?.id,
      sizeX: onlyGroup?.sizeX,
      sizeY: onlyGroup?.sizeY,
      grammage: onlyGroup?.grammage,
      paperColorGroupId: onlyGroup?.paperColorGroup?.id,
      paperColorId: onlyGroup?.paperColor?.id,
      paperPatternId: onlyGroup?.paperPattern?.id,
      paperCertId: onlyGroup?.paperCert?.id,
      warehouseId: onlyGroup?.warehouse?.id,
      planId: onlyGroup?.plan?.id,
    },
  });
  const [selected, setSelected] = useState<Model.Stock[]>([]);
  const only = Util.only(selected);

  // cart
  const [openCartCreate, setOpenCartCreate] =
    useState<PopupCartCreateOpenType>(false);
  const cartList = ApiHook.Cart.useGetList({
    type: "SALES",
  });
  const [selectedCart, setSelectedCart] = useState<Model.Cart[]>([]);
  const onlyCart = Util.only(selectedCart);
  const apiDeleteCart = ApiHook.Cart.useDelete();
  const cmdDeleteCart = async () => {
    if (
      !onlyCart ||
      !(await Util.confirm("선택한 장바구니 항목을 삭제하시겠습니까?"))
    ) {
      return;
    }

    await apiDeleteCart.mutateAsync({ path: { id: onlyCart.id } });
    setSelectedCart([]);
  };

  useEffect(() => {
    setSelected([]);
  }, [selectedGroup]);

  return (
    <Page title="자사 재고 관리" menu={Const.Menu.STOCK_INHOUSE}>
      <StatBar.Container>
        <StatBar.Item icon={<TbMapPinFilled />} label="자사 재고" value={"-"} />
        <StatBar.Item
          icon={<TbMapPin />}
          label="보관 재고"
          value={"-"}
          iconClassName="text-purple-800"
        />
      </StatBar.Container>
      <Toolbar.Container>
        <Toolbar.ButtonPreset.Create
          label="자사 재고 추가"
          onClick={() => setOpenCreate(true)}
        />
        <Toolbar.ButtonPreset.Create
          label="예정 재고 추가"
          onClick={() => setOpenCreateArrival(true)}
        />
        <div className="flex-1" />
        <Toolbar.Button
          label="장바구니 추가"
          onClick={() =>
            onlyGroup &&
            me.data &&
            setOpenCartCreate({
              companyId: me.data.companyId,
              warehouseId: onlyGroup.warehouse?.id ?? null,
              planId: onlyGroup.plan?.id ?? null,
              product: onlyGroup.product,
              packaging: onlyGroup.packaging,
              grammage: onlyGroup.grammage,
              sizeX: onlyGroup.sizeX,
              sizeY: onlyGroup.sizeY,
              paperColorGroup: onlyGroup.paperColorGroup,
              paperColor: onlyGroup.paperColor,
              paperPattern: onlyGroup.paperPattern,
              paperCert: onlyGroup.paperCert,
            })
          }
          disabled={!onlyGroup}
        />
        <Toolbar.Button
          label="재고 내역 상세"
          onClick={() =>
            onlyGroup && !onlyGroup.plan && setOpenDetail(onlyGroup)
          }
          disabled={!onlyGroup || !!onlyGroup.plan}
        />
        <Toolbar.ButtonPreset.Print
          label="재고 라벨 출력"
          onClick={() => only && setOpenPrint(only.id)}
          disabled={!only}
        />
        <Toolbar.ButtonPreset.Update
          label="재고 수량 수정"
          onClick={() => only && setOpenModify(only.id)}
          disabled={!only}
        />
      </Toolbar.Container>
      <Search
        items={[
          {
            type: "select-warehouse",
            field: "warehouseIds",
            label: "창고",
          },
          {
            type: "select-packaging",
            field: "packagingIds",
            label: "포장",
          },
          {
            type: "select-papertype",
            field: "paperTypeIds",
            label: "지종",
          },
          {
            type: "select-manufacturer",
            field: "manufacturerIds",
            label: "제지사",
          },
          {
            type: "range",
            field: "grammage",
            label: "평량",
          },
          {
            type: "number",
            field: "sizeX",
            label: "지폭",
          },
          {
            type: "number",
            field: "sizeY",
            label: "지장",
          },
          {
            type: "check",
            field: "isZeroQuantityIncluded",
            label: "소진된 재고 포함",
          },
        ]}
        value={search}
        onSearch={setSearch}
      />
      <Table.Default<Model.StockGroup>
        data={groupList.data}
        keySelector={(record) => Util.keyOfStockGroup(record)}
        selected={selectedGroup}
        onSelectedChange={setSelectedGroup}
        selection="single"
        columns={Table.Preset.stockGroup({
          lossRate: (record) => record.lossRate,
        })}
        page={groupPage}
        setPage={setGroupPage}
      />
      <Table.Default<Model.Stock>
        data={list.data}
        keySelector={(record) => `${record.id}`}
        selected={selected}
        onSelectedChange={setSelected}
        selection="single"
        columns={Table.Preset.columnStock()}
      />
      <Toolbar.Container>
        <div className="flex-1" />
        <Toolbar.Button
          label="항목 제거"
          type="danger"
          onClick={cmdDeleteCart}
          disabled={!onlyCart}
        />
      </Toolbar.Container>
      <Table.Simple<Model.Cart>
        data={cartList.data}
        columns={Table.Preset.cart({
          type: "SALES",
        })}
        keySelector={(record) => `${record.id}`}
        selected={selectedCart}
        onSelectedChange={setSelectedCart}
        selection="multiple"
      />
      <Popup.Stock.Create open={openCreate} onClose={setOpenCreate} />
      <Popup.Stock.Create
        open={openCreateArrival}
        onClose={setOpenCreateArrival}
        arrival
      />
      <Popup.Stock.Modify open={openModify} onClose={setOpenModify} />
      <Popup.Stock.Detail open={openDetail} onClose={setOpenDetail} />
      <Popup.Stock.Print open={openPrint} onClose={setOpenPrint} />
      <Popup.Cart.Create
        type="SALES"
        open={openCartCreate}
        onClose={setOpenCartCreate}
      />
    </Page>
  );
}

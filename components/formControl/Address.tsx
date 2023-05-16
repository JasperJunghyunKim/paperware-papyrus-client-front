import { Util } from "@/common";
import { Form, Input } from "antd";
import { useCallback } from "react";
import { useDaumPostcodePopup } from "react-daum-postcode";
import { TbSearch } from "react-icons/tb";

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function Component(props: Props) {
  const postcode = useDaumPostcodePopup(
    "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
  );

  const value = Util.decodeAddress(props.value);

  const selectPostCode = useCallback(() => {
    postcode({
      onComplete: (data) => {
        props.onChange?.(
          Util.encodeAddress({
            roadAddress: data.roadAddress,
            roadAddressEnglish: data.roadAddressEnglish,
            jibunAddress: data.jibunAddress,
            jibunAddressEnglish: data.jibunAddressEnglish,
            zonecode: data.zonecode,
            detail: value.detail,
          })
        );
      },
    });
  }, [postcode, props, value.detail]);

  const updateDetail = useCallback(
    (detail: string) => {
      props.onChange?.(
        Util.encodeAddress({
          roadAddress: value.roadAddress,
          roadAddressEnglish: value.roadAddressEnglish,
          jibunAddress: value.jibunAddress,
          jibunAddressEnglish: value.jibunAddressEnglish,
          zonecode: value.zonecode,
          detail,
        })
      );
    },
    [
      props,
      value.jibunAddress,
      value.jibunAddressEnglish,
      value.roadAddress,
      value.roadAddressEnglish,
      value.zonecode,
    ]
  );

  return (
    <div className="flex flex-col gap-y-1">
      <Input
        addonBefore={<Addon label="우편 번호" />}
        addonAfter={<AddonAfter onClick={() => selectPostCode()} />}
        value={value.zonecode}
        rootClassName="custom-addon"
        readOnly
        disabled={props.disabled}
      />
      <Input
        addonBefore={<Addon label="도로명 주소" />}
        value={value.roadAddress}
        rootClassName="custom-addon"
        readOnly
        disabled={props.disabled}
      />
      <Input
        addonBefore={<Addon label="지번 주소" />}
        value={value.jibunAddress}
        rootClassName="custom-addon"
        readOnly
        disabled={props.disabled}
      />
      <Input
        addonBefore={<Addon label="상세 주소" />}
        value={value.detail}
        onChange={(p) => updateDetail(p.target.value ?? "")}
        rootClassName="custom-addon"
        disabled={props.disabled}
      />
    </div>
  );
}

function Addon(props: { label: string }) {
  return <div className="w-24">{props.label}</div>;
}

function AddonAfter(props: { onClick: () => void }) {
  return (
    <div
      className="cursor-pointer w-full h-full px-4"
      onClick={() => props.onClick()}
    >
      <TbSearch />
    </div>
  );
}

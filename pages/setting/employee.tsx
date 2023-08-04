import {
  UserCreateRequest,
  UserUpdateRequest,
} from "@/@shared/api/setting/user.request";
import { SettingUserResponse } from "@/@shared/api/setting/user.response";
import { User } from "@/@shared/models";
import { ApiHook, Const, Util } from "@/common";
import { usePage } from "@/common/hook";
import * as R from "@/common/rules";
import { Button, FormControl, Popup, Table, Toolbar } from "@/components";
import { Page } from "@/components/layout";
import { Form, Input, message } from "antd";
import { useForm, useWatch } from "antd/lib/form/Form";
import classNames from "classnames";
import { useEffect, useState } from "react";
import {
  TbLock,
  TbLockOpen,
  TbManualGearbox,
  TbUserCircle,
  TbUserPlus,
} from "react-icons/tb";

export default function Component() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<number | false>(false);

  const [page, setPage] = usePage();
  const list = ApiHook.Setting.User.useGetList({ query: page });

  const me = ApiHook.Auth.useGetMe();

  const [selected, setSelected] = useState<SettingUserResponse[]>([]);
  const only = Util.only(selected);

  useEffect(() => {
    setSelected([]);
  }, [list.data]);

  const apiSetAdmin = ApiHook.Setting.User.useSetAdmin();
  const cmdSetAdmin = async () => {
    if (!only || only.isAdmin) return;
    if (!(await Util.confirm("관리자로 지정하시겠습니까?"))) return;

    await apiSetAdmin.mutateAsync({ userId: only.id });
  };

  const apiSetActivated = ApiHook.Setting.User.useSetActivated();
  const cmdSetActivated = (isActivated: boolean) => async () => {
    if (!only || only.isActivated === isActivated) return;
    if (!(await Util.confirm("계정 활성 상태를 변경하시겠습니까?"))) return;

    await apiSetActivated.mutateAsync({
      userId: only.id,
      data: { isActivated },
    });
  };

  return (
    <Page title="직원 설정" menu={Const.Menu.SETTING_USER}>
      <Toolbar.Container>
        {me.data?.isAdmin && (
          <Toolbar.ButtonPreset.Create
            label="직원 추가"
            onClick={() => setOpenCreate(true)}
          />
        )}
        <div className="flex-1" />
        {only && only.isActivated && !only.isAdmin && me.data?.isAdmin && (
          <Toolbar.Button
            icon={<TbLock />}
            label="선택 직원 비활성"
            onClick={cmdSetActivated(false)}
          />
        )}
        {only && !only.isActivated && !only.isAdmin && me.data?.isAdmin && (
          <Toolbar.Button
            icon={<TbLockOpen />}
            label="선택 직원 활성"
            onClick={cmdSetActivated(true)}
          />
        )}
        {only && only.isActivated && me.data?.isAdmin && (
          <Toolbar.Button
            icon={<TbUserCircle />}
            label="관리자 지정"
            onClick={cmdSetAdmin}
          />
        )}
        {only && me.data?.isAdmin && (
          <Toolbar.ButtonPreset.Update
            label="상세 정보"
            onClick={() => only && setOpenUpdate(only.id)}
          />
        )}
      </Toolbar.Container>
      <Table.Default<SettingUserResponse>
        data={list.data}
        page={page}
        setPage={setPage}
        keySelector={(item) => item.id}
        selected={selected}
        onSelectedChange={setSelected}
        columns={[
          {
            title: "아이디",
            render: (record: User) => (
              <div className="font-fixed">{record.username}</div>
            ),
          },
          {
            title: "관리자 구분",
            render: (record: User) => (record.isAdmin ? "관리자" : "일반"),
          },
          { title: "이름", dataIndex: "name" },
          {
            title: "전화번호",
            render: (record: User) => Util.formatPhoneNo(record.phoneNo),
          },
          {
            title: "이메일",
            dataIndex: "email",
          },
          {
            title: "계정 상태",
            render: (record: User) => (record.isActivated ? "활성" : "비활성"),
          },
        ]}
      />
      <PopupCreateUser open={openCreate} onClose={setOpenCreate} />
      <PopupUpdateUser open={openUpdate} onClose={setOpenUpdate} />
    </Page>
  );
}

interface PopupCreateUserProps {
  open: boolean;
  onClose: (unit: false) => void;
}
function PopupCreateUser(props: PopupCreateUserProps) {
  const [form] = useForm<UserCreateRequest>();
  const username = useWatch("username", form);
  const password = useWatch("password", form);

  const [idChecked, setIdChecked] = useState<boolean | null>(null);

  useEffect(() => {
    form.resetFields();
  }, [props.open]);

  useEffect(() => setUsernameCheck(null), [username]);

  const [usernameCheck, setUsernameCheck] = useState<string | null>(null);
  const apiCheckId = ApiHook.Setting.User.useCheckId({
    query: usernameCheck ? { username: usernameCheck } : null,
  });

  const apiCreateUser = ApiHook.Setting.User.useCreateUser();
  const cmdCreateUser = async () => {
    if (!idChecked) {
      message.error("아이디 중복 확인이 필요합니다.");
      return;
    }

    const values = await form.validateFields();
    await apiCreateUser.mutateAsync({ data: values });

    props.onClose(false);
  };

  useEffect(() => {
    if (!apiCheckId.data) {
      setIdChecked(null);
    } else {
      setIdChecked(!apiCheckId.data.isExists);
    }
  }, [apiCheckId.data]);

  const isPasswordEmpty = !password || password.length === 0;

  return (
    <Popup.Template.Property title="직원 추가" {...props} open={!!props.open}>
      <div className="flex-1 p-4 flex flex-col">
        <Form layout="vertical" form={form}>
          <Form.Item
            label="아이디"
            name="username"
            dependencies={["username"]}
            rules={[
              R.length(1, 20),
              R.pattern(
                /^[a-zA-Z0-9_]+$/,
                "영문, 숫자, 언더스코어(_)만 입력 가능합니다."
              ),
            ]}
          >
            <Input />
          </Form.Item>
          <div className="flex-initial flex py-2 gap-x-2">
            <Button.Default
              label="아이디 중복 확인"
              onClick={() => setUsernameCheck(username)}
            />
            <div
              className={classNames("flex-1 flex items-center text-sm", {
                "text-red-500": idChecked === false,
                "text-green-500": idChecked === true,
                "text-gray-500": idChecked === null,
              })}
            >
              {idChecked === null
                ? "아이디 중복 확인이 필요합니다."
                : idChecked === false
                ? "이미 사용 중인 아이디입니다."
                : "사용 가능한 아이디입니다."}
            </div>
          </div>

          <Form.Item
            label={"비밀번호"}
            name={"password"}
            rules={[R.password()]}
            hasFeedback={!isPasswordEmpty}
          >
            <Input.Password placeholder="비밀번호를 입력하세요." />
          </Form.Item>
          {!isPasswordEmpty && (
            <>
              <Form.Item
                label={"비밀번호 확인"}
                name={"_passwordConfirm"}
                hasFeedback
                dependencies={["password"]}
                rules={[R.confirm("password")]}
              >
                <Input.Password placeholder="비밀번호를 다시 입력하세요." />
              </Form.Item>
            </>
          )}
          <Form.Item
            label={"이름"}
            name={"name"}
            rules={[R.required(), R.length(1, 20)]}
          >
            <Input placeholder="이름을 입력하세요." />
          </Form.Item>
          <Form.Item
            label={"생년월일"}
            name={"birthDate"}
            rules={[R.required()]}
          >
            <FormControl.DatePicker />
          </Form.Item>
          <Form.Item label={"이메일"} name={"email"} rules={[R.email()]}>
            <Input placeholder="이메일을 입력하세요." />
          </Form.Item>
          <div className="flex-initial flex py-2">
            <Button.Default
              label="직원 등록"
              onClick={cmdCreateUser}
              type="primary"
            />
          </div>
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

interface PopupUpdateUserProps {
  open: number | false;
  onClose: (unit: false) => void;
}
function PopupUpdateUser(props: PopupUpdateUserProps) {
  const [form] = useForm<UserUpdateRequest & { _passwordConfirm: string }>();
  const password = useWatch("password", form);

  const user = ApiHook.Setting.User.useGetItem({
    userId: props.open ? props.open : null,
  });

  const apiUpdateUser = ApiHook.Setting.User.useUpdateUser();
  const cmdUpdateUser = async () => {
    if (!props.open) return;

    const values = await form.validateFields();
    await apiUpdateUser.mutateAsync({ userId: props.open, data: values });
  };

  const isPasswordEmpty = !password || password.length === 0;

  useEffect(() => {
    if (!user.data) return;

    form.setFieldsValue({
      password: undefined,
      name: user.data.name,
      birthDate: user.data.birthDate ?? undefined,
      email: user.data.email ?? undefined,
      _passwordConfirm: undefined,
    });
  }, [user.data]);

  return (
    <Popup.Template.Property title="직원 추가" {...props} open={!!props.open}>
      <div className="flex-1 p-4 flex flex-col">
        <Form layout="vertical" form={form}>
          <Form.Item label="아이디">
            <Input disabled value={user.data?.username} />
          </Form.Item>
          <Form.Item
            label={"비밀번호 변경"}
            name={"password"}
            rules={[R.password()]}
            hasFeedback={!isPasswordEmpty}
          >
            <Input.Password placeholder="비밀번호를 입력하세요." />
          </Form.Item>
          {!isPasswordEmpty && (
            <>
              <Form.Item
                label={"비밀번호 확인"}
                name={"_passwordConfirm"}
                hasFeedback
                dependencies={["password"]}
                rules={[R.confirm("password")]}
              >
                <Input.Password placeholder="비밀번호를 다시 입력하세요." />
              </Form.Item>
            </>
          )}
          <Form.Item
            label={"이름"}
            name={"name"}
            rules={[R.required(), R.length(1, 20)]}
          >
            <Input placeholder="이름을 입력하세요." />
          </Form.Item>
          <Form.Item
            label={"생년월일"}
            name={"birthDate"}
            rules={[R.required()]}
          >
            <FormControl.DatePicker />
          </Form.Item>
          <Form.Item label={"이메일"} name={"email"} rules={[R.email()]}>
            <Input placeholder="이메일을 입력하세요." />
          </Form.Item>
          <div className="flex-initial flex py-2">
            <Button.Default
              label="직원 수정"
              onClick={cmdUpdateUser}
              type="primary"
            />
          </div>
        </Form>
      </div>
    </Popup.Template.Property>
  );
}

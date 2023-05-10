import "@/styles/globals.css";
import "antd/dist/reset.css";
import type { AppProps } from "next/app";
import { ConfigProvider, Modal } from "antd";
import { QueryClient, QueryClientProvider } from "react-query";
import koKR from "antd/locale/ko_KR";
import axios from "axios";
import { useEffect, useState } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      onError: (error: any) => {
        Modal.error({
          title: "오류",
          content: error.message,
        });
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${
      localStorage.getItem("at") ?? ""
    }`;
    setInit(true);
  }, []);

  return (
    <ConfigProvider
      theme={{
        components: {
          Switch: {
            colorPrimaryBg: "#000000",
            colorFill: "#000000",
          },
          Table: {
            colorBorderSecondary: "rgb(229, 231, 235)",
          },
        },
        token: {
          motionDurationMid: "0.0s",
          fontFamily: "Noto Sans KR",
          borderRadius: 2,
          colorTextDisabled: "black",
        },
      }}
      locale={koKR}
    >
      <QueryClientProvider client={queryClient}>
        {init && <Component {...pageProps} />}
      </QueryClientProvider>
    </ConfigProvider>
  );
}

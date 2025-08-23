import { useEffect, useState } from "react";
import { Outlet } from "react-router";

import type { responseType } from "../lib/Request";
import { findAll } from "../lib/ContentFetch";
import { ContentContextProvider } from "../lib/ContentContext";

import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Layout() {
  const [contentList, setContentList] = useState<responseType[]>([]);

  const fetchContentList = async () => {
    const { status, result, error } = await findAll();
    if (status) {
      if (Array.isArray(result) && result.length > 0) {
        setContentList(result);
      }
    } else {
      console.warn(error);
    }
  };

  useEffect(() => {
    fetchContentList();
  }, []);

  return (
    <ContentContextProvider
      value={{ contentList, fetchContentList, setContentList }}
    >
      <Sidebar />
      <div className="main">
        <Outlet />
        <Footer />
      </div>
    </ContentContextProvider>
  );
}

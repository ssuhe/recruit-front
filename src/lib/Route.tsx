import { BrowserRouter, Routes, Route } from "react-router";

import Layout from "../components/Layout";
import Memo from "../pages/Memo";
import NotFound from "../pages/NotFound";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Memo />}></Route>
          <Route path="/:id" element={<Memo />}></Route>
          <Route path="*" element={<NotFound />}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

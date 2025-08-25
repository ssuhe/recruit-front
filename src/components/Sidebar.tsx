import { useState } from "react";

import { useContentContext } from "../lib/ContentContext";
import type { responseType } from "../lib/Request";
import { create } from "../lib/ContentFetch";

import SidebarItem from "./SidebarItem";
import { AddButton, DoneButton, EditButton } from "./Button";
import { Logo } from "../lib/Icons";

import { toast } from "react-toastify";
const body = {
  body: "",
  title: "New Content",
};

const Sidebar = () => {
  const [isEditable, setIsEditable] = useState(false);
  const { contentList, setContentList } = useContentContext();

  const toggleMode = () => setIsEditable(!isEditable);
  const addNewContent = async () => {
    const { status, result } = await create(body);
    if (status) {
      setContentList([...contentList, result as responseType]);
      toast.success(`New Page Created: ${(result as responseType).id}`);
    }
  };

  const Button = isEditable ? DoneButton : EditButton;

  return (
    <ul className="sidebar">
      {/* Logo */}
      <div className="header">
        <Logo />
        <span>ServiceName</span>
      </div>

      <div className="content-list">
        {/* Page title list */}
        {contentList.map((content, key) => (
          <SidebarItem key={key} {...content} isEditable={isEditable} />
        ))}
      </div>

      {/* Action buttons */}
      <div className="actions">
        {isEditable ? <AddButton onClick={addNewContent} /> : <div></div>}
        <Button onClick={toggleMode} />
      </div>
    </ul>
  );
};

export default Sidebar;

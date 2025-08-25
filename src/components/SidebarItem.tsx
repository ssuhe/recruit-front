import { NavLink, useLocation } from "react-router";

import { useContentContext } from "../lib/ContentContext";
import type { responseType } from "../lib/Request";
import { deleteOne } from "../lib/ContentFetch";
import { DeleteIcon } from "../lib/Icons";
import { useEffect, useRef } from "react";
import { toast } from "react-toastify";

type SidebarItemProps = responseType & {
  isEditable: boolean;
};

const SidebarItem = ({ title, id, isEditable }: SidebarItemProps) => {
  const { pathname } = useLocation();
  const me = useRef<HTMLAnchorElement>(null);
  const isActive = pathname === `/${id}`;

  const { contentList, setContentList } = useContentContext();

  const deleteContent = async () => {
    const { status, error } = await deleteOne(id);
    if (status) {
      const newContentList = contentList.filter((content) => content.id !== id);
      setContentList(newContentList);
      toast.success(`Deleted: ${id}`);
    } else {
      console.warn(error);
      toast.error(`Deleted Error: ${id}`);
    }
  };

  useEffect(() => {
    if (isActive && me.current) {
      me.current.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [isActive]);

  return (
    <NavLink
      ref={me}
      className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
      to={`/${id}`}
    >
      <span className="sidebar-link">{title}</span>
      {isEditable && (
        <DeleteIcon className="delete-icon" onClick={deleteContent} />
      )}
    </NavLink>
  );
};

export default SidebarItem;

import { useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import editIcon from "../assets/edit.svg";
import deleteIcon from "../assets/delete.svg";
import plusIcon from "../assets/+.svg";
import doneIcon from "../assets/done.svg";
import cancelIcon from "../assets/cancel.svg";
import saveIcon from "../assets/save.svg";

const base = "http://localhost:3000";

const resolveUrl = (path) => {
  return `${base}${path}`;
};

export default function Memo() {
  const [titles, setTitles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newPages, setNewPages] = useState([]);

  const [sidebarEdit, setSidebarEdit] = useState(false);
  const [titleEdit, setTitleEdit] = useState(false);
  const [bodyEdit, setBodyEdit] = useState(false);

  const handleSidebarEditClick = () => {
    setSidebarEdit(!sidebarEdit);
  };

  const handleNewPageButtonClick = async () => {
    try {
      const response = await fetch(resolveUrl("/content"), {
        method: "POST",
        body: JSON.stringify({
          title: "New Page",
          body: "",
        }),
        headers: {
          "Content-type": "application/json",
          Accept: "application/json",
        },
      });

      const result = await response.json();
      console.log(result);
      setTitles([...titles, result]);
    } catch (error) {}
  };
  const handleMenuSaveButtonClick = () => {};

  const handleTitleEditClick = () => {
    if (titleEdit) {
      setSelected(titles.find((t) => t.id === selected.id));
    }
    setTitleEdit(!titleEdit);
  };

  const handleSaveBody = async () => {
    try {
      if (confirm("Update?")) {
        const response = await fetch(resolveUrl(`/content/${selected.id}`), {
          method: "PUT",
          body: JSON.stringify({
            body: selected.body,
          }),
          headers: {
            "Content-type": "application/json",
            Accept: "application/json",
          },
        });

        if (response.status !== 200) throw new Error("Error");
        alert("Updated!");
        handleTitleEditClick();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveTitle = async () => {
    try {
      if (confirm("Update?")) {
        const response = await fetch(resolveUrl(`/content/${selected.id}`), {
          method: "PUT",
          body: JSON.stringify({
            title: selected.title,
          }),
          headers: {
            "Content-type": "application/json",
            Accept: "application/json",
          },
        });

        if (response.status !== 200) throw new Error("Error");
        alert("Updated!");
        handleTitleEditClick();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBodyEditClick = () => {
    if (bodyEdit) {
      setSelected(titles.find((t) => t.id === selected.id));
    }
    setBodyEdit(!bodyEdit);
  };

  const handleSelect = (id) => () => {
    setSelected(titles.find((title) => title.id === id));
  };

  const deletePage = (id) => async () => {
    try {
      if (confirm(`Deleted ? ${id}`)) {
        const response = await fetch(resolveUrl(`/content/${id}`), {
          method: "DELETE",
        });
        if (response.status !== 204) throw new Error("Error");
        alert("Deleted!");
        setTitles(titles.filter((t) => t.id !== id));
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const getData = async () => {
    try {
      const response = await fetch(resolveUrl("/content"));
      const result = await response.json();
      setTitles(result);

      if (result.length > 0) {
        setSelected(result[0]);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <div className="pt-3 pl-4 border-right-1">
        <div className="mb-2">
          <img src={logo} alt="logo" />
          <span>ServiceName</span>
        </div>

        {titles.map((title) => (
          <div onClick={handleSelect(title.id)} key={title.id}>
            <span>{title.title}</span>
            {sidebarEdit && (
              <img
                onClick={deletePage(title.id)}
                src={deleteIcon}
                alt="delete-page"
              />
            )}
          </div>
        ))}

        <div>
          {sidebarEdit && (
            <button onClick={handleNewPageButtonClick}>
              <img src={plusIcon} alt="new-page" />
              <span>New page</span>
            </button>
          )}
          <button onClick={handleSidebarEditClick}>
            <img src={sidebarEdit ? doneIcon : editIcon} alt="menu-edit" />
            <span>{sidebarEdit ? "Done" : "Edit"}</span>
          </button>
        </div>
      </div>
      <div>
        <div>
          <input
            onChange={(e) =>
              setSelected({ ...selected, title: e.target.value })
            }
            readOnly={!titleEdit}
            value={selected ? selected.title : ""}
          />
          <div>
            {titleEdit ? (
              <>
                <button onClick={handleTitleEditClick}>
                  <img src={cancelIcon} alt="sidebar-edit" />
                  <span>Cancel</span>
                </button>
                <button onClick={handleSaveTitle}>
                  <img src={saveIcon} alt="sidebar-edit" />
                  <span>Save</span>
                </button>
              </>
            ) : (
              <button onClick={handleTitleEditClick}>
                <img src={editIcon} alt="sidebar-edit" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
          }}
        >
          <textarea
            onChange={(e) => setSelected({ ...selected, body: e.target.value })}
            disabled={!bodyEdit}
            value={selected ? selected.body : ""}
          ></textarea>
          <div>
            {bodyEdit ? (
              <>
                <button onClick={handleBodyEditClick}>
                  <img src={cancelIcon} alt="sidebar-edit" />
                  <span>Cancel</span>
                </button>
                <button onClick={handleSaveBody}>
                  <img src={saveIcon} alt="sidebar-edit" />
                  <span>Save</span>
                </button>
              </>
            ) : (
              <button onClick={handleBodyEditClick}>
                <img src={editIcon} alt="sidebar-edit" />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

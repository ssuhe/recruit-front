import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { CancelButton, EditButton, SaveButton } from "../components/Button";
import { useNavigate, useParams } from "react-router";
import { useContentContext } from "../lib/ContentContext";
import { type responseType } from "../lib/Request";
import { findOne, update } from "../lib/ContentFetch";
import NotFound from "./NotFound";
import { toast } from "react-toastify";

type nameType = "title" | "body";

export default function Memo() {
  const navigate = useNavigate();

  const changedRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null
  );

  const inputRef = useRef<HTMLInputElement | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const { contentList, setContentList } = useContentContext();
  const { id } = useParams<{ id: string }>();
  const numericId = useMemo(() => (id ? Number(id) : NaN), [id]);

  const [selectedContent, setSelectedContent] = useState<responseType>({
    id: numericId,
    title: "",
    body: "",
  });

  const [isEditable, setIsEditable] = useState<Record<nameType, boolean>>({
    title: false,
    body: false,
  });

  const handleToggle = (name: nameType) => () => {
    if (isEditable[name]) {
      if (id !== undefined) {
        const newContent = contentList.find((content) => content.id === +id);
        if (newContent) {
          setSelectedContent(newContent);
        }
      }
    }

    setIsEditable({ ...isEditable, [name]: !isEditable[name] });

    changedRef.current = name === "body" ? textRef.current : inputRef.current;
  };

  useEffect(() => {
    if (changedRef && changedRef.current) changedRef.current.focus();
  }, [isEditable]);

  const handleChanges =
    (name: nameType) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.currentTarget.value;

      setSelectedContent((prev) => ({
        ...(prev ?? { id: numericId, title: "", body: "" }),
        [name]: value,
      }));
    };

  const handleUpdate = (name: nameType) => async () => {
    if (!selectedContent) return;
    if (!id) return;
    if (!contentList) return;

    if (name === "title") {
      if (selectedContent.title.length < 1 || selectedContent.title.length > 50)
        return toast.error("1 <= Title <= 50");
    }

    if (name === "body") {
      if (
        selectedContent.body.length < 10 ||
        selectedContent.body.length > 2000
      )
        return toast.error("10 <= Body <= 2000");
    }

    const { status, result } = await update(+id, {
      [name]: selectedContent[name],
    });

    if (status) {
      const newContentList = contentList.map((content) =>
        content.id === +id ? (result as responseType) : content
      );
      setContentList(newContentList);
      toast.success(`Updated: ${id}`);
    }
  };

  useEffect(() => {
    if (id === undefined) {
      if (contentList.length !== 0) navigate(`/${contentList[0].id}`);
      return;
    }

    (async () => {
      const { status, result } = await findOne(parseInt(id));
      if (status && result) {
        setSelectedContent(result as responseType);
      } else {
        navigate(`/error/not-found`);
      }
    })();

    return () => {
      setIsEditable({
        title: false,
        body: false,
      });

      changedRef.current = null;
    };
  }, [contentList, id, numericId]);

  if (Number.isNaN(selectedContent.id)) return <NotFound />;

  return (
    <div className="page" id={id}>
      <div className="title-section">
        <input
          ref={inputRef}
          onChange={handleChanges("title")}
          value={selectedContent.title}
          disabled={!isEditable.title}
        />

        {isEditable.title ? (
          <div className="button-group">
            <CancelButton onClick={handleToggle("title")} />
            <SaveButton onClick={handleUpdate("title")} />
          </div>
        ) : (
          <EditButton onClick={handleToggle("title")} />
        )}
      </div>

      <div className="body-section">
        <textarea
          ref={textRef}
          onChange={handleChanges("body")}
          value={selectedContent.body}
          disabled={!isEditable.body}
        ></textarea>

        {isEditable.body ? (
          <div className="button-group">
            <CancelButton onClick={handleToggle("body")} />
            <SaveButton onClick={handleUpdate("body")} />
          </div>
        ) : (
          <EditButton onClick={handleToggle("body")} />
        )}
      </div>
    </div>
  );
}

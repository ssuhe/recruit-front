import {
  createContext,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { responseType } from "./Request";

type ContentContextType = {
  contentList: responseType[];
  setContentList: Dispatch<SetStateAction<responseType[]>>;
  fetchContentList: () => Promise<responseType[] | responseType>;
};

// 1. Create the context with a proper type
const ContentContext = createContext<ContentContextType | undefined>(undefined);

// 2. Hook to use context safely
export const useContentContext = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error(
      "useContentContext must be used inside ContentContextProvider"
    );
  }
  return context;
};

// 3. Provider component
export const ContentContextProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: any;
}) => {
  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
};

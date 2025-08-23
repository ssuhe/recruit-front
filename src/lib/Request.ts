type method = "GET" | "POST" | "PUT" | "DELETE";

type requestParamsType = {
  method: method;
  url: string;
  body?: string;
  status: number;
};

type fetchConfig = {
  method: method;
  body?: string;
  headers: {
    "Content-type": string;
    Accept: string;
  };
};

export type responseType = {
  id: number;
  title: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
};

type requestResultType = {
  status: boolean;
  error?: any;
  result?: responseType | responseType[];
};

const base = "http://localhost:3000";

export const request = async ({
  method,
  url,
  body,
  status,
}: requestParamsType): Promise<requestResultType> => {
  const config: fetchConfig = {
    method,
    headers: {
      "Content-type": "application/json",
      Accept: "application/json",
    },
  };
  if (method === "POST" || method === "PUT") config.body = body;
  try {
    const response = await fetch(`${base}/${url}`, config);
    if (response.status !== status) throw Error();

    if (response.status === 204) {
      return { status: true };
    }
    const result = await response.json();
    return { status: true, result };
  } catch (error) {
    return { status: false, error };
  }
};

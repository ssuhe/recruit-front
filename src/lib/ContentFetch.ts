import { request } from "./Request";

const url = "content";

type createType = {
  title: string;
  body: string;
};
export const create = (body: createType) =>
  request({
    method: "POST",
    url,
    status: 201,
    body: JSON.stringify(body),
  });

type updateType = {
  title?: string;
  body?: string;
};
export const update = (id: number, body: updateType) =>
  request({
    method: "PUT",
    url: `${url}/${id}`,
    status: 200,
    body: JSON.stringify(body),
  });

export const deleteOne = (id: number) =>
  request({
    method: "DELETE",
    url: `${url}/${id}`,
    status: 204,
  });

export const findAll = () =>
  request({
    method: "GET",
    url,
    status: 200,
  });

export const findOne = (id: number) =>
  request({
    method: "GET",
    url: `${url}/${id}`,
    status: 200,
  });

import { get } from "http";

export const API_URL = "http://localhost:8000/api/v1";
export const API_ENDPOINT = {
  PURCHASE_NEW_USER: `${API_URL}/purchase/e-book-course`,
  VERIFY_USER: `${API_URL}/auth/me`,
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  CREATE_COURSE: `${API_URL}/course/create`,
  CREATE_COURSE_CHAPTER: `${API_URL}/course/chapter/create`,
  UPDATE_COURSE_CHAPTER: (chapter_id: number) =>
    `${API_URL}/course/chapter/update/${chapter_id}`,
  DELETE_COURSE_CHAPTER: (chapter_id: number) =>
    `${API_URL}/course/chapter/delete/${chapter_id}`,
  LIST_COURSES: (page: number, pageSize: number) =>
    `${API_URL}/course/list?page=${page}&page_size=${pageSize}`,
  UPDATE_COURSE: (course_id: number) => `${API_URL}/course/update/${course_id}`,
  DELETE_COURSE: (course_id: number) => `${API_URL}/course/delete/${course_id}`,
  CREATE_EBOOK: `${API_URL}/ebook/create`,
  CREATE_EBOOK_CHAPTER: `${API_URL}/ebook/chapter/create`,
  UPDATE_EBOOK_CHAPTER: (chapter_id: number) =>
    `${API_URL}/ebook/chapter/update/${chapter_id}`,
  DELETE_EBOOK_CHAPTER: (chapter_id: number) =>
    `${API_URL}/ebook/chapter/delete/${chapter_id}`,
  LIST_EBOOKS: (page: number, pageSize: number) =>
    `${API_URL}/ebook/list?page=${page}&page_size=${pageSize}`,
  UPDATE_EBOOK: (ebook_id: number) => `${API_URL}/ebook/update/${ebook_id}`,
  DELETE_EBOOK: (ebook_id: number) => `${API_URL}/ebook/delete/${ebook_id}`,
  GET_USER_DASHBOARD_LIST: (filter: string, page: number, limit: number) =>
    `${API_URL}/user-dashboard/list?filter=${filter}&page=${page}&limit=${limit}`,
  GET_USER_DASHBOARD_CARD: `${API_URL}/user-dashboard/card`,
  GET_USER_DASHBOARD_COURSES: (filter: string, page: number, limit: number) =>
    `${API_URL}/user-dashboard/courses?filter=${filter}&page=${page}&limit=${limit}`,
  GET_USER_DASHBOARD_EBOOKS: (filter: string, page: number, limit: number) =>
    `${API_URL}/user-dashboard/ebooks?filter=${filter}&page=${page}&limit=${limit}`,

  GET_COURSE_LANDING_PAGE: (id: string) =>
    `${API_URL}/course/get/landing/${id}`,
  GET_EBOOK_LANDING_PAGE: (id: string) => `${API_URL}/ebook/get/landing/${id}`,
  GET_CHECKOUT_DATA: (
    id: string,
    type: string,
    ref?: string,
    user_id?: string
  ) =>
    `${API_URL}/purchase/checkout/${type}/${id}?ref=${ref}&user_id=${user_id}`,
  APPLY_COUPON: `${API_URL}/coupon/apply`,
};

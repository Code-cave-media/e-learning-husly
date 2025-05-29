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
};

export const API_URL = "http://localhost:8000/api/v1";
export const API_ENDPOINT = {
  PURCHASE_NEW_USER: `${API_URL}/purchase/e-book-course`,
  VERIFY_USER: `${API_URL}/auth/me`,
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  CREATE_COURSE: `${API_URL}/course/create`,
  CREATE_COURSE_CHAPTER: `${API_URL}/course/chapter/create`,
  LIST_COURSES: (page: number, pageSize: number) =>
    `${API_URL}/course/list?page=${page}&page_size=${pageSize}`,
};

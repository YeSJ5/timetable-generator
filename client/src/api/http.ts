import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Teachers
export const teachersApi = {
  getAll: () => api.get('/teachers'),
  getById: (id: string) => api.get(`/teachers/${id}`),
  create: (data: any) => api.post('/teachers', data),
  update: (id: string, data: any) => api.put(`/teachers/${id}`, data),
  delete: (id: string) => api.delete(`/teachers/${id}`),
};

// Subjects
export const subjectsApi = {
  getAll: () => api.get('/subjects'),
  getById: (id: string) => api.get(`/subjects/${id}`),
  create: (data: any) => api.post('/subjects', data),
  update: (id: string, data: any) => api.put(`/subjects/${id}`, data),
  delete: (id: string) => api.delete(`/subjects/${id}`),
};

// Sections
export const sectionsApi = {
  getAll: () => api.get('/sections'),
  getById: (id: string) => api.get(`/sections/${id}`),
  create: (data: any) => api.post('/sections', data),
  update: (id: string, data: any) => api.put(`/sections/${id}`, data),
  delete: (id: string) => api.delete(`/sections/${id}`),
};

// Rooms
export const roomsApi = {
  getAll: () => api.get('/rooms'),
  getById: (id: string) => api.get(`/rooms/${id}`),
  create: (data: any) => api.post('/rooms', data),
  update: (id: string, data: any) => api.put(`/rooms/${id}`, data),
  delete: (id: string) => api.delete(`/rooms/${id}`),
};

// Labs
export const labsApi = {
  getAll: () => api.get('/labs'),
  getById: (id: string) => api.get(`/labs/${id}`),
  create: (data: any) => api.post('/labs', data),
  update: (id: string, data: any) => api.put(`/labs/${id}`, data),
  delete: (id: string) => api.delete(`/labs/${id}`),
};

// Mappings
export const mappingsApi = {
  getAll: () => api.get('/mappings'),
  getById: (id: string) => api.get(`/mappings/${id}`),
  create: (data: any) => api.post('/mappings', data),
  update: (id: string, data: any) => api.put(`/mappings/${id}`, data),
  delete: (id: string) => api.delete(`/mappings/${id}`),
};

// Timetable
export const timetableApi = {
  generate: (data: any) => api.post('/timetable/generate', data),
  generateAll: (data: any) => api.post('/timetable/generate-all', data),
  getBySection: (sectionId: string) => api.get(`/timetable/${sectionId}`),
  aiFix: (data: any) => api.post('/timetable/ai-fix', data),
};

// Admin
export const adminApi = {
  uploadCSV: (formData: FormData) => api.post('/admin/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getCSVTemplate: (type: string) => api.get(`/admin/csv-template/${type}`, {
    responseType: 'blob',
  }),
};

// Preferences
export const preferencesApi = {
  getTeacher: (id: string) => api.get(`/preferences/teacher/${id}`),
  updateTeacher: (id: string, data: any) => api.put(`/preferences/teacher/${id}`, data),
  getSubject: (id: string) => api.get(`/preferences/subject/${id}`),
  updateSubject: (id: string, data: any) => api.put(`/preferences/subject/${id}`, data),
  getSection: (id: string) => api.get(`/preferences/section/${id}`),
  updateSection: (id: string, data: any) => api.put(`/preferences/section/${id}`, data),
  getRoom: (id: string) => api.get(`/preferences/room/${id}`),
  updateRoom: (id: string, data: any) => api.put(`/preferences/room/${id}`, data),
};


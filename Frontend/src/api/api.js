import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth ──────────────────────────────────────────────────────────────────
export const registerUser  = (data) => http.post('/auth/register', data);
export const loginUser     = (data) => http.post('/auth/login', data);
export const getMe         = (userId) => http.get(`/auth/me?userId=${userId}`);
export const updateProfile = (userId, data) => http.put(`/auth/profile?userId=${userId}`, data);

// ─── Recipients ───────────────────────────────────────────
export const getRecipients = () => http.get('/recipients');
export const createRecipient = (data) => http.post('/recipients', data);
export const createRecipientsBulk = (list) => http.post('/recipients/bulk', list);
export const updateRecipient = (id, data) => http.put(`/recipients/${id}`, data);
export const deleteRecipient = (id) => http.delete(`/recipients/${id}`);

// ─── Subject Templates ────────────────────────────────────
export const getSubjects = () => http.get('/subjects');
export const createSubject = (data) => http.post('/subjects', data);
export const updateSubject = (id, data) => http.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => http.delete(`/subjects/${id}`);

// ─── Body Templates ───────────────────────────────────────
export const getBodies = () => http.get('/bodies');
export const createBody = (data) => http.post('/bodies', data);
export const updateBody = (id, data) => http.put(`/bodies/${id}`, data);
export const deleteBody = (id) => http.delete(`/bodies/${id}`);

// Aliases for ColdEmailGeneratorPage
export const addSubject = (data) => http.post('/subjects', data);
export const addTemplate = (data) => http.post('/bodies', data);

// ─── Send ─────────────────────────────────────────────────
export const sendBulk = (data) => http.post('/send/bulk', data);

// ─── Resumes ──────────────────────────────────────────────
export const getResumes = () => http.get('/resumes');
export const uploadResume = (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return http.post('/resumes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteResume = (id) => http.delete(`/resumes/${id}`);

// ─── Logs ─────────────────────────────────────────────────
export const getLogs = () => http.get('/logs');
export const deleteLog = (id) => http.delete(`/logs/${id}`);
export const clearLogs = () => http.delete('/logs');

// ─── Stats ────────────────────────────────────────────────
export const getStats = () => http.get('/stats');

// ─── Scheduled Jobs ───────────────────────────────────────
export const getJobs = () => http.get('/jobs');
export const cancelJob = (id) => http.delete(`/jobs/${id}`);

// ─── AI HR Finder ──────────────────────────────────────────
export const searchHrs = (company) => http.get(`/hr-finder/search?company=${encodeURIComponent(company)}`);

// ─── AI Post Analyzer ────────────────────────────────────────
export const analyzePost = (data) => http.post('/analyze', data);

// ─── AI Outreach Agent ────────────────────────────────────────
export const generateOutreach = (data) => http.post('/outreach/generate', data);

// ─── Applications & Follow-Up ─────────────────────────────────
export const getApplications = () => http.get('/applications');
export const updateApplicationStatus = (id, data) => http.put(`/applications/${id}/status`, data);

// ─── Tracking ─────────────────────────────────────────────────
export const getTracking = () => http.get('/tracking');

// ─── AI Cold Email Generator ──────────────────────────────────
export const generateColdEmail = (data) => http.post('/cold-email/generate', data);

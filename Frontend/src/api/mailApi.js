import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/mails';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const sendMail = (mailData) => api.post('/send', mailData);
export const getAllMails = () => api.get('/');
export const getMailById = (id) => api.get(`/${id}`);
export const deleteMail = (id) => api.delete(`/${id}`);

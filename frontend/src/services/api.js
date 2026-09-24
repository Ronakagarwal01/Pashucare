// PashuCare API Client
// Supports both relative /api calls (proxied by Cloudflare Pages / Vite)
// and absolute external URLs via VITE_API_URL

const RAW_BASE = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_BASE.trim().replace(/\/$/, '');

async function request(url, options = {}) {
  const fullUrl = `${API_BASE}${url}`;
  try {
    const res = await fetch(fullUrl, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `सर्वर त्रुटि (${res.status}) / Server error (${res.status})` }));
      throw new Error(err.detail || `Request failed (${res.status})`);
    }
    return res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('सर्वर से संपर्क नहीं हो पा रहा है। कृपया इंटरनेट या बैकएंड सर्वर की स्थिति जांचें। (Unable to reach server. Please verify backend is running.)');
    }
    throw error;
  }
}

// Animals
export const createAnimal = (data) => request('/api/animals', { method: 'POST', body: JSON.stringify(data) });
export const getAnimals = () => request('/api/animals');
export const getAnimal = (id) => request(`/api/animals/${id}`);

// Consultations
export const createConsultation = (animalId) => request('/api/consultations', { method: 'POST', body: JSON.stringify({ animal_id: animalId }) });
export const getConsultations = () => request('/api/consultations');
export const getConsultation = (id) => request(`/api/consultations/${id}`);

// Chat
export const sendMessage = (consultationId, message) => request('/api/chat', { method: 'POST', body: JSON.stringify({ consultation_id: consultationId, message }) });

// Vision
export const analyzeImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const fullUrl = `${API_BASE}/api/analyze-image`;
  try {
    const res = await fetch(fullUrl, { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'फोटो का विश्लेषण नहीं किया जा सका। / Unable to process image.' }));
      throw new Error(err.detail);
    }
    return res.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('सर्वर से संपर्क नहीं हो पा रहा है। (Unable to connect to vision service.)');
    }
    throw error;
  }
};

// Dashboard
export const getDashboard = () => request('/api/dashboard');

// Case Summary
export const generateCaseSummary = (consultationId) => request('/api/case-summary', { method: 'POST', body: JSON.stringify({ consultation_id: consultationId }) });

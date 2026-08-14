import axios from 'axios'
import { API_BASE_URL, STATUSES, WORK_TYPES } from '@/constants'

// Axios instance pointing at the backend API
const api = axios.create({ baseURL: API_BASE_URL })

// The backend returns errors as { error: "<message>" }. Normalize that into a plain
// Error so callers can just read err.message without reaching into axios internals.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(new Error(error.response?.data?.error || error.message))
)

// Validates that a request payload has the required fields before sending
const validateRequest = (data) => {
  if (!data.company?.trim()) throw new Error('Company is required')
  if (!data.role?.trim()) throw new Error('Role is required')
  if (!data.date) throw new Error('Date is required')
  if (!STATUSES.includes(data.status)) throw new Error(`Invalid status: ${data.status}`)
  if (!WORK_TYPES.includes(data.workType)) throw new Error(`Invalid work type: ${data.workType}`)
  if (data.workType !== 'Remote' && !data.location?.trim()) {
    throw new Error('Location is required unless work type is Remote')
  }
}

// Validates that the API response has the expected shape
const validateResponse = (data) => {
  if (!data || typeof data !== 'object') throw new Error('Invalid response from server')
  if (!data.id) throw new Error('Response missing id')
  if (!data.company) throw new Error('Response missing company')
  if (!data.role) throw new Error('Response missing role')
  return data
}

// Fetch job applications, optionally filtered by status and/or work type
export const getApplications = ({ status, workType } = {}) =>
  api.get('/applications', { params: { status, workType } }).then((r) => {
    if (!Array.isArray(r.data)) throw new Error('Expected an array from server')
    return r.data
  })

// Create a new application record
export const createApplication = (data) => {
  validateRequest(data)
  return api.post('/applications', data).then((r) => validateResponse(r.data))
}

// Update an existing application by id
export const updateApplication = (id, data) => {
  if (!id) throw new Error('Application id is required for update')
  validateRequest(data)
  return api.put(`/applications/${id}`, data).then((r) => validateResponse(r.data))
}

// Delete an application by id
export const deleteApplication = (id) => {
  if (!id) throw new Error('Application id is required for delete')
  return api.delete(`/applications/${id}`)
}

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const authApi = axios.create({
  baseURL: API_URL,
});

export const getChallenge = (address: string) => 
  authApi.get(`/api/auth/challenge/${address}`).then(res => res.data);

export const login = (address: string, signature: string, message: string) => 
  authApi.post('/api/auth/login', { address, signature, message }).then(res => res.data);

export const getMe = (token: string) => 
  authApi.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const applyToVote = (data: { address: string, name: string }) => 
  authApi.post('/api/voters/apply', data).then(res => res.data);

export const getPendingVoters = (token: string) => 
  authApi.get('/api/voters/pending', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

export const approveVoter = (address: string, token: string) => 
  authApi.post('/api/voters/approve', { address }, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.data);

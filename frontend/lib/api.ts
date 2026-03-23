import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
});

export const getElections = () => api.get('/api/elections').then(res => res.data);
export const getElection = (id: number) => api.get(`/api/elections/${id}`).then(res => res.data);
export const getResults = (id: number) => api.get(`/api/results/${id}`).then(res => res.data);

export const createElection = (data: any) => api.post('/api/admin/election', data).then(res => res.data);
export const addCandidate = (data: any) => api.post('/api/admin/candidate', data).then(res => res.data);
export const registerVoter = (data: any) => api.post('/api/admin/register-voter', data).then(res => res.data);

export const relayVote = (signedTx: string) => api.post('/api/vote', { signed_tx: signedTx }).then(res => res.data);

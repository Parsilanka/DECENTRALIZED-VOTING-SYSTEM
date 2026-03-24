import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'; // Define API_URL based on original baseURL
const api = axios.create({
  baseURL: API_URL,
});

export const getElections = () => api.get('/api/elections').then(res => res.data);
export const getElection = (id: number) => api.get(`/api/elections/${id}`).then(res => res.data);
export const getResults = (id: number) => api.get(`/api/results/${id}`).then(res => res.data);

export const endElection = (id: number, headers = {}) => api.post(`/api/admin/end-election/${id}`, {}, { headers }).then(res => res.data);

export const createElection = async (data: any, headers = {}) => {
  const response = await api.post('/api/admin/election', data, { headers });
  return response.data;
};
export const addCandidate = (data: any, headers = {}) => api.post('/api/admin/candidate', data, { headers }).then(res => res.data);
export const registerVoter = async (data: any, headers = {}) => {
  const response = await api.post('/api/admin/register-voter', data, { headers });
  return response.data;
};

// Vote Action (Handles on-chain call)
export const castVoteAction = async (electionId: number, candidateId: number) => {
  const { createVoteTransaction } = await import('./web3');
  const txHash = await createVoteTransaction(electionId, candidateId);
  return { tx_hash: txHash };
};

export const relayVote = (signedTx: string) => api.post('/api/vote', { signed_tx: signedTx }).then(res => res.data);

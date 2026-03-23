import { ethers } from 'ethers';

export const connectWallet = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  
  // Enforce Sepolia chain ID: 11155111
  if (network.chainId !== 11155111n) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        throw new Error("Sepolia network is not added to your MetaMask. Please add it manually.");
      }
      throw switchError;
    }
  }

  const accounts = await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  
  return { provider, signer, address: accounts[0] };
};

export const createVoteTransaction = async (electionId: number, candidateId: number) => {
  const { provider, signer } = await connectWallet();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
  
  const abi = [
    "function castVote(uint256 _electionId, uint256 _candidateId) public"
  ];
  
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.castVote(electionId, candidateId);
  return tx.hash; // Standard flow: metamask broadcasts it.
};

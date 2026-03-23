const { ethers } = require('ethers');
const contractABI = require('./contractABI.json');

const provider = new ethers.JsonRpcProvider(process.env.GANACHE_URL);

// Use first Ganache account as signer
const getSigner = async () => {
  const accounts = await provider.listAccounts();
  return await provider.getSigner(accounts[0].address);
};

const getContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, signer);
};

exports.storeHashOnChain = async (hash) => {
  const contract = await getContract();
  const tx = await contract.storeDocument(hash);
  await tx.wait();
  return tx.hash;
};

exports.verifyHashOnChain = async (hash) => {
  const contract = await getContract();
  const [exists, uploadedBy, timestamp] = await contract.verifyDocument(hash);
  return {
    exists,
    uploadedBy,
    timestamp: exists ? new Date(Number(timestamp) * 1000).toLocaleString() : null,
  };
};

import { ethers } from 'ethers';

export const getTokenContract = (address, abi, signer) => {
    return new ethers.Contract(address, abi, signer);
}
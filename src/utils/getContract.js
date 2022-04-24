import {ethers} from 'ethers';

const getContract = async (address, abi, signer, deployedBytecode) => {
    if(deployedBytecode) {
        const contract = await new ethers.ContractFactory(abi, deployedBytecode, signer);
        const attachedContract = await contract.attach(address);
        return attachedContract;
    } else {
        return new ethers.Contract(address, abi, signer);
    }
}

export default getContract;
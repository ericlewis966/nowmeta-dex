import React, { useState, useContext, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import SearchModal from '../token-modal';
import SearchContext from '../../contexts/SearchToken';
import Image from '../image';
import Swal from 'sweetalert2';

import { ethers } from 'ethers'
import BigNumber from 'bignumber.js';
import getContract from '../../utils/getContract';
import { getSlippage, fromSlippage } from '../../utils/getSlippage';
import V2RouterArtifact from '../../constants/UniswapV2Router02.json';
import { V2ROUTER_ADDRESS } from '../../configs/types';

import { INPUT, OUTPUT } from '../../configs/types';
import Unknown from '../../assets/images/unknown.png';

import BNB from '../../assets/images/bnb.png';
import './token-input.css';


const TokenInput = ({ selectType }) => {

    const [showModal, setShowModal] = useState(false);
    const { account, library } = useWeb3React();
    const { state, update } = useContext(SearchContext);
    const { inputToken, outputToken, inputBalance, inputDecimal, inputAmount, outputAmount, outputDecimal, outputBalance, slippage, app } = state;

    const errStyle = { color: 'rgb(237, 28, 36)' };
    const normalStyle = { color: '#ffffff' };
    const errorCondition = (selectType === INPUT && inputBalance < inputAmount) || (selectType === OUTPUT && outputBalance < outputAmount && app === 2);
    const autoInputCondition_1 = (inputToken && outputToken && app === 1) && (inputAmount > 0);
    // const autoInputCondition_2 = (inputToken && outputToken && app === 1) && (selectType === OUTPUT && inputAmount > 0);

    const getAmount = async () => {
        const V2Router = await getContract(V2ROUTER_ADDRESS, V2RouterArtifact.abi, library?.getSigner(), V2RouterArtifact.deployedBytecode);
        if (autoInputCondition_1) {
            try {
                console.log("case-1");
                console.log(inputToken, outputToken);
                const amountsOut = await V2Router.getAmountsOut(ethers.utils.parseUnits(String(inputAmount), inputDecimal), [inputToken, outputToken]);
                const bigNum = new BigNumber(amountsOut[1].toString());
                const denom = new BigNumber(10).pow(inputDecimal);
                const safeAmount = bigNum.dividedBy(denom).toNumber();
                console.log(amountsOut);
                const amountOut = getSlippage(safeAmount, slippage);
                update({ outputAmount: amountOut.toFixed(3) });
            } catch (err) {
                try {
                    console.log("case-2");
                    const WETH = await V2Router.WETH();
                    const amountsOut = await V2Router.getAmountsOut(ethers.utils.parseUnits(String(inputAmount), inputDecimal), [inputToken, WETH, outputToken]);
                    const bigNum = new BigNumber(amountsOut[2].toString());
                    const denom = new BigNumber(10).pow(inputDecimal);
                    const safeAmount = bigNum.dividedBy(denom).toNumber();
                    console.log(safeAmount);
                    const amountOut = getSlippage(safeAmount, slippage);
                    update({ outputAmount: amountOut.toFixed(3) });
                } catch (err) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Operation Faild.',
                        text: 'You are trying to swap with Non-exist Pair.',
                        showCancelButton: false
                    })
                    console.log(err);
                }
            }
        }
        // else 
        // if (autoInputCondition_2) {
        //     const amountsIn = await V2Router.getAmountsIn(ethers.utils.parseUnits(String(outputAmount), outputDecimal), [inputToken, outputToken]);
        //     const bigNum = new BigNumber(amountsIn[0].toString());
        //     const denom = new BigNumber(10).pow(inputDecimal);
        //     const safeAmount = bigNum.dividedBy(denom).toNumber();
        //     const amountIn = fromSlippage(safeAmount, slippage);
        //     update({ inputAmount: amountIn });
        //     console.log(safeAmount);
        // }
    }

    const setTokenAmount = async (amount) => {
        switch (selectType) {
            case INPUT:
                update({ inputAmount: amount });
                break;
            case OUTPUT:
                update({ outputAmount: amount });
                break;
            default:
                break;
        }
    }

    return (
        <>
            <div className="flex token-input-panel space-between">
                <div className="flex token-amount-input">
                    <input type="number" min={0} placeholder="0.0" value={selectType === INPUT ? inputAmount : outputAmount} onChange={async (e) => setTokenAmount(e.target.value)} disabled={!account} style={errorCondition ? errStyle : normalStyle} />
                </div>
                {
                    selectType === INPUT ? <div className='flex max-value'>
                        <button className='flex set-max-value align-center' onClick={() => setTokenAmount(state.inputBalance)} disabled={!account}><span className='flex'>MAX</span></button>
                    </div> : app === 1 ? <button className='flex set-max-value align-center' onClick={getAmount} disabled={!account}><span className='flex'>Auto</span></button> : <></>
                }
                <div className="flex selected-token">
                    <button className='flex select-token align-center' onClick={() => setShowModal(true)} disabled={!account}>
                        {
                            (state.inputToken === null && selectType === INPUT) || (state.outputToken === null && selectType === OUTPUT) ? <span className='flex'>Select Token</span> :
                                selectType === INPUT ? <span className='flex align-center'><Image classname="flex selected-token-ico" alt={state.outputSymbol} src={`https://assets.trustwalletapp.com/blockchains/smartchain/assets/${state.inputToken}/logo.png`} fallbackSrc={Unknown} /><span className='flex'>{state.inputSymbol}</span></span> :
                                    <span className='flex align-center'><Image classname="flex selected-token-ico" alt={state.outputSymbol} src={`https://assets.trustwalletapp.com/blockchains/smartchain/assets/${state.outputToken}/logo.png`} fallbackSrc={Unknown} /><span className='flex'>{state.outputSymbol}</span></span>
                        }
                    </button>
                </div>
            </div>
            <SearchModal show={showModal} width="30%" height="600px" style={{ minWidth: "320px" }} effect="fadeInUp" onClickAway={() => setShowModal(false)} selectType={selectType} />
        </>
    )
}

export default TokenInput;
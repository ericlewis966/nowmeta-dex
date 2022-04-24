import { useContext, useEffect, useState } from "react";
import SearchContext from "../../contexts/SearchToken";
import { useWeb3React } from "@web3-react/core";
import { injected } from "../../configs/connectors";
import Swal from 'sweetalert2';
import PendingModal from "../pending-modal";

import { IoSwapVerticalOutline } from 'react-icons/io5';
import { FiSettings } from 'react-icons/fi';

import SettingModal from "../setting-modal";
import TokenInput from "../token-input";
import GoldButton from "../gold-button/GoldButton";
import SmoothButton from "../smooth-button/SmoothButton";

import { ethers } from 'ethers'
import getContract from '../../utils/getContract';
import { getTokenContract } from "../../utils/getToken";
import ERC20 from '../../constants/erc20.json';
import V2RouterArtifact from '../../constants/UniswapV2Router02.json';
import { V2FACTORY_ADDRESS, V2ROUTER_ADDRESS } from '../../configs/types';

import { INPUT, OUTPUT } from "../../configs/types";

import './pool.css';

const Pool = () => {

    const { state, update } = useContext(SearchContext);
    const { account, activate, library, active } = useWeb3React();
    const [showSettingModal, setShowSettingModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const { inputToken, outputToken, inputAmount, inputSymbol, inputContract, outputAmount, inputDecimal, outputDecimal, outputContract, outputSymbol, pendingMessage, tx_hash, coinInput, coinOutput, tx_deadline } = state;
    const coinCondition = coinInput || coinOutput;

    const changePosition = () => {
        const tempState = state;
        update({
            inputToken: tempState.outputToken,
            inputName: tempState.outputName,
            inputSymbol: tempState.outputSymbol,
            inputBalance: tempState.outputBalance,
            inputDecimal: tempState.outputDecimal,
            inputContract: tempState.outputContract,
            inputAmount: tempState.outputAmount,
            coinInput: tempState.coinOutput,
            outputToken: tempState.inputToken,
            outputName: tempState.inputName,
            outputSymbol: tempState.inputSymbol,
            outputBalance: tempState.inputBalance,
            outputDecimal: tempState.inputDecimal,
            outputContract: tempState.inputContract,
            outputAmount: tempState.inputAmount,
            coinOutput: tempState.coinInput,
        })
    }

    const addLiquidity = async () => {
        const V2Router = await getContract(V2ROUTER_ADDRESS, V2RouterArtifact.abi, library?.getSigner(), V2RouterArtifact.deployedBytecode);
        try {
            update({ pendingMessage: `Approving ${inputAmount} ${inputSymbol}...` });
            setShowPendingModal(true);
            var tx = await inputContract.approve(V2Router.address, ethers.utils.parseUnits(String(inputAmount), inputDecimal));
            update({ tx_hash: tx.hash });
            await tx.wait();
            update({ pendingMessage: `${inputAmount} ${inputSymbol} approved.`, tx_hash: tx.hash });
            tx = await outputContract.approve(V2Router.address, ethers.utils.parseUnits(String(outputAmount), outputDecimal));
            update({ pendingMessage: `Approving ${outputAmount} ${outputSymbol}...`, tx_hash: tx.hash });
            await tx.wait();
            update({ pendingMessage: `${outputAmount} ${outputSymbol} approved.`, tx_hash: tx.hash });
            tx = await V2Router.addLiquidity(inputToken, outputToken, ethers.utils.parseUnits(String(inputAmount), inputDecimal), ethers.utils.parseUnits(String(outputAmount), outputDecimal), 1, 1, account, Date.now());
            update({ pendingMessage: `Add liquidity is making progress.`, tx_hash: tx.hash });
            await tx.wait();
            setShowPendingModal(false);
            Swal.fire({
                icon: 'success',
                showCancelButton: false,
                title: 'Well Done!',
                text: 'The liquidity successfully added.'
            })
            console.log(tx);
            update({ tx_hash: null });
        } catch (e) {
            update({ tx_hash: null });
            setShowPendingModal(false);
            Swal.fire({
                icon: 'error',
                showCancelButton: false,
                title: 'Operation faild.',
                text: e.data ? e.data.message : e.message
            })
            console.log(e);
        }
    }

    const addLiquidityEth = async () => {
        const V2Router = await getContract(V2ROUTER_ADDRESS, V2RouterArtifact.abi, library?.getSigner(), V2RouterArtifact.deployedBytecode);
        const wbnb = await V2Router.WETH();
        const IWBNB = getTokenContract(wbnb, ERC20, library?.getSigner());
        try {
            var tx = null;
            if (coinInput) {
                update({ pendingMessage: `Approving ${outputAmount} ${outputSymbol}...` });
                setShowPendingModal(true);
                console.log(wbnb);
                // tx = await V2Router.swapETHForExactTokens(ethers.utils.parseUnits(String(inputAmount), 18), [wbnb], account, Date.now(), {value: ethers.utils.parseUnits(String(inputAmount), inputDecimal)});
                // await tx.wait();
                // tx = IWBNB.approve(V2Router.address, ethers.utils.parseUnits(String(inputAmount), inputDecimal));
                // await tx.wait();
                tx = await outputContract.approve(V2Router.address, ethers.utils.parseUnits(String(outputAmount), outputDecimal));
                update({ tx_hash: tx.hash });
                await tx.wait();
                update({ pendingMessage: `${outputAmount} ${outputSymbol} approved.`, tx_hash: tx.hash });
                // tx = await V2Router.addLiquidity(wbnb, outputToken, ethers.utils.parseUnits(String(inputAmount), inputDecimal), ethers.utils.parseUnits(String(outputAmount), outputDecimal), 1, 1, account, Date.now());
                tx = await V2Router.addLiquidityETH(outputToken, ethers.utils.parseUnits(String(outputAmount), outputDecimal), 1, 1, account, Date.now(), { value: ethers.utils.parseUnits(String(inputAmount), inputDecimal) });
                update({ pendingMessage: `Add liquidity is making progress.`, tx_hash: tx.hash });
            }
            else if (coinOutput) {
                update({ pendingMessage: `Approving ${inputAmount} ${inputSymbol}...` });
                setShowPendingModal(true);
                tx = await inputContract.approve(V2Router.address, ethers.utils.parseUnits(String(inputAmount), inputDecimal));
                update({ tx_hash: tx.hash });
                await tx.wait();
                update({ pendingMessage: `${inputAmount} ${inputSymbol} approved.`, tx_hash: tx.hash });
                tx = await V2Router.addLiquidityETH(inputToken, ethers.utils.parseUnits(String(inputAmount), inputDecimal), 1, 1, account, Date.now(), { value: ethers.utils.parseUnits(String(outputAmount), outputDecimal) });
                update({ pendingMessage: `Add liquidity is making progress.`, tx_hash: tx.hash });
            }
            await tx.wait();
            setShowPendingModal(false);
            Swal.fire({
                icon: 'success',
                showCancelButton: false,
                title: 'Well Done!',
                text: 'The liquidity successfully added.'
            })
            update({ tx_hash: null });
        } catch (e) {
            console.log(coinInput, coinOutput);
            console.log(outputAmount, outputDecimal, inputAmount, inputDecimal, wbnb);
            update({ tx_hash: null });
            setShowPendingModal(false);
            Swal.fire({
                icon: 'error',
                showCancelButton: false,
                title: 'Operation faild.',
                text: e.data ? e.data.message : e.message
            })
            console.log(e);
        }
    }

    return (
        <>
            <div className="flex col swap space-between self-center">
                <div className="flex swap-setting space-between align-center">
                    <div className="flex swap-label">
                        Liquidity Pool
                    </div>
                    <div className="flex open-setting">
                        <SmoothButton label={<FiSettings />} style={{ borderRadius: "50%", width: "50px", height: "50px", outline: "none" }} onClick={() => setShowSettingModal(true)} />
                    </div>
                </div>
                <div className="flex token-input justify-center">
                    <TokenInput selectType={INPUT} />
                </div>
                <div className="flex separator justify-center">

                    <SmoothButton label={<IoSwapVerticalOutline />} style={{ borderRadius: "20%", width: "50px", height: "50px", outline: "none" }} onClick={changePosition} />
                </div>
                <div className="flex token-input justify-center">
                    <TokenInput selectType={OUTPUT} />
                </div>
                <div className="flex confirm-container justify-center">
                    {
                        account ? <GoldButton label={"Add Liquidity"} onClick={!coinCondition ? addLiquidity : addLiquidityEth} /> : <GoldButton label={"Connect Wallet"} onClick={() => activate(injected)} />
                    }
                </div>
            </div>
            <SettingModal show={showSettingModal} width={"300px"} height={"400px"} effect="fadeInUp" onClickAway={() => setShowSettingModal(false)} />
            <PendingModal show={showPendingModal} width={"300px"} height={"400px"} effect="fadeInUp" message={pendingMessage} tx={tx_hash} />
        </>
    )
}

export default Pool;
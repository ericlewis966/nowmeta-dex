import { useContext, useState } from "react";
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
import V2FactoryArtifact from '../../constants/UniswapV2Factory.json';
import V2RouterArtifact from '../../constants/UniswapV2Router02.json';
import { V2FACTORY_ADDRESS, V2ROUTER_ADDRESS, zero_address } from '../../configs/types';

import { INPUT, OUTPUT } from "../../configs/types";

import './swap.css';

const Swap = () => {

    const { state, update } = useContext(SearchContext);
    const { account, activate, library } = useWeb3React();
    const [showSettingModal, setShowSettingModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const { inputToken, outputToken, inputAmount, inputSymbol, inputContract, outputAmount, inputDecimal, outputDecimal, outputContract, outputSymbol, pendingMessage, tx_hash, tx_deadline, coinInput, coinOutput } = state;

    const wrappingCondition = coinInput || coinOutput;

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

    const swapTokenforToken = async () => {
        const V2Router = await getContract(V2ROUTER_ADDRESS, V2RouterArtifact.abi, library?.getSigner(), V2RouterArtifact.deployedBytecode);
        const V2Factory = await getContract(V2FACTORY_ADDRESS, V2FactoryArtifact.abi, library?.getSigner(), V2FactoryArtifact.deployedBytecode);
        const pair = await V2Factory.getPair(inputToken, outputToken);
        const weth = await V2Router.WETH();

        if (!(inputToken && outputToken && inputAmount > 0 && outputAmount > 0 && !coinInput && !coinOutput)) {
            return false;
        }

        if (pair !== zero_address) {
            setShowPendingModal(true);
            try {
                console.log("1-1");
                update({ pendingMessage: `Approving ${inputAmount} ${inputSymbol}` });
                var tx = await inputContract.approve(V2Router.address, ethers.utils.parseUnits(String(inputAmount), inputDecimal));
                update({ tx_hash: tx.hash });
                await tx.wait();
                update({ pendingMessage: `${inputAmount} ${inputSymbol} approved.` });
                tx = await V2Router.swapExactTokensForTokens(ethers.utils.parseUnits(String(inputAmount), inputDecimal), ethers.utils.parseUnits(String(outputAmount), outputDecimal), [inputToken, outputToken], account, Date.now());
                update({ pendingMessage: `Exchanging ${inputSymbol} to ${outputSymbol}`, tx_hash: tx.hash });
                await tx.wait();
                console.log(tx);
                setShowPendingModal(false);
                update({ tx_hash: null });
                Swal.fire({
                    icon: 'success',
                    showCancelButton: false,
                    title: 'Well done.',
                    text: 'Exchanged successfully.'
                })
            } catch (err) {
                console.log(pair);
                if (err.code == -32003) {
                    try {
                        console.log("1-2");
                        var tx = await V2Router.swapExactTokensForTokens(ethers.utils.parseUnits(String(inputAmount), inputDecimal), ethers.utils.parseUnits(String(outputAmount), outputDecimal), [inputToken, outputToken], account, Date.now());
                        update({ pendingMessage: `Exchanging ${inputSymbol} to ${outputSymbol}.`, tx_hash: tx.hash });
                        await tx.wait();
                        setShowPendingModal(false);
                        update({ tx_hash: null });
                        Swal.fire({
                            icon: 'success',
                            showCancelButton: false,
                            title: 'Well done.',
                            text: 'Exchanged successfully.'
                        })
                    } catch (err) {
                        console.log(err);
                        setShowPendingModal(false);
                        update({ tx_hash: null });
                        Swal.fire({
                            icon: 'error',
                            showCancelButton: false,
                            title: 'Operation faild.',
                            text: err.data ? err.data.message : err.message
                        })
                    }
                }
                else {
                    setShowPendingModal(false);
                    update({ tx_hash: null });
                    Swal.fire({
                        icon: 'error',
                        showCancelButton: false,
                        title: 'Operation faild.',
                        text: err.data ? err.data.message : err.message
                    })
                }
                console.log(err);
            }
        } else {
            setShowPendingModal(true);
            try {
                console.log("2-1");
                update({ pendingMessage: `Approving ${inputAmount} ${inputSymbol}` });
                var tx = await inputContract.approve(V2Router.address, ethers.utils.parseUnits(String(inputAmount), inputDecimal));
                update({ tx_hash: tx.hash });
                await tx.wait();
                update({ pendingMessage: `${inputAmount} ${inputSymbol} approved.` });
                console.log(ethers.utils.parseUnits(String(inputAmount), inputDecimal), ethers.utils.parseUnits(String(outputAmount), outputDecimal), [inputToken, weth, outputToken], account, Date.now());
                tx = await V2Router.swapExactTokensForTokens(ethers.utils.parseUnits(String(inputAmount), inputDecimal), ethers.utils.parseUnits(String(outputAmount), outputDecimal), [inputToken, weth, outputToken], account, Date.now());
                update({ pendingMessage: `Exchanging ${inputSymbol} to ${outputSymbol}.`, tx_hash: tx.hash });
                await tx.wait();
                console.log(tx);
                setShowPendingModal(false);
                update({ tx_hash: null });
                Swal.fire({
                    icon: 'success',
                    showCancelButton: false,
                    title: 'Well done.',
                    text: 'Exchanged successfully.'
                })
            } catch (err) {
                console.log(pair);
                console.log(inputAmount, inputDecimal, outputAmount, outputDecimal, [inputToken, weth, outputToken], account, Date.now());
                if (err.code == -32003) {
                    try {
                        console.log("2-2");
                        var tx = await V2Router.swapExactTokensForTokens(ethers.utils.parseUnits(String(inputAmount), inputDecimal), ethers.utils.parseUnits(String(outputAmount), outputDecimal), [inputToken, weth, outputToken], account, Date.now());
                        update({ pendingMessage: `Exchanging ${inputSymbol} to ${outputSymbol}.`, tx_hash: tx.hash });
                        await tx.wait();
                        setShowPendingModal(false);
                        update({ tx_hash: null });
                        Swal.fire({
                            icon: 'success',
                            showCancelButton: false,
                            title: 'Well done.',
                            text: 'Exchanged successfully.'
                        })
                    } catch (err) {
                        console.log(err);
                        setShowPendingModal(false);
                        update({ tx_hash: null });
                        Swal.fire({
                            icon: 'error',
                            showCancelButton: false,
                            title: 'Operation faild.',
                            text: err.data ? err.data.message : err.message
                        })
                    }
                }
                else {
                    setShowPendingModal(false);
                    update({ tx_hash: null });
                    Swal.fire({
                        icon: 'error',
                        showCancelButton: false,
                        title: 'Operation faild.',
                        text: err.data ? err.data.message : err.message
                    })
                }
                console.log(err);
            }
        }
    }

    const swapWithETH = async () => {
        if (!wrappingCondition) {
            return false;
        }
        const V2Router = await getContract(V2ROUTER_ADDRESS, V2RouterArtifact.abi, library?.getSigner(), V2RouterArtifact.deployedBytecode);
        const V2Factory = await getContract(V2FACTORY_ADDRESS, V2FactoryArtifact.abi, library?.getSigner(), V2FactoryArtifact.deployedBytecode);
        const pair = await V2Factory.getPair(inputToken, outputToken);
        const wbnb = await V2Router.WETH();
        var tx = null;
        if (coinInput) {
            try {
                setShowPendingModal(true);
                update({pendingMessage: `Exchanging ${inputAmount} ${inputSymbol} to ${outputSymbol}`});
                tx = await V2Router.swapExactETHForTokens(ethers.utils.parseUnits(String(outputAmount), outputDecimal), [wbnb, outputToken], account, Date.now(), { value: ethers.utils.parseUnits(String(inputAmount), inputDecimal) });
                update({tx_hash: tx.hash});
                await tx.wait();
                setShowPendingModal(false);
                Swal.fire({
                    icon: 'success',
                    showCancelButton: false,
                    title: 'Well done.',
                    text: 'Exchanged successfully.'
                })
                update({tx_hash: null});
            } catch (err) {
                if (err.code == -32003) {
                    try {
                        tx = await V2Router.swapExactETHForTokensSupportingFeeOnTransferTokens(ethers.utils.parseUnits(String(outputAmount), outputDecimal), [wbnb, outputToken], account, Date.now(), { value: ethers.utils.parseUnits(String(inputAmount), inputDecimal) });
                        await tx.wait();
                        setShowPendingModal(false);
                        Swal.fire({
                            icon: 'success',
                            showCancelButton: false,
                            title: 'Well done.',
                            text: 'Exchanged successfully.'
                        })
                        update({tx_hash: null});
                    } catch (err) {
                        setShowPendingModal(false);
                        console.log(err);
                        Swal.fire({
                            icon: 'error',
                            showCancelButton: false,
                            title: 'Operation faild.',
                            text: err.data ? err.data.message : err.message
                        });
                        update({tx_hash: null});
                    }
                } else {
                    setShowPendingModal(false);
                    Swal.fire({
                        icon: 'error',
                        showCancelButton: false,
                        title: 'Operation faild.',
                        text: err.data ? err.data.message : err.message
                    })
                    console.log(err);
                    update({tx_hash: null});
                }
            }

        } else if (coinOutput) {
            try {
                setShowPendingModal(true);
                update({pendingMessage: `Approving ${inputAmount} ${inputSymbol}.`});
                tx = await inputContract.approve(V2Router.address, ethers.utils.parseUnits(String(inputAmount), inputDecimal));
                update({tx_hash: tx.hash});
                await tx.wait();
                update({pendingMessage: `${inputAmount} ${inputSymbol} approved.`});
                tx = await V2Router.swapExactTokensForETH(ethers.utils.parseUnits(String(inputAmount), inputDecimal), ethers.utils.parseUnits(String(outputAmount), outputDecimal), [inputToken, wbnb], account, Date.now());
                update({pendingMessage: `Exchanging ${inputAmount} ${inputSymbol} to ${outputSymbol}`, tx_hash: tx.hash});
                await tx.wait();
                setShowPendingModal(false);
                Swal.fire({
                    icon: 'success',
                    showCancelButton: false,
                    title: 'Well done.',
                    text: 'Exchanged successfully.'
                })
                update({tx_hash: null});
            } catch (err) {
                if (err.code == -32003) {
                    try {
                        tx = await inputContract.approve(V2Router.address, ethers.utils.parseUnits(String(inputAmount), inputDecimal));
                        await tx.wait();
                        tx = await V2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(ethers.utils.parseUnits(String(inputAmount), inputDecimal), ethers.utils.parseUnits(String(outputAmount), outputDecimal), [inputToken, wbnb], account, Date.now());
                        await tx.wait();
                        setShowPendingModal(false);
                        Swal.fire({
                            icon: 'success',
                            showCancelButton: false,
                            title: 'Well done.',
                            text: 'Exchanged successfully.'
                        })
                        update({tx_hash: null});
                    } catch (err) {
                        console.log(err);
                        setShowPendingModal(false);
                        Swal.fire({
                            icon: 'error',
                            showCancelButton: false,
                            title: 'Operation faild.',
                            text: err.data ? err.data.message : err.message
                        })
                        console.log(err);
                        update({tx_hash: null});
                    }
                } else {
                    setShowPendingModal(false);
                    Swal.fire({
                        icon: 'error',
                        showCancelButton: false,
                        title: 'Operation faild.',
                        text: err.data ? err.data.message : err.message
                    })
                    console.log(err);
                    update({tx_hash: null});
                }

            }
        }
    }

    return (
        <>
            <div className="flex col swap space-between self-center">
                <div className="flex swap-setting space-between align-center">
                    <div className="flex swap-label">
                        SWAP
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
                        account ? <GoldButton label={"Confirm Swap"} onClick={ wrappingCondition ? swapWithETH : swapTokenforToken} /> : <GoldButton label={"Connect Wallet"} onClick={() => activate(injected)} />
                    }
                </div>
            </div>
            <SettingModal show={showSettingModal} width={"300px"} height={"400px"} effect="fadeInUp" onClickAway={() => setShowSettingModal(false)} />
            <PendingModal show={showPendingModal} width={"300px"} height={"400px"} effect="fadeInUp" message={pendingMessage} tx={tx_hash}/>
        </>
    )
}

export default Swap;
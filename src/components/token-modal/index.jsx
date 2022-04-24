import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-awesome-modal';
import { ethers } from 'ethers';
import { useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';

import SearchContext from '../../contexts/SearchToken';
import { INPUT, OUTPUT } from '../../configs/types';
import Image from '../image';
import './search-modal.css';

import { getTokenContract } from '../../utils/getToken';
import ERC20_ABI from '../../constants/erc20.json';
import { wbnb_address } from '../../configs/types';

import Unknown from '../../assets/images/unknown.png';
import BNB from '../../assets/images/bnb.png';

const SearchModal = ({ show, width, height, effect, style, selectType, onClickAway }) => {
    const [tokens, setTokens] = useState([]);
    const [tokenAddress, setTokenAddress] = useState('');
    const { state, update } = useContext(SearchContext);
    const { account, library, chainId } = useWeb3React();

    const setSearchText = async (address) => {
        setTokenAddress(address);
        if (chainId === 56) {
            axios.get(`https://api.pancakeswap.info/api/v2/tokens/${address}`).then(res => {
                if (Object.keys(res.data.data).length > 4) {
                    const tokens = Object.keys(res.data.data).map(item => ({ "address": item, "detail": res.data.data[item] }));
                    setTokens(tokens);
                    tokens.unshift({ address: '0xfac45d4b406d94cddfc48b198839673351cb2bf9', detail: { name: 'Now Meta', symbol: 'NMETA' } });
                    console.log(tokens);
                } else {
                    setTokens([{ address: address, detail: res.data.data }]);
                    console.log(tokens);
                }
            }).catch(err => {
                console.log(err);
            })
        }
        else if (chainId === 97 && address) {
            try {
                const name = await getTokenContract(address, ERC20_ABI, library?.getSigner()).name();
                const symbol = await getTokenContract(address, ERC20_ABI, library?.getSigner()).symbol();
                setTokens([{
                    address: address,
                    detail: {
                        name: name,
                        symbol: symbol
                    }
                }])
            } catch (e) {
                setTokens([]);
            }
        }
        else {
            setTokens([]);
        }
    }

    const selectToken = async (token) => {
        if ((selectType === INPUT && state.outputToken === token.address) || (selectType === OUTPUT && state.inputToken === token.address)) {
            return false;
        }
        if (account && (chainId === 56 || chainId === 97)) {
            const tokenContract = new ethers.Contract(token.address, ERC20_ABI, library?.getSigner());
            const decimals = await tokenContract.decimals();
            const balance = await tokenContract.balanceOf(account);

            const bigBalance = new BigNumber(balance.toString());
            const denom = new BigNumber(10).pow(decimals);
            const safeBalance = bigBalance.dividedBy(denom).toNumber();
            console.log(safeBalance);

            switch (selectType) {
                case INPUT:
                    update({
                        inputToken: token.address,
                        inputName: token.detail.name,
                        inputSymbol: token.detail.symbol,
                        inputBalance: safeBalance,
                        inputDecimal: decimals,
                        inputContract: tokenContract,
                        coinInput: false,
                    });
                    break;
                case OUTPUT:
                    update({
                        outputToken: token.address,
                        outputName: token.detail.name,
                        outputSymbol: token.detail.symbol,
                        outputBalance: safeBalance,
                        outputDecimal: decimals,
                        outputContract: tokenContract,
                        coinOutput: false,
                    });
                    break;
                default:
                    break;
            }
        }
        setTokenAddress('');
        onClickAway();
    }

    const setBinanceCoin = async () => {
        const bnbBalance = await library?.getSigner().getBalance();
        const bigNumberBalance = new BigNumber(bnbBalance.toString());
        const denom = new BigNumber(10).pow(18);
        const safeBalance = bigNumberBalance.dividedBy(denom).toNumber();
        console.log(state.coinInput, state.coinOutput);
        switch(selectType) {
            case INPUT :
                update({
                    inputToken: wbnb_address,
                    coinInput: true,
                    inputBalance: safeBalance,
                    inputDecimal: 9,
                    inputName: 'Binance Coin',
                    inputSymbol: 'BNB'
                });
                break;
            case OUTPUT:
                update({
                    outputToken: wbnb_address,
                    coinOutput: true,
                    outputBalance: safeBalance,
                    outputDecimal: 9,
                    outputName: 'Binance Coin',
                    outputSymbol: 'BNB'
                })
                break;
            default:
                break;
        }
        console.log(state.coinInput, state.coinOutput);
        onClickAway();
    }

    const initState = () => {
        update({
            inputToken: null,
            inputName: null,
            inputSymbol: null,
            inputBalance: 0,
            inputDecimal: 0,
            inputContract: null,
            outputToken: null,
            outputName: null,
            outputSymbol: null,
            outputBalance: 0,
            outputDecimal: 0,
            outputContract: null
        })
    }

    useEffect(() => {
        initState();
        setSearchText('');
    }, [chainId]);

    return (
        <Modal className='token-modal justify-center' visible={show} width={width} height={height} effect={effect} style={style} onClickAway={onClickAway}>
            <div className='flex col space-evenly align-center modal-board'>
                <div className='flex justify-center align-center modal-header'><h1>Select Cryptocurrency</h1></div>
                <div className='flex justify-center search-token'>
                    <input type="text" placeholder='Search token by address' className='search-token-input' value={tokenAddress} onChange={e => setSearchText(e.target.value)} />
                </div>
                <div className='flex special-list justify-center align-center'>
                    <div className='flex binance-coin justify-center align-center' onClick={setBinanceCoin}>
                        <span className='flex justify-center align-center'>
                            <img alt='BNB' src={BNB} />
                            Binance Coin (BNB)
                        </span>
                    </div>
                </div>
                <div className='token-list-wrapper'>
                    <div className='flex col justify-center token-list'>
                        {
                            tokens.map((item, key) => (
                                <div className={`flex coin-item align-center ${(selectType === INPUT && state.outputToken === item.address) || (selectType === OUTPUT && state.inputToken === item.address) ? 'coin-item-disabled' : ''}`} key={key} onClick={() => selectToken(item)}>
                                    <span className='flex asset-ico'><Image alt={item.detail.name} src={`https://assets.trustwalletapp.com/blockchains/smartchain/assets/${item.address}/logo.png`} fallbackSrc={Unknown} /></span>
                                    <span className='flex asset-symbol'>{item.detail.symbol}</span>
                                    <span className='flex asset-name'>{item.detail.name}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default SearchModal;
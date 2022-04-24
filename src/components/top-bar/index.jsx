import React, { useEffect, useContext } from "react";
import { useWeb3React } from "@web3-react/core";
import { injected } from "../../configs/connectors";
import SearchContext from "../../contexts/SearchToken";

import SmoothButton from "../smooth-button/SmoothButton";
import './top-bar.css';

import Logo from '../../assets/images/logo.png';

const TopBar = () => {

    const { account, activate, deactivate } = useWeb3React();
    const { update } = useContext(SearchContext);

    useEffect(async () => {

    }, [account]);

    return (
        <div className="flex space-between align-center top-bar-container">
            <div className="flex justify-center align-center menu-logo">
                <img className="flex logo-image" src={Logo} />
            </div>
            <div className="flex justify-center align-center menu-link">
                <div className="flex menu-link-item" onClick={() => update({app: 1})}>Swap</div>
                <div className="flex menu-link-item" onClick={() => update({app: 2})}>Liquidity Pool</div>
            </div>
            <div className="flex justify-center align-center wallet-option">
                <div className="flex wallet-address"></div>
                <div className="flex wallet-button">
                    <SmoothButton
                        label={!account ? `Wallet Connect` : `Disconnect (${account.substring(0, 5)}...${account.substring(account.length - 5, account.length - 1)})`}
                        onClick={!account ? () => activate(injected) : deactivate}
                    />
                </div>
            </div>
        </div>
    )
}

export default TopBar;
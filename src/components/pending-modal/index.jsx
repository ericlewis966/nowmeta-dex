import React from "react";
import { useWeb3React } from "@web3-react/core";
import Modal from "react-awesome-modal";
import { BoxesLoader } from "react-awesome-loaders";

import './pending-modal.css';

const PendingModal = ({ show, width, height, effect, className, onClickAway, message, tx }) => {

    const { chainId } = useWeb3React();

    return (
        <Modal visible={show} width={width} height={height} className={className} onClickAway={onClickAway} effect={effect}>
            <div className="flex col justify-center align-center pending-container">
                <div className="flex justify-center loader">
                    <BoxesLoader
                        boxColor={"#6366F1"}
                        style={{ marginBottom: "20px", height: "200px" }}
                        desktopSize={"100px"}
                        mobileSize={"80px"}
                    />
                </div>
                <div className="flex col justify-center align-center state-message">
                    <p className="flex">
                        {message}
                    </p>
                    <p className="flex explorer-link">
                        {
                            tx ? <a href={`https://${chainId === 56 ? '' : 'testnet.'}bscscan.com/tx/${tx}`} target="_blank">View on explorer</a> : <></>
                        }
                    </p>
                </div>
            </div>
        </Modal>
    )
}

export default PendingModal;
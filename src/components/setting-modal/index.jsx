import React, { useState, useContext } from 'react';
import Modal from 'react-awesome-modal';

import SearchContext from '../../contexts/SearchToken';
import GoldButton from '../gold-button/GoldButton';

import './setting-modal.css';


const SettingModal = ({ show, width, height, effect, onClickAway }) => {

    const { state, update } = useContext(SearchContext);


    const [slippage, setSlippage] = useState(state.slippage);
    const [deadline, setDeadline] = useState(state.tx_deadline);

    const confirmSetting = () => {
        update({
            slippage: !slippage ? state.slippage : slippage,
            tx_deadline: !deadline ? state.tx_deadline : deadline
        })

        onClickAway();
    }

    const Notification = ({ message }) => {
        return (
            <div className='flex justify-center align-center setting-notify'>
                <span>{message}</span>
            </div>
        )
    }

    return (
        <Modal visible={show} width={width} height={height} effect={effect} onClickAway={onClickAway}>
            <div className='flex col transaction-setting'>
                <div className='flex modal-header justify-center align-center'>
                    <h2>Transaction Settings</h2>
                </div>
                <div className='flex col align-center slippage-setting'>
                    <div className='flex justify-center align-center setting-caption'>
                        <h4>Slippage Tolerance</h4>
                    </div>
                    <div className='flex default-slippage-setting space-between align-center'>
                        <div className='flex default-slippage-button slippage-auto'>
                            <button onClick={() => setSlippage(0.5)}>Auto</button>
                        </div>
                        <div className='flex default-slippage-button'>
                            <button onClick={() => setSlippage(0.1)}>0.1%</button>
                        </div>
                        <div className='flex default-slippage-button'>
                            <button onClick={() => setSlippage(0.5)}>0.5%</button>
                        </div>
                        <div className='flex default-slippage-button'>
                            <button onClick={() => setSlippage(1)}>1.0%</button>
                        </div>
                    </div>
                    <div className='flex justify-center align-center manual-slippage-setting'>
                        <input type="number" className='slippage-setting-input' min={0} value={slippage} onChange={(e) => setSlippage(e.target.value)} placeholder="Default: 0.5%" />
                    </div>
                    {
                        slippage > 0 && slippage < 0.5 ? <Notification message={"⚠Your transaction may fail."}/> : slippage > 1 ? <Notification message={"🚀Your transaction may frontrun."}/> : <></>
                    }
                    <div className='flex justify-center align-center setting-caption'>
                        <h4>Transaction Deadline</h4>
                    </div>
                    <div className='flex justify-center align-center transaction-deadline'>
                        <input type="number" className='flex deadline-input' min={0} value={deadline} onChange={(e) => setDeadline(e.target.value)} placeholder="Default: 10 min" />
                    </div>
                    <div className='flex justify-center align-center setting-confirm'>
                        <GoldButton className="setting-confirm-button" label="Apply" onClick={confirmSetting} />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default SettingModal;
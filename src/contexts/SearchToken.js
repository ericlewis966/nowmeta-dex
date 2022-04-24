import { createContext, useReducer } from "react";

const SearchContext = createContext('');

const reducer = (state, pair) => ({ ...state, ...pair });

const initialState = {
    inputToken: null,
    inputName: null,
    inputSymbol: null,
    inputDecimal: 0,
    inputLogo: null,
    inputContract: null,
    inputBalance: 0,
    inputAmount: 0,
    outputToken: null,
    outputName: null,
    outputSymbol: null,
    outputDecimal: 0,
    outputLogo: null,
    outputBalance: 0,
    outputContract: null,
    outputAmount: 0,
    slippage: 0.5,
    tx_deadline: 10,
    app: 1,
    pendingMessage: null,
    tx_hash: null,
    coinInput: false,
    coinOutput: false,
}

export const SearchTokenProvider = (props) => {
    const [state, update] = useReducer(reducer, initialState);

    return (
        <SearchContext.Provider value={{ state, update }}>
            {props.children}
        </SearchContext.Provider>
    )
}
export default SearchContext;
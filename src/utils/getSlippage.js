export const getSlippage = (amountOut, slippage) => {
    return amountOut - (amountOut * slippage / 100);
}

export const fromSlippage = (amountIn, slippage) => {
    return amountIn + (amountIn * slippage / 100);
}
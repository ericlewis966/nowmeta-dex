import React, { useState } from 'react';
import { Web3ReactProvider } from '@web3-react/core';
import getLibrary from './configs/getLibrary';
import Trade from './views/trade';
import { SearchTokenProvider } from './contexts/SearchToken';

import './App.css';

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <SearchTokenProvider>
        <div className="App">
          <Trade />
        </div>
      </SearchTokenProvider>
    </Web3ReactProvider>
  );
}

export default App;

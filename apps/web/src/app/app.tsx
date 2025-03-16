import React from 'react';
import Dashboard from '../pages/Dashboard';


function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', height: '100vh', width: '100vw' }}>
      <div style={{ height: '50%', width: '30%' }}>
        <Dashboard />
      </div>
    </div>
  );
}

export default App;

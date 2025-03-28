import React from 'react';
import Dashboard from '../pages/Dashboard';
import Navbar from '../components/NavBar';
import '../styles.css';


function App() {
  return (
    <div className='main-container'>
      <div style={{
        width: "100%",
        backgroundColor: "#026734"
      }}>
        <Navbar />
      </div>
      <div style={{ height: '100%', width: '100%' }}>
        <Dashboard />
      </div>
    </div>
  );
}

export default App;

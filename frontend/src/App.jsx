import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import DailyUpdate from './pages/DailyUpdate';
import FieldMaster from './pages/FieldMaster';
import AddField from './pages/AddField';
import UserMaster from './pages/UserMaster';
import AddUser from './pages/AddUser';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/daily-updates" element={<DailyUpdate />} />
            <Route path="/field-master" element={<FieldMaster />} />
            <Route path="/add-field" element={<AddField />} />
            <Route path="/user-master" element={<UserMaster />} />
            <Route path="/add-user" element={<AddUser />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

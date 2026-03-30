import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const Home = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [logs, setLogs] = useState([]); 
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [recentLogs, setRecentLogs] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const showToast = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage('');
    }, 4000);
  };

  const fetchData = async (selectedDate) => {
    try {
      const logsRes = await axios.get(`${API_BASE}/moisture?log_date=${selectedDate}`);
      const data = logsRes.data;
      setLogs(data);
      
      const addedLogs = data.filter(log => log.log_id !== null);
      if (data.length > 0 && addedLogs.length > 0) {
        showToast("Already added for the day. Please go to Daily Updates to edit.");
      }
    } catch (error) {
      console.error("Error fetching logs", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(res.data);
      if (res.data.length > 0) setSelectedUser(res.data[0].user_id.toString());
    } catch (error) {
      console.error("Error fetching users", error);
    }
  }

  const fetchYesterdayLogs = async () => {
    try {
      const yesterdayDate = getYesterdayString();
      const logsRes = await axios.get(`${API_BASE}/moisture?log_date=${yesterdayDate}`);
      setRecentLogs(logsRes.data.filter(log => log.log_id !== null && log.log_id !== undefined));
    } catch (error) {
      console.error("Error fetching yesterday logs", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchYesterdayLogs();
  }, []);

  useEffect(() => {
    fetchData(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleMoistureChange = (fieldId, value) => {
    setLogs(logs.map(log => 
      log.field_id === fieldId ? { ...log, moisture_level: parseFloat(value) || 0 } : log
    ));
  };

  const handleSaveAll = async () => {
    if (!selectedUser) {
      alert("Please select a Logger (User) first.");
      return;
    }
    
    // Only save logs that don't have a log_id and have a valid moisture level > 0
    const newLogs = logs.filter(log => !log.log_id && log.moisture_level > 0);
    
    if (newLogs.length === 0) {
      const addedLogs = logs.filter(log => log.log_id !== null);
      if (addedLogs.length > 0) {
        showToast("Already added for the day. Please edit in Daily Updates.");
      } else {
        showToast("Please enter at least one new moisture level.");
      }
      return;
    }

    try {
      const promises = newLogs.map(log => {
        return axios.post(`${API_BASE}/moisture`, {
          field_id: log.field_id,
          log_date: date,
          moisture_level: log.moisture_level,
          user_id: parseInt(selectedUser)
        });
      });
      await Promise.all(promises);
      showToast("All new records saved successfully!");
      fetchData(date);
      if (date === getYesterdayString()) {
        fetchYesterdayLogs();
      }
    } catch (error) {
      console.error("Error saving records", error);
      showToast("Error saving records");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Daily Moisture Entry</h1>
        <p className="page-description">Record soil moisture levels for your fields.</p>
      </div>

      <div className="card flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="form-group" style={{ marginBottom: 0 }}>
             <label className="form-label">Log Date</label>
             <input 
               type="date" 
               className="form-input" 
               value={date} 
               onChange={(e) => setDate(e.target.value)}
             />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
             <label className="form-label">Logger (User)</label>
             <select 
               className="form-select" 
               value={selectedUser} 
               onChange={(e) => setSelectedUser(e.target.value)}
             >
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u.user_id} value={u.user_id}>{u.username}</option>
                ))}
             </select>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSaveAll}>
          <Save size={18} /> Save All
        </button>
      </div>

      <div className="card table-container">
        <table className="table bordered">
          <thead>
            <tr>
              <th>Field Name</th>
              <th>Previous Day ({getYesterdayString()})</th>
              <th>Today's Moisture (%)</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="3">No fields configured. Please add fields in Masters.</td></tr>
            ) : logs.map(log => {
              const prevLog = recentLogs.find(r => r.field_id === log.field_id);
              const prevLevel = prevLog ? `${prevLog.moisture_level}%` : '-';
              return (
              <tr key={log.field_id}>
                <td style={{ width: '30%' }}>{log.field_name}</td>
                <td className="font-semibold text-muted" style={{ width: '20%' }}>{prevLevel}</td>
                <td style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input" 
                    value={log.moisture_level === 0 && !log.log_id ? '' : log.moisture_level} 
                    onChange={(e) => handleMoistureChange(log.field_id, e.target.value)}
                    placeholder="e.g. 45.5"
                    disabled={!!log.log_id}
                    style={{ 
                      maxWidth: '150px', 
                      backgroundColor: log.log_id ? 'var(--background)' : 'var(--surface)',
                      cursor: log.log_id ? 'not-allowed' : 'text',
                      marginRight: '1rem'
                    }}
                  />
                  {log.log_id && (
                    <span className="text-muted text-sm font-semibold" style={{color: '#10B981'}}>
                       ✓ Added
                    </span>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {statusMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          padding: '1rem 1.5rem',
          backgroundColor: statusMessage.includes('Already') || statusMessage.includes('Error') ? '#EF4444' : '#10B981',
          color: 'white',
          borderRadius: '0.5rem',
          boxShadow: 'var(--shadow-md)',
          zIndex: 50,
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}>
          {statusMessage}
        </div>
      )}
    </div>
  );
};

export default Home;

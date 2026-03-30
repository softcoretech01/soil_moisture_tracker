import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

const DailyUpdate = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // States for inline editing
  const [editingLogId, setEditingLogId] = useState(null);
  const [editMoisture, setEditMoisture] = useState('');
  const [expandedDates, setExpandedDates] = useState({});

  const fetchAllLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/moisture/all`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLogs();
  }, []);

  // Group logs by date
  const groupedLogs = logs.reduce((acc, log) => {
    const d = log.log_date instanceof Date ? log.log_date.toISOString().split('T')[0] : log.log_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(log);
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b) - new Date(a));
  
  const filteredDates = sortedDates.filter(date => date.includes(searchTerm));

  const exportToExcel = () => {
    const exportLogs = searchTerm ? logs.filter(l => l.log_date.includes(searchTerm)) : logs;
    
    if (exportLogs.length === 0) {
      alert("No data to export.");
      return;
    }
    const headers = ['Log Date', 'Field Name', 'Moisture Level (%)'];
    const csvRows = exportLogs.map(l => `${l.log_date},"${l.field_name}",${l.moisture_level}`);
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `moisture_logs_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (sortedDates.length > 0 && Object.keys(expandedDates).length === 0) {
      setExpandedDates({ [sortedDates[0]]: true });
    }
  }, [sortedDates]);

  const toggleExpand = (date) => {
    setExpandedDates(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const startEdit = (log) => {
    setEditingLogId(log.log_id);
    setEditMoisture(log.moisture_level);
  };

  const cancelEdit = () => {
    setEditingLogId(null);
    setEditMoisture('');
  };

  const handleUpdate = async (log) => {
    try {
      await axios.post(`${API_BASE}/moisture`, {
        field_id: log.field_id,
        log_date: log.log_date,
        moisture_level: parseFloat(editMoisture),
        user_id: log.user_id
      });
      alert('Updated successfully');
      setEditingLogId(null);
      fetchAllLogs();
    } catch (err) {
      console.error(err);
      alert('Error updating');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1rem', paddingBottom: 0 }}>
        <h1 className="page-title" style={{ fontSize: '1.25rem' }}>Daily Updates Master - List</h1>
      </div>

      <div className="card flex items-center justify-between mb-4" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius)' }}>
        <div className="flex items-center gap-4">
          <span className="font-medium text-sm">Search</span>
          <select className="form-select" style={{ width: '120px', borderRadius: '2rem' }}>
             <option>2026</option>
          </select>
          <select className="form-select" style={{ width: '120px', borderRadius: '2rem' }}>
             <option>March</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>Search</button>
          <button className="btn btn-success" onClick={() => navigate('/')}>+ New</button>
          <button className="btn btn-warning" onClick={exportToExcel}>Export Excel</button>
          <button className="btn btn-danger">Cancel</button>
        </div>
      </div>

      <div className="card flex items-center justify-between mb-6" style={{ backgroundColor: '#F8F9FA', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius)' }}>
        <div className="flex items-center gap-6">
          <span className="font-bold text-sm" style={{ color: 'var(--primary)' }}>Updates Data</span>
          <span className="font-bold text-sm" style={{ color: 'var(--btn-red)' }}>Average Moisture: 45.6%</span>
        </div>
        <div className="flex items-center gap-6">
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by date (YYYY-MM-DD)..." 
            style={{ width: '250px', borderRadius: '2rem' }} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredDates.length === 0 ? (
        <p>No historical data found matching criteria.</p>
      ) : (
        filteredDates.map(date => (
          <div key={date} className="mb-8">
            <h2 
              className="date-header flex items-center justify-between"
              onClick={() => toggleExpand(date)}
              style={{ 
                cursor: 'pointer',
                borderBottom: expandedDates[date] ? 'none' : '1px solid var(--border)',
                borderBottomLeftRadius: expandedDates[date] ? '0' : 'var(--radius)',
                borderBottomRightRadius: expandedDates[date] ? '0' : 'var(--radius)'
              }}
            >
              <span>Date: {date}</span>
              {expandedDates[date] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </h2>
            {expandedDates[date] && (
              <div className="card date-table-container">
                <table className="table bordered">
                  <thead>
                  <tr>
                    <th>Field Name</th>
                    <th>Moisture Level (%)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedLogs[date].map(log => (
                    <tr key={log.log_id}>
                      <td>{log.field_name}</td>
                      <td>
                        {editingLogId === log.log_id ? (
                          <input 
                            type="number"
                            step="0.01"
                            className="form-input"
                            value={editMoisture}
                            onChange={(e) => setEditMoisture(e.target.value)}
                            style={{ maxWidth: '120px' }}
                          />
                        ) : (
                          <span className="font-semibold">{log.moisture_level}%</span>
                        )}
                      </td>
                      <td>
                        {editingLogId === log.log_id ? (
                          <div className="flex gap-2">
                             <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleUpdate(log)}>
                               <Save size={16} /> <span style={{fontSize: '0.8rem'}}>Save</span>
                             </button>
                             <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem' }} onClick={cancelEdit}>
                               <X size={16} /> <span style={{fontSize: '0.8rem'}}>Cancel</span>
                             </button>
                          </div>
                        ) : (
                           <button className="btn" style={{ padding: '0.4rem 0.8rem', backgroundColor: '#E5E7EB', color: 'var(--text-main)' }} onClick={() => startEdit(log)}>
                             <Edit2 size={16} /> <span style={{fontSize: '0.8rem'}}>Edit</span>
                           </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default DailyUpdate;

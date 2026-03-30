import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Droplet, Filter, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const Analytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAnalytics = async (sDate = startDate, eDate = endDate) => {
    setLoading(true);
    let url = `${API_BASE}/analytics`;
    if (sDate && eDate) {
      url += `?start_date=${sDate}&end_date=${eDate}`;
    }
    try {
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleFilter = () => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      alert("Please select both start and end dates.");
      return;
    }
    fetchAnalytics();
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    fetchAnalytics('', '');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Moisture Analytics</h1>
        <p className="page-description">Overview of average soil moisture across all fields.</p>
      </div>

      <div className="card mb-6" style={{ padding: '1rem 1.5rem' }}>
        <h2 className="font-bold mb-3" style={{ fontSize: '1.1rem' }}>Filter by Date Range</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Start Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>End Date</label>
            <input 
              type="date" 
              className="form-input" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
            />
          </div>
          <button className="btn btn-primary" onClick={handleFilter} style={{ padding: '0.4rem 1rem', height: '38px' }}>
            <Filter size={16} /> Filter
          </button>
          <button className="btn" onClick={handleClear} style={{ padding: '0.4rem 1rem', height: '38px', backgroundColor: '#F3F4F6' }}>
            <RefreshCw size={16} /> Reset
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {data.length === 0 ? (
            <p>No fields found.</p>
          ) : data.map(item => (
            <div key={item.field_id} className="card flex flex-col justify-center transition-all hover:translate-y-[-2px]" style={{ minHeight: '130px', borderTop: '4px solid var(--primary)' }}>
              <h2 className="text-lg font-bold mb-2 uppercase tracking-wide">{item.field_name}</h2>
              <div className="text-sm text-muted mb-2 font-medium">
                Total Logs: {item.total_logs}
              </div>
              <div className="flex items-center gap-2 text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                <Droplet size={24} />
                {item.average_moisture.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Analytics;

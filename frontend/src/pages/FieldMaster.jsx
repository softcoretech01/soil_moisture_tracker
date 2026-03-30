import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

const FieldMaster = () => {
  const [fields, setFields] = useState([]);
  const navigate = useNavigate();

  const fetchFields = async () => {
    try {
      const res = await axios.get(`${API_BASE}/fields`);
      setFields(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleDeleteField = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_BASE}/fields/${id}`);
      fetchFields();
    } catch (err) {
      alert("Error deleting field");
    }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center" style={{ display: 'flex' }}>
        <div>
          <h1 className="page-title">Field Master</h1>
          <p className="page-description">Manage all fields in the system.</p>
        </div>
        <button className="btn btn-primary font-bold" onClick={() => navigate('/add-field')} style={{ padding: '0.5rem 1rem' }}>
          <Plus size={18} /> Add New Field
        </button>
      </div>

      <div className="card table-container mt-6">
        <table className="table">
          <thead>
            <tr>
              <th>Field Name</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {fields.map(f => (
              <tr key={f.field_id}>
                <td>{f.field_name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{f.description || '-'}</td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '0.4rem 0.6rem' }} onClick={() => handleDeleteField(f.field_id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr><td colSpan="3" className="text-center py-4 text-muted">No fields found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FieldMaster;

import React, { useState } from 'react';
import axios from 'axios';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

const AddField = () => {
  const [newField, setNewField] = useState({ field_name: '', description: '' });
  const navigate = useNavigate();

  const handleAddField = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/fields`, newField);
      alert("Field added successfully!");
      navigate('/field-master');
    } catch (err) {
      alert("Error adding field");
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <button className="btn mb-4" onClick={() => navigate('/field-master')} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#F3F4F6' }}>
          <ArrowLeft size={16} /> <span style={{fontSize: '0.85rem'}}>Back to List</span>
        </button>
        <h1 className="page-title">Add New Field</h1>
        <p className="page-description">Create a new field for soil moisture tracking.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleAddField}>
          <div className="form-group">
            <label className="form-label">Field Name</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              value={newField.field_name}
              onChange={e => setNewField({...newField, field_name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input 
              type="text" 
              className="form-input" 
              value={newField.description}
              onChange={e => setNewField({...newField, description: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary mt-4 w-full justify-center">
            <Plus size={18} /> Save Field
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddField;

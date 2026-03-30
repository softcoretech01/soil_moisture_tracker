import React, { useState } from 'react';
import axios from 'axios';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

const AddUser = () => {
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'User' });
  const navigate = useNavigate();

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/users`, newUser);
      alert("User added successfully!");
      navigate('/user-master');
    } catch (err) {
      alert("Error adding user");
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <button className="btn mb-4" onClick={() => navigate('/user-master')} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#F3F4F6' }}>
          <ArrowLeft size={16} /> <span style={{fontSize: '0.85rem'}}>Back to List</span>
        </button>
        <h1 className="page-title">Add New User</h1>
        <p className="page-description">Create a new system user or admin.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleAddUser}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              value={newUser.username}
              onChange={e => setNewUser({...newUser, username: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              required 
              value={newUser.password}
              onChange={e => setNewUser({...newUser, password: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select 
              className="form-select" 
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value})}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary mt-4 w-full justify-center">
            <Plus size={18} /> Save User
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;

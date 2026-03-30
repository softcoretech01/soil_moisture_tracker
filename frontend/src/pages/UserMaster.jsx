import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

const UserMaster = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_BASE}/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert("Error deleting user");
    }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center" style={{ display: 'flex' }}>
        <div>
          <h1 className="page-title">User Master</h1>
          <p className="page-description">Manage system loggers and admin users.</p>
        </div>
        <button className="btn btn-primary font-bold" onClick={() => navigate('/add-user')} style={{ padding: '0.5rem 1rem' }}>
          <Plus size={18} /> Add New User
        </button>
      </div>

      <div className="card table-container mt-6">
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id}>
                <td className="font-semibold">{u.username}</td>
                <td>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '1rem', 
                    fontSize: '0.85rem', 
                    backgroundColor: u.role === 'Admin' ? '#FEE2E2' : '#E0E7FF',
                    color: u.role === 'Admin' ? '#991B1B' : '#3730A3',
                    fontWeight: 600
                  }}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <button className="btn btn-danger" style={{ padding: '0.4rem 0.6rem' }} onClick={() => handleDeleteUser(u.user_id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="3" className="text-center py-4 text-muted">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserMaster;

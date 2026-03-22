import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebaradmin from "../components/sidebaradmin";

const ManageUsers = () => {
  const API_URL = "http://localhost:3000/api/user";
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: "", password: "", role: "user" });
  const [editingUser, setEditingUser] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/user/register", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      setFormData({ username: "", password: "", role: "user" });
    } catch (error) {
      console.error("Error adding user:", error.response?.data || error.message);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await axios.put(`${API_URL}/${editingUser._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      setEditingUser(null);
      setFormData({ username: "", password: "", role: "user" });
    } catch (error) {
      console.error("Error updating user:", error.response?.data || error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`${API_URL}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error.response?.data || error.message);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: "", role: user.role });
  };

  return (
    <div className="container">
      <Sidebaradmin />
      <h2>Manage Users</h2>

      <form onSubmit={editingUser ? handleEditUser : handleAddUser}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">{editingUser ? "Update User" : "Add User"}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleEditClick(user)}>Edit</button>
                <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;

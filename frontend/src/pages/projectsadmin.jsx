import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebaradmin from "../components/sidebaradmin";
import "../styles/projectManage.css";

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/project");
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      if (editingId) {
        await axios.put(`http://localhost:3000/api/project/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        await axios.post("http://localhost:3000/api/project", formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }
      fetchProjects();
      setTitle("");
      setDescription("");
      setImage(null);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/project/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEdit = (project) => {
    setTitle(project.title);
    setDescription(project.description);
    setEditingId(project._id);
  };

  return (
    <div className="admin-container">
      <Sidebaradmin />
      <div className="admin-content">
        <h2>Manage Projects</h2>
        <form onSubmit={handleSubmit} className="project-form">
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
          <button type="submit" className="btn btn-primary">{editingId ? "Update" : "Add"} Project</button>
        </form>
        <div className="project-list">
          {projects.map((project) => (
            <div key={project._id} className="project-item">
              <div className="project-info">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.image && <img src={`http://localhost:3000/${project.image}`} alt={project.title} className="project-image" />}
              </div>
              <div>
                <button onClick={() => handleEdit(project)} className="btn btn-edit">Edit</button>
                <button onClick={() => handleDelete(project._id)} className="btn btn-delete">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageProjects;

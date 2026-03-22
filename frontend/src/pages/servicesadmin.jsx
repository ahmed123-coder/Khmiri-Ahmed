import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebaradmin from "../components/sidebaradmin";
import "../styles/manageservice.css";

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: null,
    image: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/service");
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await axios.delete(`http://localhost:3000/api/service/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        fetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const handleEdit = (service) => {
    setEditingService(service._id);
    setFormData({
      title: service.title,
      description: service.description,
      icon: null,
      image: null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formPayload = new FormData();
    formPayload.append("title", formData.title);
    formPayload.append("description", formData.description);
    if (formData.icon) formPayload.append("icon", formData.icon);
    if (formData.image) formPayload.append("image", formData.image);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      };

      if (editingService) {
        await axios.put(`http://localhost:3000/api/service/${editingService}`, formPayload, config);
      } else {
        await axios.post("http://localhost:3000/api/service", formPayload, config);
      }

      setEditingService(null);
      setFormData({ title: "", description: "", icon: null, image: null });
      fetchServices();
    } catch (error) {
      console.error("Error saving service:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <Sidebaradmin />
      <div className="management-container">
        <h2>Manage Services</h2>
        <form onSubmit={handleSubmit} className="service-form">
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, icon: e.target.files[0] })}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Processing..." : editingService ? "Update" : "Add"} Service
          </button>
        </form>

        <div className="service-list">
          {services.map((service) => (
            <div key={service._id} className="service-card">
              <div className="service-actions">
                <button onClick={() => handleEdit(service)}>Edit</button>
                <button onClick={() => handleDelete(service._id)}>Delete</button>
              </div>
              {service.image && (
                <img
                  src={`http://localhost:3000/${service.image}`}
                  alt={service.title}
                  className="service-image"
                />
              )}
              {service.icon && (
                <img
                  src={`http://localhost:3000/${service.icon}`}
                  alt="Icon"
                  className="service-icon"
                />
              )}
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceManager;

import React from "react";
import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ProjectCard } from "./ProjectCard";
import colorSharp2 from "../assets/img/color-sharp2.png";
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import api from "../api";

export const Projects = ({ title, subtitle }) => {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, catRes] = await Promise.all([
          api.get("/api/project"),
          api.get("/api/category")
        ]);
        setProjects(projRes.data);
        setCategories(catRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.categories?.some(c => (typeof c === 'object' ? c.name : c) === filter));

  return (
    <section className="project" id="projects">
      <Container>
        <Row>
          <Col size={12}>
            <TrackVisibility>
              {({ isVisible }) =>
                <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                  <h2>{title || 'Projects'}</h2>
                  {subtitle && <p className="mb-8" style={{ color: '#B8B8B8', fontSize: '18px', letterSpacing: '0.8px', lineHeight: '1.5em' }}>{subtitle}</p>}
                  
                  {/* Category Filter Bar */}
                  <div className="flex flex-wrap justify-center gap-3 mb-12">
                    <button 
                      onClick={() => setFilter('All')}
                      className={`px-6 py-2 rounded-full border transition-all duration-300 ${filter === 'All' ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-transparent border-white/20 text-white/60 hover:border-white'}`}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat._id}
                        onClick={() => setFilter(cat.name)}
                        className={`px-6 py-2 rounded-full border transition-all duration-300 ${filter === cat.name ? 'bg-violet-600 border-violet-600 text-white shadow-lg' : 'bg-transparent border-white/20 text-white/60 hover:border-white'}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <Row>
                    {filteredProjects.map((project, index) => (
                      <ProjectCard
                        key={project._id || index}
                        title={project.title}
                        description={project.description}
                        imgUrl={project.image}
                        slug={project.slug}
                        id={project._id}
                      />
                    ))}
                  </Row>
                  {filteredProjects.length === 0 && (
                    <div className="text-center py-20 text-white/30 text-xl">
                      No projects found in this category.
                    </div>
                  )}
                </div>
              }
            </TrackVisibility>
          </Col>
        </Row>
      </Container>
      <img className="background-image-right" src={colorSharp2} alt="Background" />
    </section>
  );
};

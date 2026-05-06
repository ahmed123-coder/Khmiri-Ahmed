import React from "react";
import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { ProjectCard } from "./ProjectCard";
import colorSharp2 from "../assets/img/color-sharp2.png";
import 'animate.css';
import TrackVisibility from 'react-on-screen';
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";

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
                  <div className="text-center mb-12">
                    <h2 className="text-5xl font-bold mb-4">{title || 'Projects'}</h2>
                    {subtitle && <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">{subtitle}</p>}
                  </div>
                  
                  {/* Premium Filter Bar */}
                  <div className="flex justify-center mb-16">
                    <div className="p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-wrap gap-1">
                      <button 
                        onClick={() => setFilter('All')}
                        className={`relative px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${
                          filter === 'All' 
                          ? 'text-white' 
                          : 'text-white/40 hover:text-white/70'
                        }`}
                      >
                        {filter === 'All' && (
                          <motion.div 
                            layoutId="activeFilter"
                            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20"
                            style={{ borderRadius: '12px' }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <span className="relative z-10">All</span>
                      </button>
                      
                      {categories.map(cat => (
                        <button 
                          key={cat._id}
                          onClick={() => setFilter(cat.name)}
                          className={`relative px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 overflow-hidden ${
                            filter === cat.name 
                            ? 'text-white' 
                            : 'text-white/40 hover:text-white/70'
                          }`}
                        >
                          {filter === cat.name && (
                            <motion.div 
                              layoutId="activeFilter"
                              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20"
                              style={{ borderRadius: '12px' }}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <span className="relative z-10">{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Row className="g-4">
                    <AnimatePresence mode="popLayout">
                      {filteredProjects.map((project) => (
                        <Col key={project._id} xs={12} sm={6} lg={4}>
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.4 }}
                          >
                            <ProjectCard
                              title={project.title}
                              description={project.description}
                              imgUrl={project.image}
                              images={project.images} // Pass the rest of the images
                              slug={project.slug}
                              id={project._id}
                            />
                          </motion.div>
                        </Col>
                      ))}
                    </AnimatePresence>
                  </Row>
                  
                  {filteredProjects.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-20 text-white/20 text-xl font-light italic"
                    >
                      No masterpieces found in this category yet.
                    </motion.div>
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

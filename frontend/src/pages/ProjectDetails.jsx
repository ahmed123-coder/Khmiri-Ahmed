import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Badge, Modal } from "react-bootstrap";
import { ArrowLeft, ExternalLink, Calendar, Tag, PlayCircle, Globe, ChevronRight, X, Clock, Layers } from "lucide-react";
import api from "../api";
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import "../App.css";
import 'animate.css';

const ProjectDetails = () => {
  const { slugOrId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [siteContent, setSiteContent] = useState(null);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, siteRes] = await Promise.all([
          api.get(`/api/project/${slugOrId}`),
          api.get("/api/site/selected")
        ]);
        setProject(projectRes.data);
        setSiteContent(siteRes.data);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Project not found or server error.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white p-4">
        <h2 className="text-4xl font-bold mb-4">Oops!</h2>
        <p className="text-white/60 mb-8">{error || "Project not found."}</p>
        <Link to="/" className="vvd-btn d-inline-flex align-items-center gap-2">
          <ArrowLeft size={20} /> Back to Home
        </Link>
      </div>
    );
  }

  const footerSection = siteContent?.sections?.find(s => s.key === 'footer' && s.visible);

  return (
    <div className="App project-details-page bg-[#030303]">
      <div className="sticky-navbar-wrapper" style={{ position: 'relative', zIndex: 10000 }}>
        <NavBar
          logo={siteContent?.logoheader}
          siteName={siteContent?.siteName}
          linkedIn={siteContent?.linkedIn}
          facebook={siteContent?.facebook}
          instagram={siteContent?.instagram}
        />
      </div>

      <main>
        {/* Hero Section with Immersive Background */}
        <section className="relative pt-40 pb-24 overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img src={project.image} className="w-full h-full object-cover blur-3xl scale-150" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303]" />
          </div>

          <Container className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <nav aria-label="breadcrumb" className="mb-8">
                <ol className="flex items-center gap-2 text-sm">
                  <li><Link to="/" className="text-white/40 hover:text-white transition-colors">Home</Link></li>
                  <li className="text-white/20"><ChevronRight size={14} /></li>
                  <li className="text-white/40 hover:text-white transition-colors uppercase tracking-widest text-[10px] font-bold">Projects</li>
                  <li className="text-white/20"><ChevronRight size={14} /></li>
                  <li className="text-white font-semibold truncate max-w-[200px]">{project.title}</li>
                </ol>
              </nav>

              <Row className="align-items-end g-5">
                <Col lg={8}>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.categories?.map(cat => (
                      <span key={typeof cat === 'object' ? cat._id : cat} className="px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">
                        {typeof cat === 'object' ? cat.name : 'Category'}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                    {project.title}
                  </h1>
                  <div className="flex flex-wrap gap-8 text-white/40 border-t border-white/5 pt-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Date</span>
                      <div className="flex items-center gap-2 text-white/80">
                        <Calendar size={14} className="text-purple-500" />
                        <span className="font-medium text-sm">{project.date ? new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Ongoing'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Duration</span>
                      <div className="flex items-center gap-2 text-white/80">
                        <Clock size={14} className="text-blue-500" />
                        <span className="font-medium text-sm">4-6 Weeks</span>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col lg={4} className="text-lg-end">
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-purple-500 hover:text-white transition-all duration-500 transform hover:-translate-y-2 shadow-2xl">
                      Visit Project <Globe size={18} />
                    </a>
                  )}
                </Col>
              </Row>
            </motion.div>
          </Container>
        </section>

        {/* Main Content */}
        <section className="pb-40">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative group rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] mb-24"
            >
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-auto object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </motion.div>

            <Row className="g-5">
              <Col lg={7}>
                <div className="space-y-16">
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-3xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-4">
                      <span className="w-12 h-0.5 bg-purple-500"></span>
                      Project Overview
                    </h3>
                    <div className="text-xl text-white/60 leading-relaxed font-light">
                      <div dangerouslySetInnerHTML={{ __html: (project?.description || '').replace(/\n/g, '<br/>') }} />
                    </div>
                  </div>

                  {project.video && (
                    <div className="rounded-[3rem] overflow-hidden border border-white/5 bg-white/[0.02] p-8 shadow-2xl">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <PlayCircle size={24} className="text-purple-500" />
                        Product Demonstration
                      </h3>
                      <div className="aspect-video rounded-3xl overflow-hidden bg-black/40 ring-1 ring-white/5">
                        {project.video.includes('youtube.com') || project.video.includes('youtu.be') ? (
                          <iframe
                            className="w-full h-full"
                            src={project.video.replace('watch?v=', 'embed/').split('&')[0]}
                            title="Project Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <video src={project.video} controls className="w-full h-full object-cover"></video>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Col>
              
              <Col lg={5}>
                <div className="sticky top-32 space-y-8">
                  {/* Tech Stack Card */}
                  <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 backdrop-blur-3xl shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                        <Layers size={20} />
                      </div>
                      <h4 className="text-xl font-bold text-white tracking-tight uppercase">Technologies</h4>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-10">
                      {project?.tags?.map(tag => (
                        <span key={tag} className="px-4 py-2 bg-white/5 border border-white/5 text-white/60 text-xs font-semibold rounded-xl hover:bg-white/10 hover:text-white transition-all cursor-default">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <hr className="border-white/5 mb-8" />

                    {project?.images && project.images.length > 0 && (
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white/20 mb-6">Gallery Highlights</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {project.images.slice(0, 4).map((img, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => setSelectedImg(img)}
                              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5 cursor-pointer"
                            >
                              <img src={img} alt="" className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-all flex items-center justify-center">
                                <ExternalLink size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              {idx === 3 && project.images.length > 4 && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white font-black">
                                  +{project.images.length - 4}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to="/" className="group flex items-center justify-center gap-3 py-6 text-white/30 hover:text-white transition-all duration-500">
                    <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
                    <span className="text-xs font-black uppercase tracking-widest">Back to Showcase</span>
                  </Link>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImg && (
          <Modal 
            show={true} 
            onHide={() => setSelectedImg(null)} 
            centered 
            size="xl" 
            contentClassName="bg-transparent border-0"
            className="backdrop-blur-3xl"
          >
            <Modal.Body className="p-0 relative">
              <button 
                onClick={() => setSelectedImg(null)}
                className="absolute -top-16 right-0 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
              <motion.img 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={selectedImg} 
                alt="" 
                className="w-full h-auto rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,1)]" 
              />
            </Modal.Body>
          </Modal>
        )}
      </AnimatePresence>

      {footerSection && <Footer footer={footerSection.content} />}
    </div>
  );
};

export default ProjectDetails;



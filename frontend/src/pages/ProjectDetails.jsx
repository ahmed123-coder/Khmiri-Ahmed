import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Badge, Modal } from "react-bootstrap";
import { ArrowLeft, ExternalLink, Calendar, Tag, PlayCircle, Globe, ChevronRight, X } from "lucide-react";
import api from "../api";
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import "../App.css";
import 'animate.css';

const ProjectDetailsSkeleton = () => (
  <div className="App project-details-page animate-pulse">
    <div className="h-20 bg-white/5 mb-20" />
    <Container>
      <div className="h-6 w-32 bg-white/10 rounded mb-8" />
      <Row className="align-items-center mb-10">
        <Col lg={7}>
          <div className="h-12 w-3/4 bg-white/10 rounded mb-4" />
          <div className="h-6 w-1/2 bg-white/5 rounded" />
        </Col>
        <Col lg={5} className="text-lg-end">
          <div className="h-12 w-40 bg-white/10 rounded d-inline-block" />
        </Col>
      </Row>
      <div className="h-[400px] w-full bg-white/5 rounded-4 mb-12" />
      <Row>
        <Col lg={8}>
          <div className="h-8 w-48 bg-white/10 rounded mb-6" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-full bg-white/5 rounded" />
            <div className="h-4 w-2/3 bg-white/5 rounded" />
          </div>
        </Col>
        <Col lg={4}>
          <div className="h-64 w-full bg-white/5 rounded-4" />
        </Col>
      </Row>
    </Container>
  </div>
);

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
        setTimeout(() => setLoading(false), 500); // Smooth transition
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slugOrId]);

  if (loading) return <ProjectDetailsSkeleton />;

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-white p-4">
        <div className="text-center animate__animated animate__fadeIn">
          <h2 className="text-4xl fw-bold mb-4">Oops!</h2>
          <p className="text-white/60 mb-8">{error || "We couldn't find the project you're looking for."}</p>
          <Link to="/" className="vvd-btn d-inline-flex align-items-center gap-2">
            <ArrowLeft size={20} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const footerSection = siteContent?.sections?.find(s => s.key === 'footer' && s.visible);

  return (
    <div className="App project-details-page">
      <NavBar
        logo={siteContent?.logoheader}
        siteName={siteContent?.siteName}
        linkedIn={siteContent?.linkedIn}
        facebook={siteContent?.facebook}
        instagram={siteContent?.instagram}
      />

      <section className="project-detail-hero pt-32 pb-12 animate__animated animate__fadeIn">
        <Container>
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link to="/" className="text-white/50 hover:text-white transition-colors">Home</Link></li>
              <li className="breadcrumb-item text-white/30"><ChevronRight size={14} className="mx-1" /></li>
              <li className="breadcrumb-item active text-white" aria-current="page">{project.title}</li>
            </ol>
          </nav>
          
          <Row className="align-items-end g-4">
            <Col lg={8}>
              <div className="detail-header">
                {project.categories && project.categories.length > 0 && (
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {project.categories.map(cat => (
                      <Badge key={typeof cat === 'object' ? cat._id : cat} className="px-3 py-2 bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white border border-white/10 uppercase tracking-wider text-xs">
                        {typeof cat === 'object' ? cat.name : 'Category'}
                      </Badge>
                    ))}
                  </div>
                )}
                <h1 className="display-3 fw-bold text-white mb-4 leading-tight">{project.title}</h1>
                <div className="d-flex flex-wrap gap-4 text-white/50">
                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={18} className="text-purple-400" />
                    <span>{project.date ? new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'No date'}</span>
                  </div>
                  {project?.tags && project.tags.length > 0 && (
                    <div className="d-flex align-items-center gap-2">
                      <Tag size={18} className="text-blue-400" />
                      <div className="d-flex gap-2">
                        {project.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-white/80">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Col>
            <Col lg={4} className="text-lg-end">
              <div className="d-flex gap-3 justify-content-lg-end">
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="vvd-btn d-inline-flex align-items-center gap-2 shadow-lg shadow-purple-500/20">
                    <Globe size={18} /> <span>Visit Site</span>
                  </a>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="project-content pb-32 animate__animated animate__fadeInUp">
        <Container>
          <div className="project-main-image rounded-5 overflow-hidden mb-12 shadow-2xl border border-white/5 group">
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
            />
          </div>

          <Row className="g-5">
            <Col lg={8}>
              <div className="project-card-glass p-5 rounded-5 mb-10 border border-white/5 bg-white/[0.02] backdrop-blur-xl">
                <h3 className="text-2xl fw-bold text-white mb-4 d-flex align-items-center gap-3">
                  <span className="w-10 h-1 bg-purple-500 rounded-full d-inline-block"></span>
                  Overview
                </h3>
                <div className="project-description text-white/70 leading-relaxed text-lg">
                  <div dangerouslySetInnerHTML={{ __html: (project?.description || '').replace(/\n/g, '<br/>') }} />
                </div>
              </div>

              {project.video && (
                <div className="project-video-section">
                  <h3 className="text-2xl fw-bold text-white mb-6 d-flex align-items-center gap-3">
                    <PlayCircle size={28} className="text-purple-500" />
                    Project Video
                  </h3>
                  <div className="video-container rounded-5 overflow-hidden border border-white/10 shadow-2xl aspect-video bg-black/40">
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
            </Col>
            
            <Col lg={4}>
              <div className="sticky-top" style={{ top: '120px' }}>
                <div className="project-sidebar-card p-5 rounded-5 border border-white/10 bg-white/[0.03] backdrop-blur-2xl mb-6 shadow-xl">
                  <h4 className="text-xl fw-bold text-white mb-4">Tech Stack</h4>
                  <div className="d-flex flex-wrap gap-2 mb-8">
                    {project?.tags?.map(tag => (
                      <Badge key={tag} className="px-3 py-2 bg-white/5 border border-white/10 text-white/80 font-normal rounded-pill hover:bg-white/10 transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <hr className="border-white/10 my-6" />
                  
                  {project?.images && project.images.length > 0 && (
                    <div className="project-gallery-preview">
                      <h4 className="text-xl fw-bold text-white mb-4">Gallery</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {project.images.slice(0, 4).map((img, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedImg(img)}
                            className="gallery-thumb rounded-4 overflow-hidden aspect-square border border-white/5 hover:border-purple-500/50 transition-all cursor-pointer relative group"
                          >
                            <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                            <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <ExternalLink size={20} className="text-white" />
                            </div>
                            {idx === 3 && project.images.length > 4 && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                                +{project.images.length - 4}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Link to="/" className="text-white/40 hover:text-white d-flex align-items-center justify-center gap-2 transition-colors py-3">
                  <ArrowLeft size={16} /> Explore more projects
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Lightbox Modal */}
      <Modal 
        show={!!selectedImg} 
        onHide={() => setSelectedImg(null)} 
        centered 
        size="xl" 
        contentClassName="bg-transparent border-0"
        className="backdrop-blur-xl"
      >
        <Modal.Body className="p-0 relative">
          <button 
            onClick={() => setSelectedImg(null)}
            className="absolute -top-12 right-0 text-white hover:text-purple-400 transition-colors"
          >
            <X size={32} />
          </button>
          <img src={selectedImg} alt="Enlarged gallery" className="w-full h-auto rounded-5 shadow-2xl" />
        </Modal.Body>
      </Modal>

      {footerSection && <Footer footer={footerSection.content} />}
    </div>
  );
};

export default ProjectDetails;



import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Badge } from "react-bootstrap";
import { ArrowLeft, ExternalLink, Calendar, Tag, PlayCircle } from "lucide-react";
import api from "../api";
import { NavBar } from "../components/NavBar";
import { Footer } from "../components/Footer";
import "../App.css";

const ProjectDetails = () => {
  const { slugOrId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [siteContent, setSiteContent] = useState(null);

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
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl mb-4">{error || "Project Not Found"}</h2>
        <Link to="/" className="text-purple-400 hover:text-purple-300 flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Home
        </Link>
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

      <section className="project-detail-hero pt-32 pb-20">
        <Container>
          <Link to="/" className="back-link mb-5 d-inline-flex align-items-center gap-2 text-white opacity-75 hover:opacity-100 transition-all">
            <ArrowLeft size={20} /> Back to Projects
          </Link>
          
          <Row className="align-items-center">
            <Col lg={7}>
              <div className="detail-header mb-4">
                <Badge bg="secondary" className="mb-3 px-3 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30">
                  {project.category}
                </Badge>
                <h1 className="display-4 fw-bold text-white mb-4">{project.title}</h1>
                <div className="d-flex flex-wrap gap-4 text-white/60 mb-5">
                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={18} />
                    <span>{new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                  </div>
                  {project.tags && project.tags.length > 0 && (
                    <div className="d-flex align-items-center gap-2">
                      <Tag size={18} />
                      <div className="d-flex gap-2">
                        {project.tags.map(tag => (
                          <span key={tag} className="text-white/80">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Col>
            <Col lg={5} className="text-lg-end">
              {project.link && (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="vvd-btn d-inline-flex align-items-center gap-2">
                  <span>View Live Demo</span> <ExternalLink size={18} />
                </a>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      <section className="project-content pb-20">
        <Container>
          <div className="project-main-image rounded-4 overflow-hidden mb-10 shadow-2xl border border-white/10">
            <img src={project.image} alt={project.title} className="w-full h-auto object-cover" />
          </div>

          <Row className="g-5">
            <Col lg={8}>
              <div className="project-description text-white/80 leading-relaxed mb-10">
                <h3 className="text-white mb-4">About the Project</h3>
                <div dangerouslySetInnerHTML={{ __html: project.description.replace(/\n/g, '<br/>') }} />
              </div>

              {project.video && (
                <div className="project-video mb-10">
                  <h3 className="text-white mb-4 flex items-center gap-2">
                    <PlayCircle size={24} /> Project Video
                  </h3>
                  <div className="video-container rounded-4 overflow-hidden border border-white/10 aspect-video">
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
              <div className="project-info-card bg-white/5 backdrop-blur-md p-5 rounded-4 border border-white/10 sticky-top" style={{ top: '100px' }}>
                <h4 className="text-white mb-4">Tech Stack</h4>
                <div className="d-flex flex-wrap gap-2 mb-5">
                  {project.tags.map(tag => (
                    <Badge key={tag} bg="dark" className="px-3 py-2 border border-white/10 font-medium">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {project.images && project.images.length > 0 && (
                  <div className="project-gallery">
                    <h4 className="text-white mb-4">Gallery</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {project.images.map((img, idx) => (
                        <div key={idx} className="gallery-item rounded-2 overflow-hidden aspect-square border border-white/5 hover:border-purple-500/50 transition-all cursor-pointer">
                          <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {footerSection && <Footer footer={footerSection.content} />}
    </div>
  );
};

export default ProjectDetails;

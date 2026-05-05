import React from 'react';
import { useState, useEffect } from "react";
import api from '../api';
import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavBar } from "../components/NavBar";
import { Banner } from "../components/Banner";
import { Skills } from "../components/Skills";
import { Services } from "../components/Services";
import { Projects } from "../components/Projects";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";

/* ─── Skeleton helpers ─────────────────────────────────────────────────── */

const Pulse = ({ className, style }) => (
  <div className={`animate-pulse rounded-lg bg-slate-700/40 ${className}`} style={style} />
);

const BannerSkeleton = () => (
  <section className="banner" id="home">
    <div className="container">
      <div className="row align-items-center" style={{ minHeight: 420 }}>
        {/* Text side */}
        <div className="col-12 col-md-6 col-xl-7 d-flex flex-column gap-3 py-5">
          <Pulse className="w-32 h-5" />
          <Pulse className="h-10 w-3/4" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-5/6" />
          <Pulse className="h-4 w-2/3" />
          <Pulse className="mt-2 h-10 w-36 rounded-full" />
        </div>
        {/* Image side */}
        <div className="col-12 col-md-6 col-xl-5 d-flex justify-content-center py-5">
          <Pulse className="rounded-full" style={{ width: 260, height: 260 }} />
        </div>
      </div>
    </div>
  </section>
);

const SkillsSkeleton = () => (
  <section className="skill" id="skills">
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="skill-bx">
            <Pulse className="mx-auto mb-4 h-8 w-40" />
            <Pulse className="mx-auto mb-6 h-4 w-2/3" />
            <div className="d-flex flex-wrap justify-content-center gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="d-flex flex-column align-items-center gap-2">
                  <Pulse style={{ width: 130, height: 130, borderRadius: '50%' }} />
                  <Pulse className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ProjectsSkeleton = () => (
  <section className="project" id="projects">
    <div className="container">
      <Pulse className="mx-auto mb-6 h-8 w-40" />
      <div className="row g-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="col-12 col-sm-6 col-lg-4">
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <Pulse style={{ height: 180 }} className="rounded-none" />
              <div className="p-4 space-y-2">
                <Pulse className="h-5 w-3/4" />
                <Pulse className="h-4 w-full" />
                <Pulse className="h-4 w-5/6" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Section maps ──────────────────────────────────────────────────────── */

const SECTION_MAP = {
  hero:     (section, site) => <Banner heroTitle={section.title} heroName={section.subtitle} hero={section.content} logohero={section.image} roles={site.roles} />,
  skills:   (section)       => <Skills title={section.title} subtitle={section.content} />,
  services: (section)       => <Services title={section.title} subtitle={section.content} />,
  footer:   (section)       => <Footer footer={section.content} />,
  about:    ()              => null,   // placeholder — no About component yet
  projects: (section)       => <Projects title={section.title} subtitle={section.content} />,
};

const SKELETON_MAP = {
  hero:     () => <BannerSkeleton />,
  skills:   () => <SkillsSkeleton />,
  projects: () => <ProjectsSkeleton />,
};

/* ─── Home page ─────────────────────────────────────────────────────────── */

const Home = () => {
  const [siteContent, setSiteContent] = useState(null); // null = loading

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/site/selected");
        setSiteContent(response.data);
      } catch (error) {
        console.error("Error fetching site content:", error);
        setSiteContent({}); // unblock render on error
      }
    };
    fetchData();
  }, []);

  const loading = siteContent === null;

  // Separate footer section so it always renders after Contact
  const visibleSections = (siteContent?.sections ?? [])
    .filter(s => s.visible === true)
    .sort((a, b) => a.order - b.order);

  const mainSections = visibleSections.filter(s => s.key !== 'footer');
  const footerSection = visibleSections.find(s => s.key === 'footer');

  return (
    <div className="App">
      <NavBar
        logo={siteContent?.logoheader}
        siteName={siteContent?.siteName}
        linkedIn={siteContent?.linkedIn}
        facebook={siteContent?.facebook}
        instagram={siteContent?.instagram}
      />

      {loading ? (
        <>
          <BannerSkeleton />
          <SkillsSkeleton />
          <ProjectsSkeleton />
        </>
      ) : (
        mainSections.map(section => {
          const renderer = SECTION_MAP[section.key];
          if (!renderer) return null;
          return (
            <React.Fragment key={section._id ?? section.key}>
              {renderer(section, siteContent)}
            </React.Fragment>
          );
        })
      )}

      <Contact />

      {/* Footer always renders last, after Contact */}
      {!loading && footerSection && (
        <Footer footer={footerSection.content} />
      )}
    </div>
  );
};

export default Home;

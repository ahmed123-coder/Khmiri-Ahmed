import React from 'react';
import { useState } from "react";
import { useEffect } from 'react';
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

const Home = () => {
  const [siteContent, setSiteContent] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/api/site/selected");
        setSiteContent(response.data);
      } catch (error) {
        console.error("Error fetching site content:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="App">
<NavBar logo={siteContent?.logoheader} siteName={siteContent?.siteName}/>
<Banner hero={siteContent?.hero} logohero={siteContent?.logohero} heroTitle={siteContent?.heroTitle} heroName={siteContent?.heroName}/>
<Skills skillsTitle={siteContent?.skillsTitle} />
<Services serviceDescription={siteContent?.serviceDescription} />
<Projects />
<Contact />
<Footer footer={siteContent?.footer} />
    </div>
  );
};

export default Home;

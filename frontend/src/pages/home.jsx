import React from 'react';
import { useState } from "react";
import { useEffect } from 'react';
import axios from 'axios';
import "../App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavBar } from "../components/NavBar";
import { Banner } from "../components/Banner";
import { Skills } from "../components/Skills";
import { Projects } from "../components/Projects";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";

const Home = () => {
  const [siteContent, setSiteContent] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/site/selected");
        setSiteContent(response.data);
      } catch (error) {
        console.error("Error fetching site content:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="App">
<NavBar logo={`http://localhost:3000/${siteContent?.logoheader}`}  siteName={siteContent?.siteName}/>
<Banner hero={siteContent?.hero} logohero={`http://localhost:3000/${siteContent?.logohero}`}/>
<Skills />
<Projects />
<Contact 
  contactEmail={siteContent?.contactEmail} 
  emailuser={siteContent?.emailuser} 
  passworduser={siteContent?.passworduser} 
/>
<Footer footer={siteContent?.footer} />
    </div>
  );
};

export default Home;

import { useState, useEffect } from "react";
import axios from "axios";
import colorSharp from "../assets/img/color-sharp.png";

const CircularProgress = ({ percentage, name }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="skill-item">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="#2d2d2d" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={radius} fill="none"
          stroke="url(#skillGradient)" strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <defs>
          <linearGradient id="skillGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#AA367C" />
            <stop offset="100%" stopColor="#4A2FBD" />
          </linearGradient>
        </defs>
        <text x="65" y="70" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
          {percentage}%
        </text>
      </svg>
      <h5>{name}</h5>
    </div>
  );
};

export const Skills = () => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/api/skill")
      .then(res => setSkills(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="skill" id="skills">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="skill-bx wow zoomIn">
              <h2>Skills</h2>
              <p>
                As a MERN Stack developer, I build powerful web applications using MongoDB, Express, React, and Node.js.
                I help bring your ideas to life with clean, scalable code and modern cloud deployment solutions.
                <br />My Services
              </p>
              <div className="skills-grid">
                {skills.map((skill) => (
                  <CircularProgress key={skill._id} percentage={skill.percentage} name={skill.name} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <img className="background-image-left" src={colorSharp} alt="Image" />

      <style>{`
        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 40px;
          margin-top: 30px;
        }
        .skill-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .skill-item h5 {
          color: white;
          font-size: 14px;
          text-align: center;
        }
      `}</style>
    </section>
  );
};

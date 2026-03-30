import { useState, useEffect } from "react";
import axios from "axios";
import colorSharp2 from "../assets/img/color-sharp2.png";

export const Services = () => {
  const [services, setServices] = useState([]);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3000/api/service")
      .then(res => setServices(res.data))
      .catch(err => console.error(err));
  }, []);

  if (services.length === 0) return null;

  return (
    <section className="service" id="services">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="service-bx">
              <h2>My Services</h2>
              <p>Here's what I can do for you — from design to deployment.</p>
              <div className="service-grid">
                {services.map((service) => (
                  <div
                    className="service-card"
                    key={service._id}
                    onMouseEnter={() => setHovered(service._id)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {/* Cover Image */}
                    <div className="service-img">
                      {service.image && (
                        <img
                          src={service.image}
                          alt={service.title}
                          style={{ transform: hovered === service._id ? 'scale(1.08)' : 'scale(1)' }}
                        />
                      )}
                      <div className="service-overlay" style={{
                        background: hovered === service._id
                          ? 'linear-gradient(to bottom, rgba(170,54,124,0.35) 0%, #151515 75%)'
                          : 'linear-gradient(to bottom, transparent 30%, #151515 100%)'
                      }} />
                      {/* Floating icon over image */}
                      {service.icon && (
                        <div className="service-icon-float">
                          <img src={service.icon} alt={service.title} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="service-content">
                      <h4 style={{ color: hovered === service._id ? '#AA367C' : '#fff' }}>
                        {service.title}
                      </h4>
                      <p>{service.description}</p>
                    </div>

                    {/* Bottom gradient border on hover */}
                    <div className="service-border-bottom" style={{
                      opacity: hovered === service._id ? 1 : 0
                    }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <img className="background-image-right" src={colorSharp2} alt="" />

      <style>{`
        .service {
          padding: 80px 0;
          position: relative;
          background-color: #030303;
        }
        .service-bx {
          text-align: center;
        }
        .service-bx h2 {
          font-size: 45px;
          font-weight: 700;
          color: #fff;
        }
        .service-bx > p {
          color: #B8B8B8;
          font-size: 18px;
          letter-spacing: 0.8px;
          line-height: 1.5em;
          margin: 14px auto 50px auto;
          width: 56%;
        }
        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
          gap: 28px;
        }
        .service-card {
          border-radius: 24px;
          overflow: hidden;
          background: #151515;
          border: 1px solid rgba(255,255,255,0.07);
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
          text-align: left;
          position: relative;
          cursor: pointer;
        }
        .service-card:hover {
          transform: translateY(-8px);
          border-color: rgba(170, 54, 124, 0.6);
          box-shadow: 0 20px 50px rgba(170, 54, 124, 0.15);
        }

        /* Cover image */
        .service-img {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        .service-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .service-overlay {
          position: absolute;
          inset: 0;
          transition: background 0.4s ease;
        }

        /* Floating circular icon */
        .service-icon-float {
          position: absolute;
          bottom: -24px;
          left: 24px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #AA367C, #4A2FBD);
          border: 3px solid #151515;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          box-shadow: 0 4px 16px rgba(170,54,124,0.4);
        }
        .service-icon-float img {
          width: 65%;
          height: 65%;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }

        /* Content */
        .service-content {
          padding: 36px 24px 28px;
        }
        .service-content h4 {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 12px;
          transition: color 0.3s ease;
          letter-spacing: 0.3px;
        }
        .service-content p {
          color: #9a9a9a;
          font-size: 14px;
          line-height: 1.75em;
          margin: 0;
        }

        /* Bottom accent line */
        .service-border-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #AA367C, #4A2FBD);
          transition: opacity 0.35s ease;
          border-radius: 0 0 24px 24px;
        }

        @media (max-width: 768px) {
          .service-bx > p { width: 90%; }
          .service-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
};

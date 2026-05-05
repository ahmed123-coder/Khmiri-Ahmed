import { Col } from "react-bootstrap";
import { Link } from "react-router-dom";

export const ProjectCard = ({ title, description, imgUrl, slug, id }) => {
  return (
    <Col size={12} sm={6} md={4}>
      <Link to={`/project/${slug || id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="proj-imgbx">
          {imgUrl && <img src={imgUrl} alt={title} className="imgUrl" />}
          <div className="proj-txtx">
            <h4>{title}</h4>
            <span>{description}</span>
          </div>
        </div>
      </Link>
    </Col>
  )
}


import { Col } from "react-bootstrap";

export const ProjectCard = ({ title, description, imgUrl }) => {
  return (
    <Col size={12} sm={6} md={4}>
      <div className="proj-imgbx">
        {imgUrl && (() => {
  console.log("قيمة imgUrlhero:", imgUrl);

  // تنظيف المسار من الباكسلاش
  const cleanedPath = imgUrl.replace(/\\/g, '/');

  // التحقق إذا كان يحتوي على http
  const fullUrl = cleanedPath.startsWith('http')
    ? cleanedPath
    : `http://localhost:3000/${cleanedPath}`;

  console.log("✅ Final imgUrlcard path:", fullUrl);

  console.log("✅ Final imgUrlhero path:", fullUrl);

  return <img src={fullUrl} alt="Header Img" className="imgUrl"/>;
})()}
        <div className="proj-txtx">
          <h4>{title}</h4>
          <span>{description}</span>
        </div>
      </div>
    </Col>
  )
}

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Admin from "./pages/admin";
import ManageProjects from "./pages/projectsadmin";
import ManageSites from "./pages/sitecontent";
import ManageService from "./pages/servicesadmin";
import ManageUsers from "./pages/usersadmin";
import ManageSkills from "./pages/skillsadmin";
import Register from "./pages/register";
import Login from "./pages/login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Nested routes inside Admin */}
        <Route path="/admin" element={<Admin />}>
          <Route path="ManageProjects" element={<ManageProjects />} />
          <Route path="ManageSites" element={<ManageSites />} />
          <Route path="ManageService" element={<ManageService />} />
          <Route path="ManageUsers" element={<ManageUsers />} />
          <Route path="ManageSkills" element={<ManageSkills />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;


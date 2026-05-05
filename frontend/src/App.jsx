import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Admin from "./pages/admin";
import Dashboard from "./pages/dashboard";
import ManageProjects from "./pages/projectsadmin";
import ManageSites from "./pages/sitecontent";
import ManageService from "./pages/servicesadmin";
import ManageUsers from "./pages/usersadmin";
import ManageSkills from "./pages/skillsadmin";
import ManageSections from "./pages/sectionsadmin";
import Register from "./pages/register";
import Login from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* Nested routes inside Admin — protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="ManageProjects" element={<ManageProjects />} />
          <Route path="ManageSites" element={<ManageSites />} />
          <Route path="ManageSections" element={<ManageSections />} />
          <Route path="ManageService" element={<ManageService />} />
          <Route path="ManageUsers" element={<ManageUsers />} />
          <Route path="ManageSkills" element={<ManageSkills />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;


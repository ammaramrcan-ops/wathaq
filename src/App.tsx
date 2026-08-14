import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import Home from "@/pages/Home";
import Books from "@/pages/Books";
import Community from "@/pages/Community";
import Subjects from "@/pages/Subjects";
import Videos from "@/pages/Videos";
import Flashcards from "@/pages/Flashcards";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import Teachers from "@/pages/Teachers";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/community" element={<Community />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<Admin />} />
            {/* Default and 404 behavior could be added here */}
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

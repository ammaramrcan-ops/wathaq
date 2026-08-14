import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import { PageTransition } from "@/components/PageTransition";

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
import Profile from "@/pages/Profile";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<PageTransition key={location.pathname}><Home /></PageTransition>} />
        <Route path="/books" element={<PageTransition key={location.pathname}><Books /></PageTransition>} />
        <Route path="/flashcards" element={<PageTransition key={location.pathname}><Flashcards /></PageTransition>} />
        <Route path="/community" element={<PageTransition key={location.pathname}><Community /></PageTransition>} />
        <Route path="/subjects" element={<PageTransition key={location.pathname}><Subjects /></PageTransition>} />
        <Route path="/videos" element={<PageTransition key={location.pathname}><Videos /></PageTransition>} />
        <Route path="/teachers" element={<PageTransition key={location.pathname}><Teachers /></PageTransition>} />
        <Route path="/profile" element={<PageTransition key={location.pathname}><Profile /></PageTransition>} />
        <Route path="/login" element={<PageTransition key={location.pathname}><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition key={location.pathname}><Register /></PageTransition>} />
        <Route path="/admin" element={<PageTransition key={location.pathname}><Admin /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
}

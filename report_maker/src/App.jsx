// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HeroSection from "./HeroSection";
import Dashboard from "./Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/level-1" element={<Dashboard reportType="level-1" />} />
        <Route path="/closure" element={<Dashboard reportType="closure" />} />
      </Routes>
    </BrowserRouter>
  );
}

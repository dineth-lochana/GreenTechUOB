import React from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/InfoBar.jsx';
import Home from './pages/Home.jsx';
import SolarEnergy from './pages/SolarEnergy.jsx';
import FireSafety from './pages/FireSafety.jsx';
import VariableDrives from './pages/VariableDrives.jsx';
import ProjectShowcase from './pages/ProjectShowcase.jsx';
import LoginRegister from './pages/LoginRegister.jsx';
import NotFound from './pages/NotFound.jsx';
import './App.css';
import { Routes, Route } from 'react-router-dom';

function App() {
    return (
        <div>
            <Navbar/>
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/solar" element={<SolarEnergy />} />
                    <Route path="/fireSafety" element={<FireSafety />} />
                    <Route path="/variableDrives" element={<VariableDrives />} />
                    <Route path="/projectShowcase" element={<ProjectShowcase />} />
                    <Route path="/loginRegister" element={<LoginRegister />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer/>
        </div>
    );
}

export default App;
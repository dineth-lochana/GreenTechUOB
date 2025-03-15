// eslint-disable-next-line no-unused-vars
import React from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/InfoBar.jsx';
import Home from './pages/Home.jsx';
import SolarEnergy from './pages/SolarEnergy.jsx';
import FireSafety from './pages/FireSafety.jsx';
import VariableDrives from './pages/VariableDrives.jsx';
import ProjectShowcase from './pages/ProjectShowcase.jsx';
import LoginRegister from './pages/LoginRegister.jsx';
import Learn from './pages/Learn.jsx';
import NotFound from './pages/NotFound.jsx';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import SolarCalc from './pages/SolarCalc.jsx';

function App() {
    return (
        <div>
            <Navbar/>
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/solar" element={<SolarEnergy />} />
                    <Route path="/fireSafety" element={<FireSafety />} />
                    <Route path="/fireSafety/:slug" element={<ExtinguisherDetails />} />
                    <Route path="/variableDrives" element={<VariableDrives />} />
                    <Route path="/projectShowcase" element={<ProjectShowcase />} />
                    <Route path="/loginRegister" element={<LoginRegister />} />
                    <Route path="/Learn" element={<Learn />} />
                    <Route path="/SolarCalc" element={<SolarCalc />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer/>
        </div>
    );
}

export default App;

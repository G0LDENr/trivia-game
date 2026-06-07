import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home ';
import Inicio from './components/Inicio/inicio';
import Juego from './components/Juegos/juego';
import Login from './components/Login/login';
import Registro from './components/Login/register';
import Perfil from './components/Perfil/perfil';
import JuegoSolo from './components/Juegos/juego-solo';

function Main() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/inicio" element={<Inicio />} />
                <Route path="/juego" element={<Juego />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/juego-solo" element={<JuegoSolo />} />
            </Routes>
        </Router>
    );
}

export default Main;
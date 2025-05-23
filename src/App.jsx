import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import About from '@/pages/About/About'
import Skills from '@/pages/Skills/Skills'
import Projects from '@/pages/Projects/Projects'
import Contact from '@/pages/Contact/Contact'
import '@/App.css'

function App() {
  return (
    <BrowserRouter basename="/cover-letter">
      <div className="app">
        <Header />
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/about" />} />
            <Route path="/about" element={<About />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App

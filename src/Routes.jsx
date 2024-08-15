import React from 'react'
import Home from './Home/home'
import { BrowserRouter, Route, Routes } from 'react-router-dom';

const Rout = () => {
    return (
        <BrowserRouter>
        <Routes> 
          <Route path="/" element={<Home/>} /> 
        </Routes>
      </BrowserRouter>
    )
}

export default Rout;
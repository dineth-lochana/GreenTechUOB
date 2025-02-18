import React, { useState, useEffect, useRef } from 'react';
import './Slider.css';

const Slider = () => {
  const [slides, setSlides] = useState([
    {
      image: './images/img1.jpg',
      author: 'Green Tech',
      title: 'Solar Systems',
      topic: 'Renewable Energy',
      description: 'Innovative solar solutions designed to reduce carbon footprint and provide sustainable energy for residential and commercial applications. Our cutting-edge solar systems maximize energy efficiency and long-term cost savings.'
    },
    {
      image: './images/img2.jpg',
      author: 'Green Tech',
      title: 'Fire Equipment',
      topic: 'Safety Solutions',
      description: 'Comprehensive fire safety equipment including advanced fire extinguishers, detection systems, and protective gear. We ensure top-tier safety standards with state-of-the-art technology to protect lives and property.'
    },
    {
      image: './images/img3.jpg',
      author: 'Green Tech',
      title: 'Variable Drivers',
      topic: 'Industrial Automation',
      description: 'High-performance variable drivers for precise industrial control and energy optimization. Our advanced driver solutions provide superior efficiency, reliability, and intelligent control for complex manufacturing processes.'
    }
  ]);

  const carouselRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    carouselRef.current.classList.add('next');
    
    setSlides(prevSlides => {
      const newSlides = [...prevSlides];
      const firstSlide = newSlides.shift();
      newSlides.push(firstSlide);
      return newSlides;
    });

    setTimeout(() => {
      carouselRef.current.classList.remove('next');
      setIsAnimating(false);
    }, 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    carouselRef.current.classList.add('prev');
    
    setSlides(prevSlides => {
      const newSlides = [...prevSlides];
      const lastSlide = newSlides.pop();
      newSlides.unshift(lastSlide);
      return newSlides;
    });

    setTimeout(() => {
      carouselRef.current.classList.remove('prev');
      setIsAnimating(false);
    }, 500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAnimating) handleNext();
    }, 7000);
    
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className="carousel" ref={carouselRef}>
      <div className="list">
        {slides.map((slide, index) => (
          <div key={index} className="item" style={{ zIndex: index === 0 ? 1 : 0 }}>
            <img src={slide.image} alt={`Slide ${index + 1}`} />
            <div className="content">
              <div className="author">{slide.author}</div>
              <div className="titleh">{slide.title}</div>
              <div className="topic">{slide.topic}</div>
              <div className="des">{slide.description}</div>
              <div className="buttons">
               
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="thumbnail">
        {slides.map((slide, index) => (
          <div key={index} className="item">
            <img src={slide.image} alt={`Thumbnail ${index + 1}`} />
            <div className="content">
              <div className="titleh">{slide.title}</div>
              
            </div>
          </div>
        ))}
      </div>

      <div className="arrows">
        <button id="prev" onClick={handlePrev} disabled={isAnimating}>&lt;</button>
        <button id="next" onClick={handleNext} disabled={isAnimating}>&gt;</button>
      </div>

      <div className="time"></div>
    </div>
  );
};

export default Slider;
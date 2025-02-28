import React from "react";
import Slider from "../components/Slider";
import Chatbot from '../components/Chatbot';
import { motion } from "framer-motion";
import PropTypes from 'prop-types';

const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};
const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

const sectionContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "50px",
  padding: "50px",
  borderRadius: "10px",
};

const textSectionStyle = {
  flex: "1",
  minWidth: "300px",
  textAlign: "center",
};

const imageSectionStyle = {
  flex: "1",
  minWidth: "300px",
  textAlign: "center",
};

const sectionHeadingStyle = {
  marginBottom: "20px",
  fontWeight: "1000",
  fontSize: "25px",
};

const sectionTextStyle = {
  fontSize: "20px",
};

const hrStyle = {
  borderTop: "3px solid #73f573",
};

const welcomeTextStyle = {
  textAlign: "center",
  paddingTop: "100px",
  fontSize: "50px",
  fontWeight: "1000",
  color: "#1e8f1e",
  textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
  letterSpacing: "2px",
};

const InfoSection = ({ title, text, imgSrc, imagePosition = 'right' }) => {
  const imageMotion = imagePosition === 'right' ? slideInRight : slideInLeft;
  const textMotion = fadeInUp;
  const backgroundGradient = imagePosition === 'right' ? "linear-gradient(135deg, #1e8f1e,rgba(115, 245, 115, 0.25))" : "linear-gradient(135deg,rgba(115, 245, 115, 0.25), #1e8f1e)";

  return (
    <div style={{ ...sectionContainerStyle, background: backgroundGradient }}>
      {imagePosition === 'left' && (
        <motion.div
          style={imageSectionStyle}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={imageMotion}
        >
          <img
            src={imgSrc}
            alt={title}
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </motion.div>
      )}
      <motion.div
        style={textSectionStyle}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={textMotion}
      >
        <h4 style={sectionHeadingStyle}>{title}</h4>
        <p style={sectionTextStyle}>{text}</p>
      </motion.div>
      {imagePosition === 'right' && (
        <motion.div
          style={imageSectionStyle}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={imageMotion}
        >
          <img
            src={imgSrc}
            alt={title}
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </motion.div>
      )}
    </div>
  );
};

// Add PropTypes validation
InfoSection.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  imgSrc: PropTypes.string.isRequired,
  imagePosition: PropTypes.string,
};

function Home() {
  return (
    <div>
      <Slider />
      <motion.p
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 1, ease: "easeOut" }}
        viewport={{ once: true }}
        style={welcomeTextStyle}
        variants={fadeInUp}
      >
        Welcome to Green Tech Services
      </motion.p>

      <div style={{ padding: "50px" }}>
        <InfoSection
          title="Company Profile"
          text="Green Tech Services is providing a comprehensive range of products & services aimed at Building Facility Management..."
          imgSrc="./images/nana.gif"
        />
        <br />
        <hr style={hrStyle} />

        <InfoSection
          title="Company Experience and Operations"
          text="As with any other company, regardless of its length of experience, the company experience is the sum total of the experience of its people at any given time..."
          imgSrc="./images/6.png"
          imagePosition="left"
        />

        <br />
        <hr style={hrStyle} />

        <InfoSection
          title="Promote your merchandise"
          text="Well experienced in carrying out assignments, our personnel, as individuals, have also developed experience in a significant diversity and range of project sizes and types..."
          imgSrc="./images/3.png"
        />

        <br />
        <hr style={hrStyle} />

        <InfoSection
          title="Design, Supply & Installation of Complete Systems"
          text="The Company has the capability to design, supply, install, and commission complete systems in Fire Detection and Protection, Solar P.V, Air - Conditioning and Refrigeration..."
          imgSrc="./images/fin.gif"
          imagePosition="left"
        />

        <br />
        <hr style={hrStyle} />
      </div>
      
      {/* Fixed process.env issue */}
      <Chatbot chatbotId={import.meta.env.VITE_Chatling_API_KEY} />

      <footer />
    </div>
  );
}

export default Home;

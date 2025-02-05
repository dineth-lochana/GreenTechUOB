import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Clock } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  const styles = {
    footer: {
      background: 'linear-gradient(to bottom, #166534, #14532d)',
      color: 'white',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '48px 16px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '32px',
    },
    section: {
      marginBottom: '24px',
    },
    heading: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '16px',
    },
    text: {
      color: '#bbf7d0',
      fontSize: '14px',
      lineHeight: '1.6',
    },
    socialContainer: {
      display: 'flex',
      gap: '16px',
      marginTop: '16px',
    },
    socialIcon: {
      backgroundColor: '#15803d',
      padding: '8px',
      borderRadius: '50%',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    linkList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    link: {
      color: '#bbf7d0',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '12px',
    },
    contactIcon: {
      color: '#4ade80',
    },
    newsletter: {
      marginTop: '48px',
      paddingTop: '32px',
      borderTop: '1px solid #15803d',
      textAlign: 'center',
    },
    input: {
      padding: '8px 16px',
      borderRadius: '8px',
      backgroundColor: '#15803d',
      color: 'white',
      border: 'none',
      marginRight: '8px',
      width: '200px',
    },
    button: {
      padding: '8px 24px',
      backgroundColor: '#22c55e',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    copyright: {
      backgroundColor: '#14532d',
      padding: '16px',
      textAlign: 'center',
    },
    copyrightInner: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      '@media (min-width: 768px)': {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.grid}>
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={styles.section}
          >
            <h3 style={styles.heading}>Green Tech Services</h3>
            <p style={styles.text}>
              Providing comprehensive building facility management and engineering solutions 
              with the latest technology and quality equipment.
            </p>
            <div style={styles.socialContainer}>
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  style={styles.socialIcon}
                >
                  <Icon size={18} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={styles.section}
          >
            <h3 style={styles.heading}>Quick Links</h3>
            <div style={styles.linkList}>
              {['Home', 'About Us', 'Services', 'Projects'].map((link) => (
                <motion.a
                  key={link}
                  href="#"
                  style={styles.link}
                  whileHover={{ x: 5, color: '#ffffff' }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={styles.section}
          >
            <h3 style={styles.heading}>Our Services</h3>
            <div style={styles.linkList}>
              {[
                'Fire Detection & Protection',
                'Solar PV Systems',
                'Variable Drives',
               
              ].map((service) => (
                <motion.a
                  key={service}
                  href="#"
                  style={styles.link}
                  whileHover={{ x: 5, color: '#ffffff' }}
                >
                  {service}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={styles.section}
          >
            <h3 style={styles.heading}>Contact Us</h3>
            <div>
              {[
                { Icon: MapPin, text: '346/2 Millagahawaththa ,Ganemulla, Sri Lanka' },
                { Icon: Phone, text: '+94(0)77-7633625' },
                { Icon: Mail, text: 'info@greentech.lk' },
                { Icon: Clock, text: 'Mon - Fri: 9:00 AM - 6:00 PM' }
              ].map((item, index) => (
                <div key={index} style={styles.contactItem}>
                  <item.Icon size={18} style={styles.contactIcon} />
                  <span style={styles.text}>{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>


      </div>

      {/* Copyright */}
      <div style={styles.copyright}>
        <div style={styles.copyrightInner}>
          <p style={styles.text}>© {currentYear} Green Tech Services. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={styles.link}>Privacy Policy</a>
            <a href="#" style={styles.link}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';

const Chatbot = ({ chatbotId }) => {
  useEffect(() => {
    // Configure chatbot
    window.chtlConfig = {
      chatbotId: chatbotId
    };

    // Create and append the script
    const script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.src = 'https://chatling.ai/js/embed.js';
    script.id = 'chatling-embed-script';
    script.dataset.id = chatbotId;
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      // Remove the script when component unmounts
      const existingScript = document.getElementById('chatling-embed-script');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      // Clean up the global config
      delete window.chtlConfig;
    };
  }, [chatbotId]); // Re-run if chatbotId changes

  return null; // This component doesn't render anything directly
};

export default Chatbot;
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../src/pages/Home';

// Mock the components used in Home
jest.mock('../components/Slider', () => () => <div data-testid="slider-component">Slider Mock</div>);
jest.mock('../components/Chatbot', () => () => <div data-testid="chatbot-component">Chatbot Mock</div>);

// Mock framer-motion
jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    __esModule: true,
    ...actual,
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      p: ({ children, ...props }) => <p {...props}>{children}</p>
    }
  };
});

// Mock environment variable
process.env.VITE_Chatling_API_KEY = 'mock-chatbot-key';

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders welcome message', () => {
    render(<Home />);
    expect(screen.getByText('Welcome to Green Tech Services')).toBeInTheDocument();
  });

  test('renders slider component', () => {
    render(<Home />);
    expect(screen.getByTestId('slider-component')).toBeInTheDocument();
  });

  test('renders chatbot component', () => {
    render(<Home />);
    expect(screen.getByTestId('chatbot-component')).toBeInTheDocument();
  });

  test('renders all info sections', () => {
    render(<Home />);
    
    // Check for all section titles
    expect(screen.getByText('Company Profile')).toBeInTheDocument();
    expect(screen.getByText('Company Experience and Operations')).toBeInTheDocument();
    expect(screen.getByText('Promote your merchandise')).toBeInTheDocument();
    expect(screen.getByText('Design, Supply & Installation of Complete Systems')).toBeInTheDocument();
  });

  test('renders section descriptions', () => {
    render(<Home />);
    
    // Check for section descriptions (partial text is fine for testing)
    expect(screen.getByText(/Green Tech Services is providing a comprehensive range/)).toBeInTheDocument();
    expect(screen.getByText(/As with any other company, regardless of its length of experience/)).toBeInTheDocument();
    expect(screen.getByText(/Well experienced in carrying out assignments/)).toBeInTheDocument();
    expect(screen.getByText(/The Company has the capability to design, supply, install/)).toBeInTheDocument();
  });

  test('renders with correct section order', () => {
    render(<Home />);
    
    const sections = [
      'Company Profile',
      'Company Experience and Operations',
      'Promote your merchandise',
      'Design, Supply & Installation of Complete Systems'
    ];
    
    // Get all headings
    const headings = screen.getAllByText((content, element) => {
      return sections.includes(content) && element.tagName.toLowerCase() === 'h4';
    });
    
    // Check that sections are in the correct order
    expect(headings[0]).toHaveTextContent(sections[0]);
    expect(headings[1]).toHaveTextContent(sections[1]);
    expect(headings[2]).toHaveTextContent(sections[2]);
    expect(headings[3]).toHaveTextContent(sections[3]);
  });

 
});
// TestComponent.jsx
import React from 'react'

// This component has intentional ESLint issues to test the workflow
export default function TestComponent() {
  const unused_variable = "this will trigger a lint warning"
  
  return (
    <div>
      {/* Missing alt attribute will trigger accessibility warning */}
      <img src="test.jpg" />
      
      {/* Incorrect spacing will trigger prettier warning */}
      <button     style={{color:'red'}}   >
        Test Button
      </button>
    </div>
  )
}
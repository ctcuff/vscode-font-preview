import '../scss/loading-overlay.scss'
import React from 'react'

const size = 3

const LoadingOverlay = (): JSX.Element => (
  <div className="loading-overlay">
    <svg width="575" height="6px">
      <g id="balls">
        <circle className="circle" id="circle1" cx="-115" cy={size} r={size} />
        <circle className="circle" id="circle2" cx="-130" cy={size} r={size} />
        <circle className="circle" id="circle3" cx="-145" cy={size} r={size} />
        <circle className="circle" id="circle4" cx="-160" cy={size} r={size} />
        <circle className="circle" id="circle5" cx="-175" cy={size} r={size} />
      </g>
    </svg>
  </div>
)

export default LoadingOverlay

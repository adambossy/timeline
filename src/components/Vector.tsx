import React from 'react';


interface VectorProps {
    boxWidth: number;
    boxHeight: number;
    dx: number;
    dy: number;
}

const VectorComponent: React.FC<VectorProps> = ({ boxWidth, boxHeight, dx, dy }) => {
    const length = Math.sqrt(dx * dx + dy * dy)
    const left = (boxWidth - length) / 2
    const top = (boxHeight / 2) - 5 // MAGIC NUMBER ALERT! Refers to .vector-point border-top-width
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const lineWidth = Math.max(0, length / 2 - 16) // MAGIC NUMBER ALERT! Refers to .vector-point border-left-width

    const vectorStyle = {
        width: `${length}px`,
        left: `${left}px`,
        top: `${top}px`,
        Transform: `rotate(${angle}deg)`,
        WebkitTransform: `rotate(${angle}deg)`
    }
    const lineStyle = {
        marginLeft: `${length / 2}px`,
        width: `${lineWidth}px`
    }
    return (
        <div className="Vector" style={vectorStyle}>
            <div className="Vector-stem" style={lineStyle}></div>
            <div className="Vector-point"></div>
        </div>
    )
}

export default VectorComponent;
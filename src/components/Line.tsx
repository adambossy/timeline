import React from "react";
import { useContext } from "react";
import { Rect } from "../Data";
import { BubbleSide } from "../constants";
import { BranchContext } from "./contexts";

interface LineProps {
    bubbleRect: Rect,
    // TODO change to ? and remove null - need to propagate this up the
    // component tree
    instanceRect: DOMRect,
}

const Line: React.FC<LineProps> = ((props) => {
    // This component draws a line from the a bubble rect to an instance rect
    // and is a child of bubble rect

    let { bubbleRect, instanceRect } = props;

    const branchContext = useContext(BranchContext);
    let bubbleSide = branchContext ? branchContext as BubbleSide : BubbleSide.LEFT

    const xA = bubbleRect.x + ((bubbleSide === BubbleSide.LEFT) ? bubbleRect.width : 0)
    const yA = bubbleRect.y + (bubbleRect.height / 2)
    const xB = instanceRect.x + (instanceRect.width / 2)
    const yB = instanceRect.y + (instanceRect.height / 2)

    const dx = xB - xA
    const dy = yB - yA

    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const length = Math.sqrt(dx * dx + dy * dy)

    const lineContainerStyle = {
        left: bubbleSide === BubbleSide.LEFT
            ? `calc(100% + 4px - ${length}px)`
            : `calc(-${length}px - 4px)`, 
        width: `${length * 2}px`,
        Transform: `rotate(${Math.round(angle)}deg)`,
        WebkitTransform: `rotate(${Math.round(angle)}deg)`
    }
    const lineStyle = {
        marginLeft: `${length}px`,
        width: `${length}px`
    }
    
    return (
        <div className="line-container" style={lineContainerStyle}>
            <div className="line" style={lineStyle}></div>
        </div>
    )
})

export default Line
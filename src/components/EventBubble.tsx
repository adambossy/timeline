import React, { useContext, useEffect, useRef } from 'react';

import { BubbleSide, DEBUG_MODE } from '../constants';
import { Event } from '../Data';
import { formatDateRange } from '../util/Date';
import { BranchContext, BubbleRefContext } from './contexts';
import VectorComponent from './Vector';
import Line from './Line';

interface EventBubbleProps {
    event: Event,
    instanceRect: DOMRect | null,
}

const EventBubble: React.FC<EventBubbleProps> = ({ event, instanceRect }) => {
    const bubbleRef = useRef<HTMLDivElement | null>(null);
    const addBubbleRef = useContext(BubbleRefContext);

    useEffect(() => {
        console.log('EventBubble::useEffect')

        addBubbleRef(event, bubbleRef.current); // Used to pass bubble refs to Timeline component and have it sort among them at the top level
    }, [event, addBubbleRef]);

    const branchContext = useContext(BranchContext);
    let bubbleSide = branchContext ? branchContext as BubbleSide : BubbleSide.LEFT

    const bubbleClassNames = `event-range-bubble ${bubbleSide}`

    const vectors = DEBUG_MODE && (event.vectors || []).map((v) => {
        if (!event.rect) {
            throw new Error("Event rect is null")
        }
        const [_, dx, dy] = v
        return <VectorComponent boxWidth={event.rect.width} boxHeight={event.rect.height} dx={dx} dy={dy} />
    })

    const style = event.rect ? {
        left: event.rect.styleX,
        top: event.rect.styleY,
    } : {}

    return (
        <div className={bubbleClassNames} ref={bubbleRef} style={style}>
            <div className="event-range-bubble-arrow"></div>
            {event.rect && instanceRect && bubbleSide && (
                <Line
                    bubbleRect={event.rect}
                    instanceRect={instanceRect} />
            )}
            <p>{formatDateRange(event)}</p>
            <h1>{event.title}</h1>
            <h2>{event.company}</h2>
            {DEBUG_MODE && vectors}
        </div>
    )
}

export default EventBubble
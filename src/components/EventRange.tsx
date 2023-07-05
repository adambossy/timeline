import React, { useEffect, useRef, useState } from 'react';

import { YEAR_HEIGHT } from '../constants';
import { Event } from '../Data';
import { monthDelta } from '../util/Date';
import EventBubble from './EventBubble';

interface EventRangeProps {
    event: Event,
    y?: number,
}

const EventRange: React.FC<EventRangeProps> = ({ event, y }) => {
    const eventRef = useRef<HTMLDivElement | null>(null)
    const [rect, setRect] = useState<DOMRect | null>(null)

    useEffect(() => {
        console.log('EventRange::useEffect')

        if (eventRef.current) {
            const _rect = eventRef.current.getBoundingClientRect()
            if (_rect) {
                // TODO evaluate whether this is the best state to change to
                // force re-render
                setRect(_rect)
            }
        }
    }, [eventRef])

    const styleDict = {
        height: `${monthDelta(event.startDate!, event.endDate!) * (YEAR_HEIGHT / 12)}px`,
        top: y ? `${y}px` : undefined,
    }

    return (
        <div className="event-range" ref={eventRef} style={styleDict}>
            <EventBubble event={event} instanceRect={rect} />
        </div>
    );
};

export default EventRange
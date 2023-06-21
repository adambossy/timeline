import React, { useEffect, useRef, useState } from 'react'
import { Event } from '../Data'
import EventBubble from './EventBubble'

interface EventInstanceProps {
    event: Event,
}

const EventInstance: React.FC<EventInstanceProps> = ({ event }) => {
    const eventRef = useRef<HTMLDivElement | null>(null)
    const [rect, setRect] = useState<DOMRect | null>(null)

    useEffect(() => {
        if (eventRef.current) {
            const _rect = eventRef.current.getBoundingClientRect()
            if (_rect) {
                // TODO evaluate whether this is the best state to change to
                // force re-render
                setRect(_rect)
            }
        }
    }, [eventRef])
  
    return (
        <div className="event-instance" ref={eventRef}>
            <EventBubble event={event} instanceRect={rect} />
        </div>
    )
}

export default EventInstance
import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import WorkIcon from '@material-ui/icons/Work';

import './AppV2.css';

interface EventRangeProps {
    height: number;
}

const EventRange: React.FC<EventRangeProps> = ({ height }) => {
    return (
        <div className="event-range" style={{ height: height + "px" }}></div>
    )
}

const EventInstance = () => {
    return (
        <div className="event-instance"></div>
    )
}

interface StemProps {
    height: number;
}

const TimelineStem: React.FC<StemProps> = ({ height }) => {
    return <div className="timeline-stem" style={{ height: height + "px" }}></div>
}

function AppV2() {
    return (
        <div className="timeline">
            <div className="event-group">
                <div className="event-group-fork">
                    <div className="event-group-fork-line-container" style={{ transform: "rotate(45deg)"}}>
                        <div className="event-group-fork-line"></div>
                    </div>
                    <div className="event-group-fork-line-container" style={{ transform: "rotate(135deg)"}}>
                        <div className="event-group-fork-line"></div>
                    </div>
                </div>
                <div className="event-sequence-container">
                    <div className="event-sequence">
                        <TimelineStem height={20} />
                        <EventRange height={200} />
                        <TimelineStem height={50} />
                        <EventRange height={300} />
                    </div>
                    <div className="event-sequence">
                        <TimelineStem height={20} />
                        <EventRange height={400} />
                        <TimelineStem height={75} />
                        <EventInstance />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AppV2;
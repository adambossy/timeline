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

const Fork = () => {
    return (
        <div className="event-group-fork">
            <ForkLine angle={45} />
            <ForkLine angle={135} />
        </div>
    )
}

interface ForkLineProps {
    angle: number;
}

const ForkLine: React.FC<ForkLineProps> = ({ angle }) => {
    return (
        <div className="event-group-fork-line-container" style={{ transform: `rotate(${angle}deg)` }}>
            <div className="event-group-fork-line"></div>
        </div>
    )
}

const EVENT_WIDTH = 16; // includes border
const EVENT_MARGIN = 17; // includes margin

interface BranchProps {
    leftChildren: number;
    rightChildren: number;
    widthOverride?: number;
}

const Branch: React.FC<BranchProps> = ({ leftChildren, rightChildren, widthOverride }) => {
    const width = widthOverride || (leftChildren + rightChildren) * (EVENT_MARGIN + (EVENT_WIDTH / 2) + 4); // margin + half eventRange width + gap
    return (
        <div className="event-group-branch" style={{ width: `${width}px` }}>&nbsp;</div>
    ) 
}

function AppV2() {
    return (
        <div className="timeline">
            <TimelineStem height={20} />
            <div className="event-group tracks-3">
                <Branch leftChildren={2} rightChildren={1} widthOverride={102} />
                <div className="event-sequence-container" style={{ left: "-22px" }}>
                    <div className="event-sequence tracks-2">
                        <TimelineStem height={20} />
                        <EventRange height={80} />
                        <TimelineStem height={40} />
                        <div className="event-group">
                            <Branch leftChildren={1} rightChildren={1} />
                            <div className="event-sequence-container">
                                <div className="event-sequence">
                                    <TimelineStem height={20} />
                                    <EventRange height={100} />
                                    <TimelineStem height={50} />
                                    <EventRange height={100} />
                                    <TimelineStem height={50} />
                                </div>
                                <div className="event-sequence">
                                    <TimelineStem height={40} />
                                    <EventInstance />
                                    <TimelineStem height={30} />
                                    <EventInstance />
                                    <TimelineStem height={30} />
                                    <EventRange height={75} />
                                    <TimelineStem height={100} />
                                </div>
                            </div>
                        </div>
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
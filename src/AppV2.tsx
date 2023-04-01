import React, { ReactNode } from 'react';
import 'react-vertical-timeline-component/style.min.css';

import './AppV2.css';

enum BubbleSide {
    RIGHT = 'right',
    LEFT = 'left',
}

interface EventRangeProps {
    height: number;
    bubbleSide: BubbleSide;
}

const EventRange: React.FC<EventRangeProps> = ({ height, bubbleSide }) => {
    const classNames = `event-range-bubble ${bubbleSide}`
    return (
        <React.Fragment>
            <div className="event-range" style={{ height: height + "px" }}>
                <div className={classNames}>
                    <div className="event-range-bubble-arrow"></div>
                    <p>2011 - present</p>
                    <h1>Creative Director</h1>
                </div>
            </div>
        </React.Fragment>
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

interface TimelineProps {
    children: ReactNode;
}

const Timeline: React.FC<TimelineProps> = ({ children }) => {
    return <div className="timeline">{children}</div>
}

function AppV2() {
    return (
        <React.Fragment>
            <Timeline>
                <EventInstance />
            </Timeline>
            <hr/>
            <Timeline>
                <EventRange height={100} bubbleSide={BubbleSide.LEFT}  />
            </Timeline>
            <hr/>
            <Timeline>
                <EventInstance />
                <EventInstance />
            </Timeline>
            <hr/>
            <Timeline>
                <EventInstance />
                <EventRange height={100} bubbleSide={BubbleSide.LEFT}  />
            </Timeline>
            <hr/>
            <Timeline>
                <EventRange height={100} bubbleSide={BubbleSide.LEFT}  />
                <EventInstance />
            </Timeline>
            <hr/>
            <Timeline>
                <EventRange height={100} bubbleSide={BubbleSide.LEFT}  />
                <EventRange height={100} bubbleSide={BubbleSide.LEFT}  />
            </Timeline>
            <hr/>
            <div className="timeline">
                <TimelineStem height={20} />
                <div className="event-group tracks-3">
                    <Branch leftChildren={2} rightChildren={1} widthOverride={102} />
                    <div className="event-sequence-container" style={{ left: "-22px" }}>
                        <div className="event-sequence tracks-2">
                            <TimelineStem height={20} />
                            <EventRange height={80} bubbleSide={BubbleSide.LEFT} />
                            <TimelineStem height={40} />
                            <div className="event-group">
                                <Branch leftChildren={1} rightChildren={1} />
                                <div className="event-sequence-container">
                                    <div className="event-sequence">
                                        <TimelineStem height={20} />
                                        <EventRange height={100} bubbleSide={BubbleSide.LEFT}  />
                                        <TimelineStem height={50} />
                                        <EventRange height={100} bubbleSide={BubbleSide.LEFT}  />
                                        <TimelineStem height={50} />
                                    </div>
                                    <div className="event-sequence">
                                        <TimelineStem height={40} />
                                        <EventInstance />
                                        <TimelineStem height={30} />
                                        <EventInstance />
                                        <TimelineStem height={30} />
                                        <EventRange height={75} bubbleSide={BubbleSide.LEFT} />
                                        <TimelineStem height={100} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="event-sequence">
                            <TimelineStem height={20} />
                            <EventRange height={400} bubbleSide={BubbleSide.RIGHT} />
                            <TimelineStem height={75} />
                            <EventInstance />
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default AppV2;
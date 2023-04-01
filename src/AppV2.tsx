import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import StarIcon from '@material-ui/icons/Star';
import SchoolIcon from '@material-ui/icons/School';
import WorkIcon from '@material-ui/icons/Work';

import './AppV2.css';

function AppV2() {
    const style = {
        color: 'white',
        fontSize: 200
    };

    return (
        <div>
            <VerticalTimeline>
                <VerticalTimelineElement
                    className="vertical-timeline-element--work"
                    contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                    contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
                    date="2011 - present"
                    iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
                    icon={<WorkIcon />}
                >
                    <h3 className="vertical-timeline-element-title">Creative Director</h3>
                    <h4 className="vertical-timeline-element-subtitle">Miami, FL</h4>
                    <p>
                    Creative Direction, User Experience, Visual Design, Project Management, Team Leading
                    </p>
                </VerticalTimelineElement>
            </VerticalTimeline>
            <br/>
            <br/>
            <div className="timeline">
                <div className="timeline-stem"></div>
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
                            <div className="event-range" style={{ height: "200px" }}></div>
                            <div className="event-range" style={{ height: "300px", top: "50px" }}></div>
                        </div>
                        <div className="event-sequence">
                            <div className="event-range" style={{ height: "400px", top: "60px" }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AppV2;
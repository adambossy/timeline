import React, { Component, ReactNode, useRef, useEffect, useState } from 'react';
import 'react-vertical-timeline-component/style.min.css';

import './AppV2.css';
import { ThemeContext } from '@emotion/react';

const BranchContext = React.createContext('');


interface Event {
    title: string;
    date?: Date;
    startDate?: Date;
    endDate?: Date;
}

type EventGroup = EventGraph[];
type EventGraph = (Event | EventGroup)[];

const event1: Event = {
    title: "Grill master",
    date: new Date("2010-01-01"),
}

const event1a: Event = {
    title: "Dishwasher",
    date: new Date("2010-01-01"),
}

const event2: Event = {
    title: "Smoothie maker",
    date: new Date("2011-01-01"),
}

const event3: Event = {
    title: "Web designer",
    date: new Date("2012-01-01"),
}

const group1: EventGroup = [
    [
        event1,
    ],
    [
        event2,
    ]
]

const range1: Event = {
    title: "Student",
    startDate: new Date("2010-01-01"),
    endDate: new Date("2010-03-01"),
}

const group2: EventGroup = [
    [
        event1,
    ],
    [
        range1,
    ]
]

const singleInstance: Event[] = [
    event1,
]

const singleInstanceGraph: EventGraph = [
    event1,
]

const singleRange: Event[] = [
    range1,
]

const twoInstances: Event[] = [
    event1,
    event2,
]

const twoInstancesGraph: EventGraph = [
    event1,
    event2,
]

const threeInstancesGraph: EventGraph = [
    event1,
    event2,
    event3,
]

const mixedEventsGraph: EventGraph = [
    event1,
    range1,
    event2,
]

const collidingInstances: Event[] = [
    event1,
    event1a,
]

const collidingInstancesGraph: EventGraph = [
    group1 
]

const miniPyramidGraph: EventGraph = [
    event1,
    group1 
]

const nestedGroup1: EventGroup = [
    [
        event1,
        group1
    ],
    [
        event1,
        group1,
    ]
]

const medPyramidGraph: EventGraph = [
    nestedGroup1 
]

const nestedGroup2: EventGroup = [
    [
        event1,
        group1,
        nestedGroup1,
    ],
    [
        event1,
        group1,
        nestedGroup1,
    ]
]

const largePyramidGraph: EventGraph = [
    nestedGroup2
]

const collidingInstanceAndRange: Event[] = [
    range1,
    event2,
]

const collidingInstanceAndRangeGraph: EventGraph = [
    event1,
    group2,
]

const group2a: EventGroup = [
    [
        event1,
        [
            [
                event1,
            ],
            [
                range1,
            ]
        ]
    ],
    [
        range1,
    ]
]

const miniPyramidWeightedLeftGraph: EventGraph = [
    event1,
    group2a,
]

const group2b: EventGroup = [
    [
        range1,
    ],
    [
        event1,
        [
            [
                event1,
            ],
            [
                range1,
            ]
        ]
    ]
]

const miniPyramidWeightedRightGraph: EventGraph = [
    event1,
    group2b,
]

const group3: EventGroup = [
    [
        range1,
    ],
    [
        event1,
    ]
]

const collidingInstanceAndRangeFlippedGraph: EventGraph = [
    group3,
]

const danglingEventGraph: EventGraph = [
    group1,
    event1
]

const threeColumnsGraph: EventGraph = [
    [
        [
            event1
        ],
        [
            event2,
        ],
        [
            range1,
        ]
    ]
]

enum BubbleSide {
    RIGHT = 'right',
    LEFT = 'left',
}

interface EventRangeProps {
    event: Event,
    height: number;
}

const formatDate = (date?: Date): string | undefined => {
    if (typeof date === "undefined") {
        return undefined
    }

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
  
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
  
    return `${monthNames[monthIndex]} ${year}`;
}

const formatDateRange = (event: Event): string | undefined => {
    const date_ = formatDate(event.date)
    const startDate = formatDate(event.startDate)
    const endDate = formatDate(event.endDate)
    return date_ || (startDate + (endDate ? ' ' + endDate : ''))
}

// const EventRange: React.FC<EventRangeProps> = ({ event, height }) => {
class EventRange extends React.Component<EventRangeProps> {

    static contextType = BranchContext

    constructor(props: EventRangeProps) {
        super(props)
    }

    render() {
        const { event, height } = this.props 
        return (
            <React.Fragment>
                <div className="event-range" style={{ height: height + "px" }}>
                    <EventBubble event={event} bubbleSide={this.context} />
                </div>
            </React.Fragment>
        )
    };
}

interface EventInstanceProps {
    event: Event,
}

class EventInstance extends React.Component<EventInstanceProps> {

    static contextType = BranchContext

    constructor(props: EventInstanceProps) {
        super(props)
    }

    render () {
        const { event } = this.props 
        return (
            <div className="event-instance">
                <EventBubble event={event} bubbleSide={this.context} />
            </div>
        )
    }
}

interface EventBubbleProps {
    event: Event,
    bubbleSide: BubbleSide | unknown;
}

const EventBubble: React.FC<EventBubbleProps> = ({ event, bubbleSide }) => {
    if (!bubbleSide) {
        bubbleSide = BubbleSide.LEFT
    }
    const bubbleClassNames = `event-range-bubble ${bubbleSide}`
    return (
        <div className={bubbleClassNames}>
            <div className="event-range-bubble-arrow"></div>
            <p>{formatDateRange(event)}</p>
            <h1>{event.title}</h1>
        </div>
    )
}

interface EventGroupProps {
    group: EventGroup;
}

class EventGroupComponent extends Component<EventGroupProps> {

    static contextType = BranchContext;
    
    constructor(props: EventGroupProps) {
        super(props);
    }

    render() {
        const { group } = this.props

        // Sequences are aka "tracks" are aka "columns"
        const sequences = group.map((track, i) => {
            return constructGraph(track)
        })

        const isLeftBranch = (i: number, length: number): boolean => {
            return i < (length / 2)
        }

        const isRightBranch = (i: number, length: number): boolean => {
            return !isLeftBranch(i, length)
        }

        console.log(`this.context ${this.context}`)

        return (
            <div className="event-group">
                <div className="event-sequence-container">
                {
                    sequences.map((sequence, i) => {
                        const context = this.context ? this.context as string : (isLeftBranch(i, sequences.length) ? BubbleSide.LEFT : BubbleSide.RIGHT)
                        return (
                            <BranchContext.Provider value={context}>
                                <div className="event-sequence">{sequence}</div>
                            </BranchContext.Provider>
                        )
                    })
                }
                </div>
            </div>
        )
    }
}

const projectionOverlaps = (minA: number, maxA: number, minB: number, maxB: number) => {
    return maxA >= minB && maxB >= minA
}

const buildGraph = (sortedEvents: Event[]) => {
    let graph = [[sortedEvents[0]]];

/*
    let active = 0;
    for (let i = 1; i < sortedEvents.length; i++) {
        const e1 = sortedEvents[i];
        for (let j = 1; j < sortedEvents.length; j++) {
            let index = j + active % sortedEvents.length;
            const e2 = graph[index];
            if (!projectionOverlaps(e1.startDate || e1.date, e1.endDate || e1.date, e2.startDate || e2.date, e2.endDate || e2.date) {
                
                active = index
            }
        }
    }
*/
    return graph;
}

interface EventTrackProps {
    children: ReactNode;
}

// TODO Rename EventTrack -> EventSequence and EventSequence -> EventColumnContainer or something like that
// Also, a group is a collection of tracks - I wonder if I can be more explicit about that
const EventTrack: React.FC<EventTrackProps> = ({ children }) => {
    return (
        <div className="event-track">
            {children}
        </div>
    )
}

const constructGraph = (graph: EventGraph): JSX.Element[] => {
    let nodes: JSX.Element[] = []
    let track: JSX.Element[] = []
    for (let i = 0; i < graph.length; i++) {
        const eventOrGroup = graph[i];

        if (!Array.isArray(eventOrGroup)) {
            const event = eventOrGroup as Event
            if (event.startDate) {
                track.push(<EventRange event={event} height={100} />)
            } else if (event.date) {
                track.push(<EventInstance event={event} />)
            }
        }

        if (Array.isArray(eventOrGroup)) {
            // End track if group is found
            // TODO consider baking this into the data structure
            if (track.length > 0) { 
                nodes.push(<EventTrack>{track}</EventTrack>)
                track = []
            }
            const group = eventOrGroup as EventGroup
            if (group) {
                nodes.push(<EventGroupComponent group={group} />);
            }
        }
    }

    if (track.length > 0) { 
        nodes.push(<EventTrack>{track}</EventTrack>)
    }

    return nodes;
}

interface TimelineProps {
    events?: Event[];
    graph?: EventGraph; // (Event | Event[])[];
}

const Timeline: React.FC<TimelineProps> = ({ events, graph }) => {
    if ((events === undefined) === (graph === undefined)) {
        throw new Error("Either `events` or `graph` must be defined, but not both.")
    }

    if (events) {
        const sortedEvents = events.sort((a, b) => {
            const aDate = a.startDate || a.date;
            const bDate = b.startDate || b.date;

            if (aDate && bDate) {
                return aDate.getTime() - bDate.getTime();
            }
            
            return 0;
        });

        // graph = buildGraph(sortedEvents);
        graph = sortedEvents
    }

    return (
        <div className="timeline">
            {graph && constructGraph(graph)}
        </div>
    )
}

function AppV2() {
    return (
        <React.Fragment>
            <Timeline graph={singleInstanceGraph} />
            <hr/>
            <Timeline graph={twoInstancesGraph} />
            <hr/>
            <Timeline graph={threeInstancesGraph} />
            <hr/>
            <Timeline graph={mixedEventsGraph} />
            <hr/>
            <Timeline graph={collidingInstancesGraph} />
            <hr/>
            <Timeline graph={miniPyramidGraph} />
            <hr/>
            <Timeline graph={collidingInstanceAndRangeGraph} />
            <hr/>
            <Timeline graph={collidingInstanceAndRangeFlippedGraph} />
            <hr/>
            <Timeline graph={danglingEventGraph} />
            <hr/>
            <Timeline graph={medPyramidGraph} />
            <hr/>
            <Timeline graph={largePyramidGraph} />
            <hr/>
            <Timeline graph={miniPyramidWeightedLeftGraph} />
            <hr/>
            <Timeline graph={miniPyramidWeightedRightGraph} />
            <hr/>
            <Timeline graph={threeColumnsGraph} />
            <hr/>
        </React.Fragment>
    )
}

export default AppV2;
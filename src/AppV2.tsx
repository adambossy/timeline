import React, { ReactNode, useRef, useEffect, useState } from 'react';
import 'react-vertical-timeline-component/style.min.css';

import './AppV2.css';


interface Event {
    title: string;
    date?: Date;
    startDate?: Date;
    endDate?: Date;
}

// type MinLengthArray<T> = [T, T, ...T[]]; // array with two or more elements
type EventGroup = EventGraph[];
type EventGraph = (Event | EventGroup)[];

const event1: Event = {
    title: "Mantle sweeper",
    date: new Date("2010-01-01"),
}

const event2: Event = {
    title: "Plate grower",
    date: new Date("2010-01-01"),
}

const event3: Event = {
    title: "Grocery bagger",
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
    title: "Sheep groomer",
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
    {
        title: "Mantle sweeper",
        date: new Date("2010-01-01"),
    },
]

const singleInstanceGraph: EventGraph = [
    {
            title: "Mantle sweeper",
            date: new Date("2010-01-01"),
    },
]

const singleRange: Event[] = [
    {
        title: "Sheep groomer",
        startDate: new Date("2010-01-01"),
        endDate: new Date("2011-01-01"),
    },
]

const twoInstances: Event[] = [
    {
        title: "Mantle sweeper",
        date: new Date("2010-01-01"),
    },
    {
        title: "Plate grower",
        date: new Date("2011-01-01"),
    },
]

const twoInstancesGraph: EventGraph = [
    {
        title: "Mantle sweeper",
        date: new Date("2010-01-01"),
    },
    {
        title: "Plate grower",
        date: new Date("2011-01-01"),
    },
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
    {
        title: "Mantle sweeper",
        date: new Date("2010-01-01"),
    },
    {
        title: "Plate grower",
        date: new Date("2010-01-01"),
    },
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

const collidingInstanceAndRange: Event[] = [
    {
        title: "Sheep groomer",
        startDate: new Date("2010-01-01"),
        endDate: new Date("2010-03-01"),
    },
    {
        title: "Mantle sweeper",
        date: new Date("2010-02-01"),
    },
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

/*
const events: Events = [
    {
        title: "Mantle sweeper",
        date: new Date("2010-01-01"),
    },
    {
        title: "House of card builder",
        startDate: new Date("2010-01-01"), // no end date, goes until present
    },
    {
        title: "Sheep groomer",
        startDate: new Date("2010-01-01"),
        endDate: new Date("2011-01-01"),
    },
]
*/

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

interface EventGroupProps {
    group: EventGroup;
}

const EventGroupComponent: React.FC<EventGroupProps> = ({ group }) => {
    const sequenceRefs = useRef<HTMLDivElement[]>([])
    const [widths, setWidths] = useState<number[]>([])

    useEffect(() => {
        sequenceRefs.current.forEach((ref, i) => {
            console.log(`ref ${ref} width ${ref.clientWidth}`)
            widths.push(ref.clientWidth)
        })
    });

    let sequences = []; // aka "tracks" aka "columns"
    for (let i = 0; i < group.length; i++) {
        console.log(`group[${i}] ${JSON.stringify(group[i])}`);
        sequences.push(constructGraph(group[i]));
    }    

    return (
        <div className="event-group">
            <div className="event-sequence-container">
            {
                sequences.map((sequence, i) => {
                    return (
                        <div
                            className="event-sequence"
                            ref={(el) => {
                                if (el) {
                                    sequenceRefs.current[i] = el
                                }
                            }}>
                            {sequence}
                        </div>
                    )
                })
            }
            </div>
        </div>
    )
}

interface TimelineProps {
    events?: Event[];
    graph?: EventGraph; // (Event | Event[])[];
    children: ReactNode;
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

// type EventGroup = (Event | Event[])[];

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
                track.push(<EventRange height={100} bubbleSide={BubbleSide.LEFT} />)
            } else if (event.date) {
                track.push(<EventInstance />)
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

const Timeline: React.FC<TimelineProps> = ({ events, graph, children }) => {
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
            <Timeline graph={singleInstanceGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={twoInstancesGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={threeInstancesGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={mixedEventsGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={collidingInstancesGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={miniPyramidGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={collidingInstanceAndRangeGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={collidingInstanceAndRangeFlippedGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={danglingEventGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={medPyramidGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={miniPyramidWeightedLeftGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={miniPyramidWeightedRightGraph}>
            </Timeline>
            <hr/>
            <Timeline graph={threeColumnsGraph}>
            </Timeline>
            <hr/>
            {/*
            <Timeline events={singleInstance}>
                <EventInstance />
            </Timeline>
            <hr/>
            <Timeline events={singleRange}>
                <EventRange height={100} bubbleSide={BubbleSide.LEFT}  />
            </Timeline>
            <hr/>
            <Timeline events={twoInstances}>
                <EventInstance />
                <EventInstance />
            </Timeline>
            <hr/>
            <Timeline events={collidingInstances}>
                <EventInstance />
                <EventInstance />
            </Timeline>
            <hr/>
            <Timeline events={collidingInstanceAndRange}>
                <EventInstance />
                <EventRange height={100} bubbleSide={BubbleSide.LEFT}  />
            </Timeline>
            {/*
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
            */}
        </React.Fragment>
    )
}

export default AppV2;
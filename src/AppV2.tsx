import React, { Component, ReactNode, useCallback, useContext, useRef, useEffect, useState } from 'react';
import './AppV2.css';


const BranchContext = React.createContext('');

type BubbleRefContextType = (event: Event, el: HTMLDivElement | null) => void;
const BubbleRefContext = React.createContext<BubbleRefContextType>(() => {});


type Vector = [
    otherRef: HTMLDivElement,
    dx: number,
    dy: number,
];

interface Rect {
    x: number,
    y: number,
    width: number,
    height: number,
}

interface Event {
    title: string,
    date?: Date,
    startDate?: Date,
    endDate?: Date,
    rect?: Rect,
    vectors?: Vector[],
    id?: number, // debugging HACK
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
    event3,
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
    event3,
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
    rectOverride?: Rect;
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

const EventRange: React.FC<EventRangeProps> = ({ event, height, rectOverride }) => {
    const branchContext = useContext(BranchContext);

    return (
        <React.Fragment>
            <div className="event-range" style={{ height: height + "px" }}>
                <EventBubble event={event} bubbleSide={branchContext} rectOverride={rectOverride} />
            </div>
        </React.Fragment>
    );
};

interface EventInstanceProps {
    event: Event,
    rectOverride?: Rect;
}

class EventInstance extends React.Component<EventInstanceProps> {

    static contextType = BranchContext

    constructor(props: EventInstanceProps) {
        super(props)
    }

    render () {
        const { event, rectOverride } = this.props 
        return (
            <div className="event-instance">
                <EventBubble event={event} bubbleSide={this.context} rectOverride={rectOverride} />
            </div>
        )
    }
}

interface VectorProps {
    width: number;
    height: number;
    dx: number;
    dy: number;
}

const Vector: React.FC<VectorProps> = ({ width, height, dx, dy }) => {
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const length = Math.sqrt(dx * dx + dy * dy)

    const vectorStyle = {
        left: ((width - length) / 2) + "px",
        top: (height / 2 - 5) + "px",  // MAGIC NUMBER ALERT .point border-top-width
        width: length + "px",
        Transform: "rotate(" + angle + "deg)",
        WebkitTransform: "rotate(" + angle + "deg)"
    }
    const lineStyle = {
        marginLeft: length / 2 + "px",
        width: Math.max(0, length / 2 - 16) + "px" // MAGIC NUMBER ALERT .point border-left-width
    }
    return (
        <div className="Vector" style={vectorStyle} /*ref={el => vectorRefs[j] = el}*/>
            <div className="Vector-stem" style={lineStyle}></div>
            <div className="Vector-point"></div>
        </div>
    )
}

interface EventBubbleProps {
    event: Event;
    bubbleSide: BubbleSide | unknown;
    rectOverride?: Rect;
}

const EventBubble: React.FC<EventBubbleProps> = ({ event, bubbleSide }) => {
    const bubbleRef = useRef<HTMLDivElement | null>(null);
    const addBubbleRef = useContext(BubbleRefContext);
  
    useEffect(() => {
        addBubbleRef(event, bubbleRef.current);
    }, [addBubbleRef]);

    if (!bubbleSide) {
        bubbleSide = BubbleSide.LEFT;
    }

    const bubbleClassNames = `event-range-bubble ${bubbleSide}`

    const vectors = (event.vectors || []).map((v, i) => {
        const [ _, dx, dy ] = v
        if (event.rect) {
            return <Vector width={event.rect.width} height={event.rect.height} dx={dx} dy={dy} />
        }
    })

    const style = event.rect ? {
        left: event.rect.x,
        top: event.rect.y,
    } : {}

    return (
        <div className={bubbleClassNames} ref={bubbleRef} style={style}>
            <div className="event-range-bubble-arrow"></div>
            <p>{formatDateRange(event)}</p>
            <h1>{event.title}</h1>
            {vectors}
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
            return <EventGraphComponent graph={track} bubbleRefOverrides={[]} />
        })

        const isLeftBranch = (i: number, length: number): boolean => {
            return i < (length / 2)
        }

        const isRightBranch = (i: number, length: number): boolean => {
            return !isLeftBranch(i, length)
        }

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

interface EventGraphProps {
    graph: EventGraph;
    bubbleRefOverrides?: HTMLDivElement[];
}

// FIXME stopgap solution to copy leaf nodes (events) that are reused to avoid a bug when their .rect and .vectors properties get overwritten
const uniqifyEventGraph = (graph: EventGraph): EventGraph => {
    let nodes: EventGraph = []
    let track: Event[] = []

    for (let i = 0; i < graph.length; i++) {
        const eventOrGroup = graph[i];

        if (!Array.isArray(eventOrGroup)) {
            const event = eventOrGroup as Event
            track.push({ ...event })
        } else {
            if (track.length > 0) { 
                nodes.push(...track)
                track = []
            }
            const group = eventOrGroup as EventGroup
            nodes.push(group.map((track, j) => {
                return uniqifyEventGraph(track)
            }))
        }
    }

    if (track.length > 0) { 
        nodes.push(...track)
    }

    return nodes 
}

const EventGraphComponent: React.FC<EventGraphProps> = ({ graph, bubbleRefOverrides }) => {
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
        } else {
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

    return (
        <React.Fragment>
            {nodes}
        </React.Fragment>
    )
}

interface TimelineProps {
    events?: Event[];
    graph?: EventGraph; // (Event | Event[])[];
}

const projectionOverlaps = (minA: number, maxA: number, minB: number, maxB: number) => {
    return maxA >= minB && maxB >= minA
}

const isOverlapping = (bubbleA: HTMLDivElement, bubbleB: HTMLDivElement) => {
    const rectA = bubbleA.getBoundingClientRect();
    const rectB = bubbleB.getBoundingClientRect();
    return projectionOverlaps(rectA.x, rectA.x + rectA.width, rectB.x, rectB.x + rectB.width) &&
        projectionOverlaps(rectA.y, rectA.y + rectA.height, rectB.y, rectB.y + rectB.height)
}

const centerX = (bubble: HTMLDivElement) => {
    const rect = bubble.getBoundingClientRect();
    return rect.x + (rect.width / 2);
}

const centerY = (bubble: HTMLDivElement) => {
    const rect = bubble.getBoundingClientRect();
    return rect.y + (rect.height / 2);
}

const computeVectorMatrix = (eventAndRefPairs: [Event, HTMLDivElement][]) => {
    let vectorMatrix: Vector[][] = []

    eventAndRefPairs.forEach(([ event, ref ], i) => {
        vectorMatrix.push([])
        event.vectors = vectorMatrix[i] // reset vectors
        if (!event.rect) {
            event.rect = ref.getBoundingClientRect()
            event.rect.x = ref.offsetLeft // override
            event.rect.y = ref.offsetTop // override
        }
    })

    for (let i = 0; i < eventAndRefPairs.length; i++) {
        const [ eventA, bubbleA ] = eventAndRefPairs[i]
        for (let j = i + 1; j < eventAndRefPairs.length; j++) {
            const [ eventB, bubbleB ] = eventAndRefPairs[j]
            const dx = centerX(bubbleB) - centerX(bubbleA)
            const dy = centerY(bubbleB) - centerY(bubbleA)
            if (eventA.vectors && eventB.rect) {
                eventA.vectors.push([ bubbleB, dx, dy ])
            }
            if (eventB.vectors && eventA.rect) {
                eventB.vectors.push([ bubbleA, -dx, -dy ])
            }
        }
    }

    return vectorMatrix
}

const DAMPENING_FACTOR = 200.0

const applyVectors = (eventAndRefPairs: [Event, HTMLDivElement][]) => {
    eventAndRefPairs.forEach(([ event, ref ], i) => {
        (event.vectors || []).forEach((vector, i) => {
            const bubbleA = ref
            const [ bubbleB, dx, dy ] = vector
            if (isOverlapping(bubbleA, bubbleB) && event.rect) {
                // console.log(`dx ${dx} dy ${dy}`)
                event.rect.x -= DAMPENING_FACTOR / dx
                event.rect.y -= DAMPENING_FACTOR / dy
                // event.rect.x -= (DAMPENING_FACTOR / (dx ** 1.25)) * (dx < 0 ? -1 : 1)
                // event.rect.y -= (DAMPENING_FACTOR / (dy ** 1.25)) * (dy < 0 ? -1 : 1)
            }
        })
    })    
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

    const [eventAndRefPairs, setBubbleRefs] = useState<[Event, HTMLDivElement][]>([]);

    const addBubbleRef = useCallback((event: Event, el: HTMLDivElement | null) => {
        if (el) {
            setBubbleRefs((prevRefs) => [...prevRefs, [ event, el ]]);
        }
    }, []);

    const [ _graph, setGraph ] = useState<EventGraph>();
    const [ renderedOnce, setRenderedOnce ] = useState(false)

    useEffect(() => {
        // useEffect seemed to get called twice per Timeline, and ignore the first, premature call
        if (!eventAndRefPairs.length) {
            return
        }

        if (!renderedOnce) {
            computeVectorMatrix(eventAndRefPairs)
            setGraph(graph)
            setRenderedOnce(true)
        }
    })
  
    const step = () => {
        console.log('step')

        applyVectors(eventAndRefPairs)
        computeVectorMatrix(eventAndRefPairs)
        if (graph) {
            graph = uniqifyEventGraph(graph)
            setGraph(graph)
        }
        // TODO find a way to dynamically recompute these after they're calculated
    }

    return (
        <div className="timeline">
            <BubbleRefContext.Provider value={addBubbleRef}>
                {
                    _graph && <EventGraphComponent graph={_graph} /> ||
                    graph && <EventGraphComponent graph={graph} />
                }
            </BubbleRefContext.Provider>
            <button className="timeline-step" onClick={step}>
                Step
            </button>
        </div>
    )
}

function AppV2() {
    return (
        <React.Fragment>
            {/*}
            <Timeline graph={uniqifyEventGraph(singleInstanceGraph)} />
            <hr/>
            <Timeline graph={uniqifyEventGraph(twoInstancesGraph)} />
            <hr/>
            <Timeline graph={uniqifyEventGraph(threeInstancesGraph)} />
            <hr/>
            <Timeline graph={uniqifyEventGraph(mixedEventsGraph)} />
            <hr/>
            <Timeline graph={uniqifyEventGraph(collidingInstancesGraph)} />
            <hr/>
            <Timeline graph={uniqifyEventGraph(miniPyramidGraph)} />
            <hr/>
            <Timeline graph={uniqifyEventGraph(collidingInstanceAndRangeGraph)} />
            <hr/>
            <Timeline graph={uniqifyEventGraph(collidingInstanceAndRangeFlippedGraph)} />
            <hr/>
            <Timeline graph={uniqifyEventGraph(danglingEventGraph)} />
            <hr/>
            */}
            <Timeline graph={uniqifyEventGraph(medPyramidGraph)} />
            <hr/>
            <Timeline graph={uniqifyEventGraph(miniPyramidWeightedRightGraph)} />
            <hr/>
            {/*}
            <Timeline graph={uniqifyEventGraph(largePyramidGraph)} />
            <hr/>
            <Timeline graph={uniqifyEventGraph(miniPyramidWeightedLeftGraph)} />
            <hr/>
            <Timeline graph={uniqifyEventGraph(threeColumnsGraph)} />
            <hr/>
            */}
        </React.Fragment>
    )
}

export default AppV2;
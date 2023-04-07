import { cloneDeep, isEqual } from 'lodash';
import React, { ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import './AppV2.css';


function deepCopy<T>(obj: T): T {
    let copy: T;
  
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" !== typeof obj) return obj;
  
    // Handle DOM node
    // DON'T copy because there's no use in having orphaned DOM nodes floating around
    if (obj instanceof Node) {
      return obj;
      return copy;
    }
  
    // Handle Date
    if (obj instanceof Date) {
      copy = new Date() as unknown as T;
      (copy as unknown as Date).setTime((obj as unknown as Date).getTime());
      return copy;
    }
  
    // Handle Array
    if (Array.isArray(obj)) {
      copy = [] as unknown as T;
      for (let i = 0, len = (obj as unknown as Array<any>).length; i < len; i++) {
        (copy as unknown as Array<any>)[i] = deepCopy((obj as unknown as Array<any>)[i]);
      }
      return copy;
    }
  
    // Handle Object
    if (obj instanceof Object) {
      copy = {} as T;
      for (const attr in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, attr)) {
          (copy as unknown as Record<string, any>)[attr] = deepCopy((obj as unknown as Record<string, any>)[attr]);
        }
      }
      return copy;
    }
  
    throw new Error("Unable to copy obj! Its type isn't supported.");
  }
  


const SHOW_VECTORS = false

const BranchContext = React.createContext('');

type BubbleRefContextType = (event: Event, el: HTMLDivElement | null) => void;
const BubbleRefContext = React.createContext<BubbleRefContextType>(() => { });

type TimelineRefContextType = (el: HTMLDivElement | null) => void;
const TimelineRefContext = React.createContext<TimelineRefContextType>(() => { });


type Vector = [
    other: Rect,
    dx: number,
    dy: number,
];

interface Rect {
    x: number,
    y: number,
    styleX: number, // relative to parent, used for style: left
    styleY: number, // relative to parent, used for style: top
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

const event4: Event = {
    title: "Software engineer",
    date: new Date("2013-01-01"),
}

const event5: Event = {
    title: "Founder",
    date: new Date("2014-01-01"),
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

const range2: Event = {
    title: "Grad Student",
    startDate: new Date("2013-01-01"),
    endDate: new Date("2016-03-01"),
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
        [
            [
                event1a,
            ],
            [
                event2,
            ]
        ]
    ],
    [
        event3,
        [
            [
                event4,
            ],
            [
                event5,
            ]
        ]
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
        event1a,
        [
            [
                event2,
            ],
            [
                range2,
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

const adamsGraph: EventGraph = [
    {
        title: "Founder",
        startDate: new Date("2013-01-01"),
        endDate: new Date("2016-03-01"),
    },
    {
        title: "Senior Engineering Manager",
        startDate: new Date("2019-01-01"),
        endDate: new Date("2022-10-01"),
    },
    {
        title: "Engineering Manager",
        startDate: new Date("2016-01-01"),
        endDate: new Date("2018-11-01"),
    },
    {
        title: "Student",
        startDate: new Date("2016-08-01"),
        endDate: new Date("2015-12-01"),
    },
    {
        title: "Member of Technical Staff",
        startDate: new Date("2011-02-01"),
        endDate: new Date("2014-18-01"),
    }
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
    return date_ || (startDate + (endDate ? ' - ' + endDate : ''))
}

const EventRange: React.FC<EventRangeProps> = ({ event, height }) => {
    const eventRef = useRef<HTMLDivElement | null>(null)
    const [rect, setRect] = useState<DOMRect | null>(null)

    useEffect(() => {
        if (eventRef.current) {
            const _rect = eventRef.current.getBoundingClientRect()
            if (_rect) {
                setRect(_rect) // TODO evaluate whether this is the best state to change to force re-render
            }
        }
    }, [eventRef])

    return (
        <div className="event-range" ref={eventRef} style={{ height: height + "px" }}>
            <EventBubble event={event} instanceRect={rect} />
        </div>
    );
};

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
                setRect(_rect) // TODO evaluate whether this is the best state to change to force re-render
            }
        }
    }, [eventRef])
  
    return (
        <div className="event-instance" ref={eventRef}>
            <EventBubble event={event} instanceRect={rect} />
        </div>
    )
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
        <div className="Vector" style={vectorStyle}>
            <div className="Vector-stem" style={lineStyle}></div>
            <div className="Vector-point"></div>
        </div>
    )
}

interface LineProps {
    bubbleRect: Rect,
    instanceRect: DOMRect, // TODO change to ? and remove null - need to propagate this up the component tree
}

const Line: React.FC<LineProps> = ((props) => {
    // This component draws a line from the a bubble rect to an instance rect
    // and is a child of bubble rect

    let { bubbleRect, instanceRect } = props;

    const branchContext = useContext(BranchContext);
    let bubbleSide = branchContext ? branchContext as BubbleSide : BubbleSide.LEFT

    const xA = bubbleRect.x + ((bubbleSide === BubbleSide.LEFT) ? bubbleRect.width : 0)
    const yA = bubbleRect.y + (bubbleRect.height / 2)
    const xB = instanceRect.x + (instanceRect.width / 2)
    const yB = instanceRect.y + (instanceRect.height / 2)

    const dx = xB - xA
    const dy = yB - yA

    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const length = Math.sqrt(dx * dx + dy * dy)

    const lineContainerStyle = {
        left: bubbleSide === BubbleSide.LEFT
            ? `calc(100% + 4px - ${length}px)`
            : `calc(-${length}px - 4px)`, 
        width: `${length * 2}px`,
        Transform: `rotate(${Math.round(angle)}deg)`,
        WebkitTransform: `rotate(${Math.round(angle)}deg)`
    }
    const lineStyle = {
        marginLeft: `${length}px`,
        width: `${length}px`
    }
    
    return (
        <div className="line-container" style={lineContainerStyle}>
            <div className="line" style={lineStyle}></div>
        </div>
    )
})

interface EventBubbleProps {
    event: Event,
    instanceRect: DOMRect | null,
}

const EventBubble: React.FC<EventBubbleProps> = ({ event, instanceRect }) => {
    const bubbleRef = useRef<HTMLDivElement | null>(null);
    const addBubbleRef = useContext(BubbleRefContext);

    useEffect(() => {
        addBubbleRef(event, bubbleRef.current); // Used to pass bubble refs to Timeline component and have it sort among them at the top level
    }, [addBubbleRef]);

    const branchContext = useContext(BranchContext);
    let bubbleSide = branchContext ? branchContext as BubbleSide : BubbleSide.LEFT

    const bubbleClassNames = `event-range-bubble ${bubbleSide}`

    const vectors = SHOW_VECTORS && (event.vectors || []).map((v, i) => {
        const [_, dx, dy] = v
        if (event.rect) {
            return <Vector width={event.rect.width} height={event.rect.height} dx={dx} dy={dy} />
        }
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
            {SHOW_VECTORS && vectors}
        </div>
    )
}

interface EventGroupProps {
    group: EventGroup;
}

const EventGroupComponent: React.FC<EventGroupProps> = ({ group }) => {
    const context = useContext(BranchContext);

    // TODO this should probably be moved to EventTrack, which is the most
    // pervasive element in the timeline and therefore we could do it once with just that element
    const groupRef = useRef<HTMLDivElement | null>(null);
    const addTimelineRef = useContext(TimelineRefContext);

    useEffect(() => {
        addTimelineRef(groupRef.current);
    }, [addTimelineRef]);

    // Sequences are aka "tracks" are aka "columns"
    const sequences = group.map((track, i) => {
        return <EventGraphComponent graph={track} bubbleRefOverrides={[]} />
    })

    const isLeftBranch = (i: number, length: number): boolean => {
        return i < (length / 2)
    }

    return (
        <div className="event-group">
            <div className="event-sequence-container" ref={groupRef}>
                {
                    sequences.map((sequence, i) => {
                        const currentContext = context ? context as string : (isLeftBranch(i, sequences.length) ? BubbleSide.LEFT : BubbleSide.RIGHT)
                        return (
                            <BranchContext.Provider value={currentContext}>
                                <div className="event-sequence">{sequence}</div>
                            </BranchContext.Provider>
                        )
                    })
                }
            </div>
        </div>
    )
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

const printGraph = (graph: EventGraph, indent: number = 4): string => {

    const printEvent = (event: Event): string => {
        return JSON.stringify({
            title: event.title,
            date: event.date,
            startDate: event.startDate,
            endDate: event.endDate,
            rect: event.rect,
            vectorLength: '[' + (event.vectors || []).map(([ otherRef, dx, dy ]) => `[${otherRef}, ${dx}, ${dy}]` ).join(',') + ']',
        })
    }

    let s = ' '.repeat(indent - 4) + '[\n'
    for (let i = 0; i < graph.length; i++) {
        const eventOrGroup = graph[i];
        if (Array.isArray(eventOrGroup)) {
            const group = eventOrGroup as EventGroup
            s += group.map((track) => {
                return printGraph(track, indent + 4)
            }).join('\n')
        } else {
            const event = eventOrGroup as Event
            s += ' '.repeat(indent) + printEvent(event) + '\n'
        }
    }
    s += ' '.repeat(indent - 4) + ']\n'
    return s
}

const EventGraphComponent: React.FC<EventGraphProps> = ({ graph }) => {
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
    graph?: EventGraph;
}

const projectionOverlaps = (minA: number, maxA: number, minB: number, maxB: number) => {
    return maxA >= minB && maxB >= minA
}

const isOverlapping = (rectA: Rect, rectB: Rect) => {
    return projectionOverlaps(rectA.x, rectA.x + rectA.width, rectB.x, rectB.x + rectB.width) &&
        projectionOverlaps(rectA.y, rectA.y + rectA.height, rectB.y, rectB.y + rectB.height)
}

const rectFromRef = (ref: HTMLDivElement): Rect => {
    const rect = ref.getBoundingClientRect()
    return  {
        x: rect.x,
        y: rect.y,
        styleX: ref.offsetLeft,
        styleY: ref.offsetTop,
        width: rect.width,
        height: rect.height,
    }
}

const centerX = (rect: Rect) => {
    return rect.x + (rect.width / 2);
}

const centerY = (rect: Rect) => {
    return rect.y + (rect.height / 2);
}

const computeVectorMatrix = (eventAndRefPairs: [Event, HTMLDivElement][], timelineRefs: HTMLDivElement[]) => {
    let vectorMatrix: Vector[][] = []

    eventAndRefPairs.forEach(([event, ref], i) => {
        vectorMatrix.push([])
        event.vectors = vectorMatrix[i] // reset vectors
        if (!event.rect) {
            event.rect = rectFromRef(ref) 
        }
    })

    for (let i = 0; i < eventAndRefPairs.length; i++) {
        const [eventA, refA] = eventAndRefPairs[i]
        for (let j = i + 1; j < eventAndRefPairs.length; j++) {
            const [eventB, refB] = eventAndRefPairs[j]
            if (eventA.rect && eventB.rect && eventA.vectors && eventB.vectors) {
                const dx = centerX(eventB.rect) - centerX(eventA.rect)
                const dy = centerY(eventB.rect) - centerY(eventA.rect)
                eventA.vectors.push([eventB.rect, dx, dy])
                eventB.vectors.push([eventA.rect, -dx, -dy])
            }
        }

        // TODO should probably merge all these vectors into a single one
        for (let j = 0; j < timelineRefs.length; j++) {
            const timelineRef = timelineRefs[j]
            if (eventA.rect && eventA.vectors) {
                const timelineRect = rectFromRef(timelineRef) 
                const dx = centerX(timelineRect) - centerX(eventA.rect)
                const dy = centerY(timelineRect) - centerY(eventA.rect)
                eventA.vectors.push([timelineRect, dx, dy])
            }
        }
    }

    return vectorMatrix
}

const applyVectors = (eventAndRefPairs: [Event, HTMLDivElement][]) => {

    eventAndRefPairs.forEach(([event, ref], i) => {
        (event.vectors || []).forEach((vector, i) => {
            let [otherRect, dx, dy] = vector
            if (event.rect && isOverlapping(event.rect, otherRect)) {
                let offsetX = dx / 4
                let offsetY = dy / 16

                event.rect.x -= offsetX
                event.rect.y -= offsetY
                event.rect.styleX -= offsetX
                event.rect.styleY -= offsetY
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

        graph = sortedEvents
    }

    const [eventAndRefPairs, setBubbleRefs] = useState<[Event, HTMLDivElement][]>([]);

    const addBubbleRef = useCallback((event: Event, el: HTMLDivElement | null) => {
        if (el) {
            setBubbleRefs((prevRefs) => [...prevRefs, [event, el]]);
        }
    }, []);

    // Refs for timeline objects, including EventGroupComponents and top-level EventTracks
    const [timelineRefs, setTimelineRefs] = useState<HTMLDivElement[]>([]);

    const addTimelineRef = useCallback((el: HTMLDivElement | null) => {
        if (el) {
            setTimelineRefs((prevRefs) => [...prevRefs, el]);
        }
    }, []);

    const [_graph, setGraph] = useState<EventGraph>();
    const [renderedOnce, setRenderedOnce] = useState(false)

    useEffect(() => {
        // useEffect seemed to get called twice per Timeline, and ignore the first, premature call
        if (!eventAndRefPairs.length) {
            return
        }

        if (!renderedOnce) {
            let oldGraph
            let i = 0
            while (!isEqual(graph, oldGraph)) {
                oldGraph = deepCopy(graph)

                computeVectorMatrix(eventAndRefPairs, timelineRefs)
                applyVectors(eventAndRefPairs)

                i += 1
                if (i > 50) {
                    break
                }
                console.log(`iteration #${i}`)
            }
            setGraph(graph)
            setRenderedOnce(true)
        }
    })

    const step = () => {
        console.log('step')

        if (graph) {
            const oldGraph = deepCopy(graph)

            computeVectorMatrix(eventAndRefPairs, timelineRefs)
            applyVectors(eventAndRefPairs)

            if (isEqual(graph, oldGraph)) {
                console.log('Iteration done!')
            } else {
                console.log('Need more iterations!')
            }
            setGraph(graph)
        }
    }

    return (
        <div className="timeline">
            <BubbleRefContext.Provider value={addBubbleRef}>
                <TimelineRefContext.Provider value={addTimelineRef}>
                    {
                        _graph && <EventGraphComponent graph={_graph} /> ||
                        graph && <EventGraphComponent graph={graph} />
                    }
                </TimelineRefContext.Provider>
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
            {/*
            <Timeline graph={deepCopy(singleInstanceGraph)} />
            <hr />
            <Timeline graph={deepCopy(singleInstanceGraph)} />
            <hr />
            <Timeline graph={deepCopy(twoInstancesGraph)} />
            <hr />
            <Timeline graph={deepCopy(threeInstancesGraph)} />
            <hr />
            <Timeline graph={deepCopy(mixedEventsGraph)} />
            <hr />
            <Timeline graph={deepCopy(collidingInstancesGraph)} />
            <hr />
            <Timeline graph={deepCopy(miniPyramidGraph)} />
            <hr />
            <Timeline graph={deepCopy(collidingInstanceAndRangeGraph)} />
            <hr />
            <Timeline graph={deepCopy(collidingInstanceAndRangeFlippedGraph)} />
            <hr />
            <Timeline graph={deepCopy(danglingEventGraph)} />
            <hr />
            <Timeline graph={deepCopy(medPyramidGraph)} />
            <hr />
            <Timeline graph={deepCopy(miniPyramidWeightedRightGraph)} />
            <hr />
            <Timeline graph={deepCopy(largePyramidGraph)} />
            <hr />
            <Timeline graph={deepCopy(miniPyramidWeightedLeftGraph)} />
            <hr />
            <Timeline graph={deepCopy(threeColumnsGraph)} />
            <hr />
            */}
            <Timeline graph={deepCopy(adamsGraph)} />
            <hr />
        </React.Fragment>
    )
}

export default AppV2;
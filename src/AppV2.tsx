import React, { Component, ReactNode, useCallback, useContext, useRef, useEffect, useState } from 'react';
import { cloneDeep, isEqual } from 'lodash';
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
    other: Rect, // otherRef: HTMLDivElement,
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

const EventRange: React.FC<EventRangeProps> = ({ event, height }) => {
    const branchContext = useContext(BranchContext);
    const eventRef = useRef(null)

    return (
        <React.Fragment>
            <div className="event-range" style={{ height: height + "px" }}>
                <EventBubble event={event} bubbleSide={branchContext} instanceRect={null} ref={eventRef} />
            </div>
        </React.Fragment>
    );
};

interface EventInstanceProps {
    event: Event,
}

const EventInstance: React.FC<EventInstanceProps> = ({ event }) => {
    const context = useContext(BranchContext);
    const eventRef = useRef<HTMLDivElement | null>(null)
    const [rect, setRect] = useState<DOMRect | null>(null)

    useEffect(() => {
        if (eventRef.current) {
            const _rect = eventRef.current.getBoundingClientRect()
            if (_rect) {
                setRect(_rect) //  ?? null) // TODO evaluate whether this is the best state to change to force re-render
            }
        }
    }, [eventRef])
  
    return (
        <div className="event-instance" ref={eventRef}>
            <EventBubble event={event} bubbleSide={context} instanceRect={rect} ref={eventRef} />
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
        <div className="Vector" style={vectorStyle} /*ref={el => vectorRefs[j] = el}*/>
            <div className="Vector-stem" style={lineStyle}></div>
            <div className="Vector-point"></div>
        </div>
    )
}

interface LineProps {
    xA: number,
    yA: number,
    xB: number,
    yB: number,
    bubbleRect?: Rect,
    instanceRect: DOMRect | null, // TODO change to ? and remove null - need to propagate this up the component tree
    bubbleSide: BubbleSide | unknown,
}

// const Line: React.FC<LineProps> = ({ xA, yA, xB, yB}) => {
//const Line: React.FC<LineProps> = React.forwardRef((props, bubbleRef) => {
const Line: React.FC<LineProps> = ((props) => {
    let { xA, yA, xB, yB, bubbleRect, instanceRect, bubbleSide } = props;

    const dx = xB - xA
    const dy = yB - yA

    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const length = Math.sqrt(dx * dx + dy * dy)

    console.log(`line xA ${xA} -xB ${xB} = dx ${dx} | yA ${yA} -yB ${yB} = dy ${dy} | angle ${angle} | length ${length}`)

    const lineContainerStyle = {
        left: bubbleSide === BubbleSide.LEFT ? `calc(100% + 4px - ${length}px)` : `calc(-${length}px - 4px)`, // 4px = border width
        width: length * 2 + "px",
        Transform: "rotate(" + Math.round(angle) + "deg)",
        WebkitTransform: "rotate(" + Math.round(angle) + "deg)"
    }
    const lineStyle = {
        marginLeft: length + "px",
        width: length + "px" // MAGIC NUMBER ALERT .point border-left-width
    }
    
    return (
        <div className="line-container" style={lineContainerStyle} /*ref={el => vectorRefs[j] = el}*/>
            <div className="line" style={lineStyle}></div>
        </div>
    )
})

interface EventBubbleProps {
    event: Event,
    bubbleSide: BubbleSide | unknown, // FIXME this should never be unknown
    instanceRect: DOMRect | null,
}

interface LineOrigin {
    x: number,
    y: number,
}

const EventBubble = React.forwardRef<HTMLDivElement, EventBubbleProps>(({ event, bubbleSide, instanceRect }, ref) => {
    const bubbleRef = useRef<HTMLDivElement | null>(null);
    const addBubbleRef = useContext(BubbleRefContext);
    // const [lineOrigin, setLineOrigin] = useState<LineOrigin | null>(null)

    useEffect(() => {
        addBubbleRef(event, bubbleRef.current);
    }, [addBubbleRef]);

    useEffect(() => { // TODO delete this use of useEffect
        console.log(`bubbleRef ${bubbleRef && bubbleRef.current}`)
        /*
        if (bubbleRef.current) {
            const rect = bubbleRef.current.getBoundingClientRect()
            if (bubbleSide === BubbleSide.LEFT) {
                setLineOrigin({
                    x: rect.right,
                    y: rect.y + (rect.height / 2),
                })
            } else {
                setLineOrigin({
                    x: rect.left,
                    y: rect.y + (rect.height / 2),
                })
            }
        }
        */
    }, [bubbleRef]);

    if (!bubbleSide) {
        bubbleSide = BubbleSide.LEFT;
    }

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

    console.log(`event.rect ${event && JSON.stringify(event.rect)}`)
    console.log(`instanceRect ${instanceRect && JSON.stringify(instanceRect)}`)

    let lineOrigin
    if (event.rect) {
        if (bubbleSide === BubbleSide.LEFT) {
            lineOrigin = {
                x: event.rect.x + event.rect.width,
                y: event.rect.y + (event.rect.height / 2),
            }
        } else {
            lineOrigin = {
                x: event.rect.x,
                y: event.rect.y + (event.rect.height / 2),
            }
        }
    }

    return (
        <div className={bubbleClassNames} ref={bubbleRef} style={style}>
            <div className="event-range-bubble-arrow"></div>
            {
                instanceRect && lineOrigin && <Line xA={lineOrigin.x} yA={lineOrigin.y} xB={instanceRect.x + (instanceRect.width / 2)} yB={instanceRect.y + (instanceRect.height / 2)} bubbleRect={event.rect} instanceRect={instanceRect} bubbleSide={bubbleSide} />
            }
            <p>{formatDateRange(event)}</p>
            <h1>{event.title}</h1>
            {SHOW_VECTORS && vectors}
        </div>
    )
})

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

    const isRightBranch = (i: number, length: number): boolean => {
        return !isLeftBranch(i, length)
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

/*
const graphsEqual = (graphA: EventGraph, graphB: EventGraph): boolean => {
    if (graphA.length != graphB.length) {
        return false
    }

    for (let i = 0; i < graphA.length; i++) {
        const eventOrGroupA = graphA[i];
        const eventOrGroupB = graphB[i];

        if (typeof eventOrGroupA != typeof eventOrGroupB) {
            return false
        }

        if (Array.isArray(eventOrGroupA)) {
            const groupA = eventOrGroupA as EventGroup
            const groupB = eventOrGroupB as EventGroup
            const groupsEqual = groupA.map((trackA, j) => {
                const trackB = groupB[j]
                return graphsEqual(trackA, trackB)
            })
            // TODO combine with previous line
            if (!groupsEqual.every(value => value === true))  {
                return false
            }
        } else {
            const eventA = eventOrGroupA as Event
            const eventB = eventOrGroupB as Event
            if (!(eventA.title == eventB.title && eventA.rect == eventB.rect)) { // HACK! Javascript somehow doesn't have a freakin' equals operator on objects
                return false
            }
        }
    }

    return true
}
*/


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

// FIXME stopgap solution to copy leaf nodes (events) that are reused to avoid a bug when their .rect and .vectors properties get overwritten
const uniqifyEventGraph = (graph: EventGraph): EventGraph => {
    return cloneDeep(graph)
}
/*
const uniqifyEventGraph = (graph: EventGraph): EventGraph => {
    let nodes: EventGraph = []
    let track: Event[] = []

    for (let i = 0; i < graph.length; i++) {
        const eventOrGroup = graph[i];

        if (!Array.isArray(eventOrGroup)) {
            const event = eventOrGroup as Event
            track.push(cloneDeep(event))
        } else {
            if (track.length > 0) {
                nodes.push(...track)
                track = []
            }
            const group = eventOrGroup as EventGroup
            nodes.push(group.map((track) => {
                return uniqifyEventGraph(track)
            }))
        }
    }

    if (track.length > 0) {
        nodes.push(...track)
    }

    return nodes
}
*/

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
//const centerX = (bubble: HTMLDivElement) => {
    // const rect = bubble.getBoundingClientRect();
    return rect.x + (rect.width / 2);
}

const centerY = (rect: Rect) => {
// const centerY = (bubble: HTMLDivElement) => {
    // const rect = bubble.getBoundingClientRect();
    return rect.y + (rect.height / 2);
}

const computeVectorMatrix = (eventAndRefPairs: [Event, HTMLDivElement][], timelineRefs: HTMLDivElement[]) => {
    let vectorMatrix: Vector[][] = []

    eventAndRefPairs.forEach(([event, ref], i) => {
        vectorMatrix.push([])
        event.vectors = vectorMatrix[i] // reset vectors
        if (!event.rect) {
            /*
            event.rect = ref.getBoundingClientRect()
            event.rect.x = ref.offsetLeft // override
            event.rect.y = ref.offsetTop // override
            */
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

const DAMPENING_FACTOR = 50.0

const applyVectors = (eventAndRefPairs: [Event, HTMLDivElement][]) => {

    const jitter = () => {
        return (Math.random() * 4) - 2
    }

    eventAndRefPairs.forEach(([event, ref], i) => {
        (event.vectors || []).forEach((vector, i) => {
            // const bubbleA = ref
            let [otherRect, dx, dy] = vector
            if (event.rect && isOverlapping(event.rect, otherRect)) {
                // if (event.title == 'Student') {
                    //console.log(`${event.title} x ${event.rect.x} y ${event.rect.y} dx ${dx} dy ${dy}`)
                // }

                let offsetX = dx / 4
                let offsetY = dy / 16
                /*
                let dxCoefficient = dx < 0 ? -1 : 1
                let dyCoefficient = dy < 0 ? -1 : 1

                if (dx === 0) {
                    offsetX = jitter()
                } else {
                    dx = Math.abs(dx)
                    offsetX = (DAMPENING_FACTOR / (Math.min(dx, 1) ** 1.25))
                    offsetX = Math.min(offsetX, Math.abs(event.rect.width) / 4) * dxCoefficient
                }

                if (dy === 0) {
                    offsetY = jitter()
                } else {
                    dy = Math.abs(dy)
                    offsetY = (DAMPENING_FACTOR / (Math.min(dy, 1) ** 1.25))
                    offsetY = Math.min(offsetY, Math.abs(event.rect.height) / 4) * dyCoefficient
                }

                event.rect.x -= offsetX
                event.rect.y -= offsetY
                */
                event.rect.x -= offsetX
                event.rect.y -= offsetY
                event.rect.styleX -= offsetX
                event.rect.styleY -= offsetY

                // if (event.title == 'Web designer') {
                    /*
                    console.log(`${event.title} offsetX ${offsetX} event.rect.x ${event.rect.x} event.rect.width ${event.rect.width}`)
                    console.log(`${event.title} offsetY ${offsetY} event.rect.y ${event.rect.y} event.rect.height ${event.rect.height}`)
                    */
                // }
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
                // console.log(`OLD GRAPH\n${oldGraph && printGraph(oldGraph)}`)

                computeVectorMatrix(eventAndRefPairs, timelineRefs)
                applyVectors(eventAndRefPairs)

                // console.log(`NEW GRAPH\n${graph && printGraph(graph)}`)

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
            // console.log(`OLD GRAPH\n${printGraph(graph)}`)

            computeVectorMatrix(eventAndRefPairs, timelineRefs)
            applyVectors(eventAndRefPairs)

            // graph = uniqifyEventGraph(graph)
            // console.log(`NEW GRAPH\n${printGraph(graph)}`)
            if (isEqual(graph, oldGraph)) {
                console.log('Iteration done!')
            } else {
                console.log('Need more iterations!')
            }
            setGraph(graph)
        }
    }

    /*
    const e1 = [event1]
    e1[0].rect = {x: 3, y: 9, width: 11, height: 17}
    let e2 = deepCopy(e1)
    console.log(`isEqual(e1,deepCopy(e1)) ${isEqual(e1, e2)}`)
    e2 = cloneDeep(e1)
    console.log(`isEqual(e1,cloneDeep(e1)) ${isEqual(e1, e2)}`)
    e2[0].rect!.x += 2
    console.log(`e1.rect ${JSON.stringify(e1[0].rect)}`)
    console.log(`e2.rect ${JSON.stringify(e2[0].rect)}`)
    */

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
            <Timeline graph={deepCopy(twoInstancesGraph)} />
            <hr />
            <Timeline graph={deepCopy(threeInstancesGraph)} />
            <hr />
            <Timeline graph={deepCopy(mixedEventsGraph)} />
            <hr />
            */}
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
            {/*
            */}
        </React.Fragment>
    )
}

export default AppV2;
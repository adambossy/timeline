import './App.css';

import { isEqual } from 'lodash';
import React, { ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

import * as d from './Data';
import { Event, EventGraph, EventGroup, Rect, Vector } from './Data'
import deepCopy from './DeepCopy';
import VectorComponent from './components/Vector';

const YEAR_HEIGHT = 100 // Super simple way of starting
const SHOW_VECTORS = false

const BranchContext = React.createContext('');

type BubbleRefContextType = (event: Event, el: HTMLDivElement | null) => void;
const BubbleRefContext = React.createContext<BubbleRefContextType>(() => { });

type TimelineRefContextType = (el: HTMLDivElement | null) => void;
const TimelineRefContext = React.createContext<TimelineRefContextType>(() => { });


enum BubbleSide {
    RIGHT = 'right',
    LEFT = 'left',
}

interface EventRangeProps {
    event: Event,
    y?: number,
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

const monthDelta = (date1: Date, date2: Date): number => {
    const yearDiff = date2.getFullYear() - date1.getFullYear();
    const monthDiff = date2.getMonth() - date1.getMonth();
    const totalMonths = yearDiff * 12 + monthDiff;
    return totalMonths;
}

const EventRange: React.FC<EventRangeProps> = ({ event, y }) => {
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

    const styleDict = {
        height: `${monthDelta(event.startDate!, event.endDate!) * (YEAR_HEIGHT / 12)}px`,
        top: y ? `${y}px` : undefined,
    }

    return (
        <div className="event-range" ref={eventRef} style={styleDict}>
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
            return <VectorComponent boxWidth={event.rect.width} boxHeight={event.rect.height} dx={dx} dy={dy} />
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
            <h2>{event.company}</h2>
            {SHOW_VECTORS && vectors}
        </div>
    )
}

interface EventGroupProps {
    group: EventGroup;
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

const minDate = (group: EventGroup): Date => {
    const first = group[0][0] as Event
    return (first.startDate || first.date)!
}

const maxDate = (group: EventGroup): Date => {
    return new Date(Math.max(...group.map((t) => {
        const first = t[0] as Event
        return (first.endDate || first.date)!.getTime()
    })))
}

const groupHeight = (group: EventGroup): number => {
    return monthDelta(minDate(group), maxDate(group)) * (YEAR_HEIGHT / 12) + 48 // 48 = border widths + track size on either side
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
        return <EventGraphComponent graph={track} minDate={minDate(group)} />
    })

    const isLeftBranch = (i: number, length: number): boolean => {
        return i < (length / 2)
    }

    return (
        <div className="event-group">
            <div className="event-sequence-container" style={{ height: groupHeight(group) }} ref={groupRef}>
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

interface EventGraphProps {
    graph: EventGraph;
    minDate?: Date;
}

const offsetFromMinDate = (startDate: Date, minDate?: Date): number | undefined => {
    if (!minDate) {
        return undefined
    }
    const delta = monthDelta(minDate, startDate) * (YEAR_HEIGHT / 12)
    return delta
}

// NOTE: this is becoming very LinkedIn-specific I would predict.
// Assumptions:
// - There aren't N layers of recursively nested Groups, just one Group deep max
// - Group cols/sequences only have a single Event, no multi-event Tracks nested within Groups
// - The group height is based on a single layer of ranges nested in cols
const EventGraphComponent: React.FC<EventGraphProps> = ({ graph, minDate }) => {
    let nodes: JSX.Element[] = []
    let track: JSX.Element[] = []

    for (let i = 0; i < graph.length; i++) {
        const eventOrGroup = graph[i];

        if (!Array.isArray(eventOrGroup)) {
            const event = eventOrGroup as Event
            if (event.startDate) {
                track.push(<EventRange event={event} y={offsetFromMinDate(event.startDate, minDate)} />)
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

// NOTE: there are elements to this function that may be LinkedIn-specific 
export const buildGraph = (sortedEvents: Event[]): EventGraph => {
    // let graph = [[sortedEvents[0]]];
    let graph: EventGraph = []
    let cols = []
    let colMax: number | null = null
    for (let i = 0; i < sortedEvents.length; i++) {
        const e1 = sortedEvents[i]
        if (i + 1 < sortedEvents.length) {
            const e2 = sortedEvents[i + 1]
            const minA = e1.startDate && e1.startDate.getTime() || e1.date && e1.date.getTime()
            const maxA = e1.endDate && e1.endDate.getTime() || e1.date && e1.date.getTime()
            const minB = e2.startDate && e2.startDate.getTime() || e2.date && e2.date.getTime()
            const maxB = e2.endDate && e2.endDate.getTime() || e2.date && e2.date.getTime()
            
            // Do pairwise matching against sorted adjacent events, and end
            // the group once there's no more overlap with the previous event
            if (minA && maxA  && minB && maxB) {
                if (!projectionOverlaps(minA, colMax || maxA, minB, maxB)) {
                    if (cols.length) { // overlap ends, so end col
                        cols.push([e1])
                        graph.push(cols)
                        cols = []
                        colMax = null
                    } else {
                        graph.push(e1)
                    }
                } else {
                    cols.push([e1])
                    colMax = Math.max(maxA, maxB, colMax? colMax : 0)
                }
            }
        } else {
            const minA = e1.startDate && e1.startDate.getTime() || e1.date && e1.date.getTime()
            if (colMax && minA && colMax >= minA) {
                cols.push([e1])
            } else {
                graph.push(e1)
            }
        }
    }

    if (cols.length) {
        graph.push(cols)
    }

    return graph
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

        graph = buildGraph(sortedEvents)
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
            }
            console.log(`Laid out graph using ${i} iterations.`)
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

function App() {
    return (
        <React.Fragment>
            {/*
            <Timeline graph={deepCopy(d.singleInstanceGraph)} />
            <hr />
            <Timeline graph={deepCopy(d.singleInstanceGraph)} />
            <hr />
            <Timeline graph={deepCopy(d.twoInstancesGraph)} />
            <hr />
            <Timeline graph={deepCopy(d.threeInstancesGraph)} />
            <hr />
            <Timeline graph={deepCopy(d.mixedEventsGraph)} />
            <hr />
            <hr />
            <Timeline graph={deepCopy(d.collidingInstancesGraph)} />
            <hr />
            <Timeline graph={deepCopy(d.miniPyramidGraph)} />
            <hr />
            <Timeline graph={deepCopy(d.collidingInstanceAndRangeGraph)} />
            <hr />
            <Timeline graph={deepCopy(d.collidingInstanceAndRangeFlippedGraph)} />
            <hr />
            <Timeline graph={deepCopy(d.danglingEventGraph)} />
            <hr />
            <Timeline graph={deepCopy(d.medPyramidGraph)} />
            <hr />
            <hr />
            <Timeline graph={deepCopy(d.miniPyramidWeightedRightGraph)} />
            <hr />
            <Timeline graph={deepCopy(d.miniPyramidWeightedLeftGraph)} />
            <hr />
            <Timeline graph={deepCopy(d.threeColumnsGraph)} />
            <hr />
            <Timeline events={deepCopy(d.threeRangesTwoDisjointOverlappingPairs)} />
            <hr />
            <Timeline events={deepCopy(d.threeRangesOneOverlappingPair)} />
            <hr />
            <Timeline events={deepCopy(d.disjointPairOverlaps)} />
            <hr />
            */}
            <Timeline events={deepCopy(d.hangsLinkedIn)} />
            <hr />
            <Timeline events={deepCopy(d.adamsLinkedIn)} />
            <hr />
            <Timeline events={deepCopy(d.sergiosLinkedIn)} />
            <hr />
            {/*
            <Timeline graph={deepCopy(d.largePyramidGraph)} />
            <hr />
            */}
        </React.Fragment>
    )
}

export default App;
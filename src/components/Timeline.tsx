import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useState } from "react";
import { Event, EventGraph, Rect, Vector } from "../Data";
import deepCopy from "../DeepCopy";
import EventGraphComponent from "./EventGraph";
import { BubbleRefContext, TimelineRefContext } from "./contexts";

export const projectionOverlaps = (minA: number, maxA: number, minB: number, maxB: number) => {
    return maxA >= minB && maxB >= minA
}

export const isOverlapping = (rectA: Rect, rectB: Rect) => {
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

interface TimelineProps {
    events?: Event[];
    graph?: EventGraph;
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

export default Timeline
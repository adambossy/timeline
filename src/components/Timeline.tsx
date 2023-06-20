import { isEqual } from 'lodash';
import React, { useCallback, useEffect, useState } from "react";
import { buildGraph } from "../App";
import { Event, EventGraph, Rect, Vector } from "../Data";
import deepCopy from "../DeepCopy";
import { isOverlapping } from "../util/Overlap";
import EventGraphComponent from "./EventGraph";
import { BubbleRefContext, TimelineRefContext } from "./contexts";

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
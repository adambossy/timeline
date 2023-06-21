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
    return {
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

    // Set up empty vector matrix and create usable data instances from DOM nodes if its the first run
    eventAndRefPairs.forEach(([event, ref], i) => {
        vectorMatrix.push([])
        event.vectors = vectorMatrix[i] // reset vectors
        if (!event.rect) {
            event.rect = rectFromRef(ref)
        }
    })

    for (let i = 0; i < eventAndRefPairs.length; i++) {
        const [eventA, _] = eventAndRefPairs[i]

        // Compute vectors between each pair of events
        for (let j = i + 1; j < eventAndRefPairs.length; j++) {
            const [eventB, _] = eventAndRefPairs[j]
            if (eventA.rect && eventB.rect && eventA.vectors && eventB.vectors) {
                const dx = centerX(eventB.rect) - centerX(eventA.rect)
                const dy = centerY(eventB.rect) - centerY(eventA.rect)
                eventA.vectors.push([eventB.rect, dx, dy])
                eventB.vectors.push([eventA.rect, -dx, -dy])
            }
        }

        // Compute vectors between events and event track DOM objects
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

    // Once vectors are computed, apply them to DOM nodes to separate events from each other
    eventAndRefPairs.forEach(([event, ref], i) => {
        (event.vectors || []).forEach((vector, i) => {
            let [otherRect, dx, dy] = vector
            if (event.rect && isOverlapping(event.rect, otherRect)) {
                let offsetX = dx / 4  // MAGIC NUMBER ALERT - constant used as a fudge factor to determine how forcefully event objects repel from one another
                let offsetY = dy / 16 // MAGIC NUMBER ALERT - slower constant for vertical than horizontal to bias toward making everything fit on a screen

                event.rect.x -= offsetX
                event.rect.y -= offsetY
                event.rect.styleX -= offsetX
                event.rect.styleY -= offsetY
            }
        })
    })
}

// This function is primarily intended to take a list of jobs (or "events" in
// the parlance of this app) that are scraped from an individual's LinkedIn
// profile. The events may or may not overlap with one another. This function
// will find subsequent runs of events that have overlapping dates and create an
// EventGraph that the Timeline can process and render.
export const buildGraph = (sortedEvents: Event[]): EventGraph => {
    let graph: EventGraph = []

    // Events in `group` are what appear as parallel event tracks in the final
    // graph
    let group = []
    let maxTimeInGroup: number | null = null
    for (let i = 0; i < sortedEvents.length; i++) {
        const e1 = sortedEvents[i]

        // This function iterates through pairs of sorted adjacent events,
        // identifying whether two adjacent events should be grouped. If a group
        // already exists from a previous iteration, we determine whether to
        // include the next event in the active group.
        if (i + 1 < sortedEvents.length) {
            const e2 = sortedEvents[i + 1]
            const minA = e1.startDate?.getTime() || e1.date?.getTime()
            const maxA = e1.endDate?.getTime() || e1.date?.getTime()
            const minB = e2.startDate?.getTime() || e2.date?.getTime()
            const maxB = e2.endDate?.getTime() || e2.date?.getTime()

            // Do pairwise matching against sorted adjacent events, and end
            // the group once there's no more overlap with the previous event
            if (minA && maxA && minB && maxB) {
                if (!projectionOverlaps(minA, maxTimeInGroup || maxA, minB, maxB)) {

                    // If there is no overlap and the `group` array has events,
                    // push the array of overlapping events to the graph and
                    // reset the `group` array. Otherwise, just push the event
                    // directly to the main graph
                    if (group.length) {
                        group.push([e1])
                        graph.push(group)
                        group = []
                        maxTimeInGroup = null
                    } else {
                        graph.push(e1)
                    }
                } else {
                    // If e1 and e2 overlap, add e1 to the `group` array. We'll
                    // defer pushing e2 to a later loop
                    //
                    // Update the maxTimeInGroup to contain the new maxDate. Sometimes,
                    // the max date is set by e1 instead of e2
                    group.push([e1])
                    maxTimeInGroup = Math.max(maxA, maxB, maxTimeInGroup ?? 0)
                }
            }
        } else {

            // Treat the last event in the sequence as a special case. First
            // this event, only startDate (or date) is relevant for the overlap
            // calculation
            const minA = e1.startDate?.getTime() || e1.date?.getTime()

            // Determine whether to push the last event to the previous group or
            // directly to the main graph
            if (maxTimeInGroup && minA && maxTimeInGroup >= minA) {
                group.push([e1])
            } else {
                graph.push(e1)
            }
        }
    }

    // If `group` is dangling, make sure it gets attached to the graph
    if (group.length) {
        graph.push(group)
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
            setGraph(graph)
            setRenderedOnce(true)
        }
    })

    const step = () => {
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
import './App.css';

import React from 'react';

import * as d from './Data';
import { Event, EventGraph, EventGroup } from './Data';
import deepCopy from './DeepCopy';
import Timeline from './components/Timeline';
import { projectionOverlaps } from './util/Overlap';

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
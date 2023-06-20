import { Event, EventGraph, EventGroup } from "../Data";

export const printGraph = (graph: EventGraph, indent: number = 4): string => {

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
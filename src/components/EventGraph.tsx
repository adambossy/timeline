import React from 'react';

import { YEAR_HEIGHT } from '../constants';
import { Event, EventGraph, EventGroup } from '../Data';
import { monthDelta } from '../util/Date';
import EventGroupComponent from './EventGroup';
import EventInstance from './EventInstance';
import EventRange from './EventRange';
import EventTrack from './EventTrack';

const offsetFromMinDate = (startDate: Date, minDate?: Date): number | undefined => {
    if (!minDate) {
        return undefined
    }
    const delta = monthDelta(minDate, startDate) * (YEAR_HEIGHT / 12)
    return delta
}

interface EventGraphProps {
    graph: EventGraph;
    minDate?: Date;
}

// NOTE: this is becoming very LinkedIn-specific. Assumptions:
// - There aren't N layers of recursively nested Groups, just one Group deep max
// - Group cols/sequences only have a single Event, no multi-event Tracks nested
//   within Groups
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

export default EventGraphComponent
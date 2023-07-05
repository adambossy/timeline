import React, { useContext, useEffect, useRef } from 'react';

import { BubbleSide, YEAR_HEIGHT } from '../constants';
import { Event, EventGroup } from '../Data';
import { monthDelta } from '../util/Date';
import { BranchContext, TimelineRefContext } from './contexts';
import EventGraphComponent from './EventGraph';

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

interface EventGroupProps {
    group: EventGroup;
}

const EventGroupComponent: React.FC<EventGroupProps> = ({ group }) => {
    const context = useContext(BranchContext);

    // TODO this should probably be moved to EventTrack, which is the most
    // pervasive element in the timeline and therefore we could do it once with
    // just that element
    const groupRef = useRef<HTMLDivElement | null>(null);
    const addTimelineRef = useContext(TimelineRefContext);

    useEffect(() => {
        console.log('EventGroup::useEffect')

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

export default EventGroupComponent
import React from 'react';
import { Event } from '../Data';

export const BranchContext = React.createContext('');

type BubbleRefContextType = (event: Event, el: HTMLDivElement | null) => void;
export const BubbleRefContext = React.createContext<BubbleRefContextType>(() => { });

type TimelineRefContextType = (el: HTMLDivElement | null) => void;
export const TimelineRefContext = React.createContext<TimelineRefContextType>(() => { });


import './App.css';

import React from 'react';

import * as d from './Data';
import deepCopy from './DeepCopy';
import Timeline from './components/Timeline';

function App() {
    return (
        <React.Fragment>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
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
            <Timeline graph={deepCopy(d.largePyramidGraph)} />
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
            */}
        </React.Fragment>
    )
}

export default App;
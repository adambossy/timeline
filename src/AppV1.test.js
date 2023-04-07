import { render, screen } from '@testing-library/react';
import { buildGraph } from './AppV2'
import {
    singleInstance,
    singleInstanceGraph,
    twoInstances,
    twoInstancesGraph,
    collidingInstances,
    collidingInstancesGraph,
    miniPyramid,
    miniPyramidGraph,
    threeRangesTwoDisjointOverlappingPairs,
    threeRangesTwoDisjointOverlappingPairsGraph
} from './Data';

describe('builds graphs correctly', () => {
    it('single instance', () => {
        const g = buildGraph(singleInstance); // call the function with inputs
        expect(g).toEqual(singleInstanceGraph); // assert that the output is correct
    });

    it('two instances', () => {
        const graph = buildGraph(twoInstances); // call the function with inputs
        expect(graph).toEqual(twoInstancesGraph); // assert that the output is correct
    });

    it('colliding instances', () => {
        const graph = buildGraph(collidingInstances); // call the function with inputs
        expect(graph).toEqual(collidingInstancesGraph); // assert that the output is correct
    });

    it('mini pyramid', () => {
        const graph = buildGraph(miniPyramid); // call the function with inputs
        expect(graph).toEqual(miniPyramidGraph); // assert that the output is correct
    });

    it('three ranges two disjoint overlapping pairs', () => {
        const graph = buildGraph(threeRangesTwoDisjointOverlappingPairs); // call the function with inputs
        expect(graph).toEqual(threeRangesTwoDisjointOverlappingPairsGraph); // assert that the output is correct
    });
});
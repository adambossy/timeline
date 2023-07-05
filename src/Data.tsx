export const TODAY = new Date()


export type Vector = [
    other: Rect,
    dx: number,
    dy: number,
];

export interface Rect {
    x: number,
    y: number,
    styleX: number, // relative to parent, used for style: left
    styleY: number, // relative to parent, used for style: top
    width: number,
    height: number,
}

export interface Event {
    title: string,
    company?: string,
    location?: string,
    date?: Date,
    startDate?: Date,
    endDate?: Date,
    rect?: Rect,
    vectors?: Vector[],
    id?: number, // debugging HACK
}


export type EventGroup = EventGraph[];
export type EventGraph = (Event | EventGroup)[];


export const event1: Event = {
    title: "Grill master",
    date: new Date("2010-01-01"),
}


export const event1a: Event = {
    title: "Dishwasher",
    date: new Date("2010-01-01"),
}

export const event2: Event = {
    title: "Smoothie maker",
    date: new Date("2011-01-01"),
}

export const event2a: Event = {
    title: "Smoothie machine cleaner",
    date: new Date("2011-01-01"),
}

export const event3: Event = {
    title: "Web designer",
    date: new Date("2012-01-01"),
}

export const event4: Event = {
    title: "Software engineer",
    date: new Date("2013-01-01"),
}

export const event4a: Event = {
    title: "Software engineering advisor",
    date: new Date("2013-01-01"),
}

export const event5: Event = {
    title: "Founder",
    date: new Date("2014-01-01"),
}

export const group1: EventGroup = [
    [
        event1,
    ],
    [
        event2,
    ]
]

export const range1: Event = {
    title: "Student",
    startDate: new Date("2010-01-01"),
    endDate: new Date("2010-03-01"),
}

export const range2: Event = {
    title: "Grad Student",
    startDate: new Date("2013-01-01"),
    endDate: new Date("2016-03-01"),
}

export const group2: EventGroup = [
    [
        event1,
    ],
    [
        range1,
    ]
]

export const singleInstance: Event[] = [
    event1,
]

export const singleInstanceGraph: EventGraph = [
    event1,
]

export const singleRange: Event[] = [
    range1,
]

export const twoInstances: Event[] = [
    event1,
    event2,
]

export const twoInstancesGraph: EventGraph = [
    event1,
    event2,
]

export const threeInstancesGraph: EventGraph = [
    event1,
    event2,
    event3,
]

export const mixedEventsGraph: EventGraph = [
    event1,
    range1,
    event2,
]

export const collidingInstances: Event[] = [
    event1,
    event1a,
]

export const collidingInstancesGraph: EventGraph = [
    [
        [
            event1,
        ],
        [
            event1a,
        ]
    ]
]

export const miniPyramid: Event[] = [
    event1,
    event2,
    event2a,
]

export const miniPyramidGraph: EventGraph = [
    event1,
    [
        [
            event2,
        ],
        [
            event2a,
        ]
    ]
]

export const medPyramid: Event[] = [
    event1,
    event2,
    event2a,
    event3,
    event4,
    event4a,
]

export const medPyramidGraph: EventGraph = [
    [
        [
            event1,
            [
                [
                    event2,
                ],
                [
                    event2a,
                ]
            ]
        ],
        [
            event3,
            [
                [
                    event4,
                ],
                [
                    event4a,
                ]
            ]
        ]
    ]
]

export const nestedGroup1: EventGroup = [
    [
        event1,
        [
            [
                event1a,
            ],
            [
                event2,
            ]
        ]
    ],
    [
        event3,
        [
            [
                event4,
            ],
            [
                event5,
            ]
        ]
    ]
]

export const nestedGroup2: EventGroup = [
    [
        event1,
        group1,
        nestedGroup1,
    ],
    [
        event1,
        group1,
        nestedGroup1,
    ]
]

export const largePyramidGraph: EventGraph = [
    nestedGroup2
]

export const collidingInstanceAndRange: Event[] = [
    range1,
    event2,
]

export const collidingInstanceAndRangeGraph: EventGraph = [
    event3,
    group2,
]

export const group2a: EventGroup = [
    [
        event1,
        [
            [
                event1,
            ],
            [
                range1,
            ]
        ]
    ],
    [
        range1,
    ]
]

export const miniPyramidWeightedLeftGraph: EventGraph = [
    event1,
    group2a,
]

export const group2b: EventGroup = [
    [
        range1,
    ],
    [
        event1a,
        [
            [
                event2,
            ],
            [
                range2,
            ]
        ]
    ]
]

export const miniPyramidWeightedRightGraph: EventGraph = [
    event1,
    group2b,
]

export const group3: EventGroup = [
    [
        range1,
    ],
    [
        event1,
    ]
]

export const collidingInstanceAndRangeFlippedGraph: EventGraph = [
    group3,
]

export const danglingEventGraph: EventGraph = [
    group1,
    event1
]

export const threeColumnsGraph: EventGraph = [
    [
        [
            event1
        ],
        [
            event2,
        ],
        [
            range1,
        ]
    ]
]

export const range3: Event = {
    title: "Range 3",
    startDate: new Date(2010, 0),
    endDate: new Date(2011, 0),
}

export const range4: Event = {
    title: "Range 4",
    startDate: new Date(2010, 6),
    endDate: new Date(2012, 6),
}

export const range5: Event = {
    title: "Range 5",
    startDate: new Date(2012, 1),
    endDate: new Date(2013, 1),
}

export const threeRangesTwoDisjointOverlappingPairs: Event[] = [
    range3,
    range4,
    range5
]

export const threeRangesTwoDisjointOverlappingPairsGraph: EventGraph = [
    [
        [
            range3
        ],
        [
            range4,
        ],
        [
            range5
        ]
    ]
]

export const range4a: Event = {
    title: "Range 4a",
    startDate: new Date(2010, 6),
    endDate: new Date(2012, 1),
}

export const range5a: Event = {
    title: "Range 5a",
    startDate: new Date(2012, 6),
    endDate: new Date(2013, 1),
}

export const threeRangesOneOverlappingPair: Event[] = [
    range3,
    range4a,
    range5a
]

export const threeRangesOneOverlappingPairsGraph: EventGraph = [
    [
        [
            range3
        ],
        [
            range4a
        ],
    ],
    range5a
]

export const range3b: Event = {
    title: "Range 3b",
    startDate: new Date(2010, 0),
    endDate: new Date(2012, 6),
}

export const range4b: Event = {
    title: "Range 4b",
    startDate: new Date(2010, 6),
    endDate: new Date(2011, 6),
}

export const range5b: Event = {
    title: "Range 5b",
    startDate: new Date(2012, 1),
    endDate: new Date(2013, 1),
}

export const disjointPairOverlaps: Event[] = [
    range3b,
    range4b,
    range5b
]

export const disjointPairOverlapsGraph: EventGraph = [
    [
        [
            range3b
        ],
        [
            range4b,
        ],
        [
            range5b
        ]
    ]
]

export const adamsLinkedIn: Event[] = [
    {
        title: "Founder",
        company: "Building Something New",
        startDate: new Date(2022, 9),
        endDate: TODAY,
        location: "Brooklyn, New York, United States",
    },
    {
        title: "Senior Engineering Manager",
        company: "Affirm",
        startDate: new Date(2019, 0),
        endDate: new Date(2022, 9),
        location: "New York, New York, United States",
    },
    {
        title: "Engineering Manager",
        company: "Patreon",
        startDate: new Date(2016, 0),
        endDate: new Date(2018, 10),
        location: "San Francisco Bay Area",
    },
    {
        title: "Student",
        company: "Of Life",
        startDate: new Date(2014, 7),
        endDate: new Date(2015, 11),
        location: "Travel, reflection, relaxation, personal growth.",
    },
    {
        title: "Member of Technical Staff",
        company: "Shopkick",
        startDate: new Date(2011, 1),
        endDate: new Date(2014, 6),
        location: "Palo Alto, CA",
    },
    {
        title: "Co-Founder",
        company: "Topsicle",
        startDate: new Date(2009, 6),
        endDate: new Date(2010, 9),
        location: "Palo Alto, CA",
    },
    {
        title: "Software Engineer",
        company: "IBM",
        startDate: new Date(2008, 6),
        endDate: new Date(2009, 6),
        location: "San Jose, CA",
    },
    {
        title: "Research Assistant",
        company: "UT Knowledge Systems Group",
        startDate: new Date(2008, 0),
        endDate: new Date(2008, 4),
        location: "Austin, TX",
    },
    {
        title: "Extreme Blue Intern",
        company: "IBM",
        startDate: new Date(2007, 4),
        endDate: new Date(2007, 7),
        location: "San Jose, CA",
    },
    {
        title: "Software Development Intern",
        company: "ResortQuest",
        startDate: new Date(2006, 4),
        endDate: new Date(2007, 3),
        location: "Broomfield, CO",
    },
]


export const adamsGraph: EventGraph = [
    {
        title: "Founder",
        startDate: new Date(2022, 9),
        endDate: TODAY,
    },
    {
        title: "Senior Engineering Manager",
        startDate: new Date(2019, 0),
        endDate: new Date(2022, 9),
    },
    {
        title: "Engineering Manager",
        startDate: new Date(2016, 0),
        endDate: new Date(2018, 10),
    },
    {
        title: "Student",
        startDate: new Date(2014, 7),
        endDate: new Date(2015, 11),
    },
    {
        title: "Member of Technical Staff",
        startDate: new Date(2011, 1),
        endDate: new Date(2014, 7),
    }
];

/*
Gen'ed with the following GPT-4 prompt:

please enumerate all the positions listed in the text below. output it as a javascript array of objects. the nested objects contains dictionaries with the following fields: 'title', 'company', 'startDate', 'endDate', 'location'. don't put the key names in quotes. dates should be defined as Date() objects with arguments for year and month being passed. here's an example:

    {
        title: "Engineering Manager",
        company: "Apple, Inc.",
        startDate: new Date(2016, 0),
        endDate: new Date(2018, 10),
        location: "Cupertino, CA",
    },

*/

export const hangsLinkedIn: Event[] = [
    {
        title: "PHD Candidate",
        company: "UNSW",
        startDate: new Date(2020, 4),
        endDate: TODAY,
        location: "Sydney, New South Wales, Australia"
    },
    {
        title: "Head of Business Development",
        company: "Electric8",
        startDate: new Date(2020, 0),
        endDate: new Date(2020, 2),
        location: "Singapore, Singapore"
    },
    {
        title: "Head of Growth",
        company: "South China Morning Post SCMP",
        startDate: new Date(2018, 9),
        endDate: new Date(2019, 7),
        location: "Hong Kong"
    },
    {
        title: "Tech Analyst & Content Marketer",
        company: "Reforge",
        startDate: new Date(2017, 6),
        endDate: new Date(2018, 2),
        location: "San Francisco Bay Area"
    },
    {
        title: "Founder",
        company: "Bumblebee Consulting",
        startDate: new Date(2013, 0),
        endDate: new Date(2017, 0),
        location: "San Francisco Bay Area"
    },
    {
        title: "Founder",
        company: "Plentiful",
        startDate: new Date(2015, 0),
        endDate: new Date(2015, 11),
        location: "San Francisco Bay Area"
    },
    {
        title: "Chief Operating Officer",
        company: "Juniper, Inc",
        startDate: new Date(2012, 0),
        endDate: new Date(2013, 11),
        location: "San Francisco Bay Area"
    },
    {
        title: "Founder",
        company: "Product Design Guild",
        startDate: new Date(2010, 0),
        endDate: new Date(2013, 0),
        location: "San Francisco Bay Area"
    },
    {
        title: "Social Designer",
        company: "Peel",
        startDate: new Date(2010, 8),
        endDate: new Date(2010, 11),
    },
    {
        title: "Founder",
        company: "Bumblebee Labs",
        startDate: new Date(2008, 0),
        endDate: new Date(2010, 0),
    },
    {
        title: "Research Assistant",
        company: "FEMA",
        startDate: new Date(2007, 8),
        endDate: new Date(2008, 5),
    },
    {
        title: "PhD Student",
        company: "NICTA",
        startDate: new Date(2005, 0),
        endDate: new Date(2006, 0),
    }
]



export const hangsGraph: EventGraph = [
    [
        [
            {
                title: "Founder - Bumblebee Consulting",
                startDate: new Date(2013, 0),
                endDate: new Date(2017, 0),
            },
        ],
        [
            {
                title: "Founder - Plentiful",
                startDate: new Date(2015, 0),
                endDate: new Date(2016, 0),
            },
        ],
    ],
    [
        [
            {
                title: "Chief Operating Offer - Juniper",
                startDate: new Date(2012, 0),
                endDate: new Date(2013, 0),
            },
        ],
        [
            {
                title: "Founder - Product Design Guild",
                startDate: new Date(2010, 0),
                endDate: new Date(2013, 0),
            },
        ],
        [
            {
                title: "Social Designer - Peel",
                startDate: new Date(2010, 8),
                endDate: new Date(2010, 11),
            },
        ],
    ],
]

export const sergiosLinkedIn: Event[] = [
    {
        title: 'Chief Technology Officer',
        company: 'Bulk MRO Industrial Supply',
        startDate: new Date(2022, 0),
        endDate: TODAY,
        location: 'New York, United States'
    },
    {
        title: 'Fractional CTO | Tech Consultant & Advisor',
        company: 'SergioPereira.io',
        startDate: new Date(2017, 0),
        endDate: TODAY,
        location: 'Unknown'
    },
    {
        title: 'Content Creator & Public Speaker',
        company: '',
        startDate: new Date(2018, 0),
        endDate: TODAY,
        location: 'Unknown'
    },
    {
        title: 'Founder',
        company: 'Remote Work Academy',
        startDate: new Date(2022, 7),
        endDate: TODAY,
        location: 'Unknown'
    },
    {
        title: 'Co Author',
        company: 'The CYCLES Book',
        startDate: new Date(2018, 0),
        endDate: TODAY,
        location: 'Unknown'
    },
    {
        title: 'Fractional CTO',
        company: 'Signature Lacrosse',
        startDate: new Date(2021, 9),
        endDate: new Date(2022, 1),
        location: 'Tampa, Florida, United States'
    },
    {
        title: 'Co-Founder & CTO',
        company: 'StudentFinance',
        startDate: new Date(2019, 0),
        endDate: new Date(2021, 10),
        location: 'London, England, United Kingdom'
    },
    {
        title: 'Co-Founder & CTO',
        company: 'Tech HQ',
        startDate: new Date(2018, 2),
        endDate: new Date(2020, 5),
        location: 'London, United Kingdom'
    },
    {
        title: 'Fractional CTO',
        company: 'Rightfoot · Part-time',
        startDate: new Date(2019, 9),
        endDate: new Date(2019, 11),
        location: 'San Francisco Bay Area'
    },
    {
        title: 'Fractional Technical Product Manager',
        company: 'DeepCode (The Software Revolution) by Snyk.io · Part-time',
        startDate: new Date(2018, 10),
        endDate: new Date(2019, 9),
        location: 'Zurich, Switzerland'
    },
    {
        title: 'Fractional CTO',
        company: 'Paybyrd',
        startDate: new Date(2019, 2),
        endDate: new Date(2019, 8),
        location: 'Amsterdam, North Holland, Netherlands'
    },
]

/*
export const sergiosGraph: EventGraph = [
    [
        [
            {
                title: "Chief Technology Offer",
                startDate: new Date(2022, 0),
                endDate: TODAY,
            },
        ],
        [
            [
                [
                    {
                        title: "Fractional CTO | Tech Consultant & Advisor",
                        startDate: new Date(2017, 0),
                        endDate: TODAY,
                    },
                ],
                [
                    {
                        title: "Content Creator & Public Speaker",
                        startDate: new Date(2018, 0),
                        endDate: TODAY,
                    },
                ],
            ]
        ],
        [
            {
                title: "Founder",
                startDate: new Date(2022, 7),
                endDate: TODAY,
            },
        ],
    ]
];
*/
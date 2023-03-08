import React, { forwardRef, useEffect, useRef, useState } from 'react'
import './App.css';

interface VectorProps {
    width: number;
    height: number;
    dx: number;
    dy: number;
}

type VectorType = [
    otherBox: BoxType,
    dx: number,
    dy: number
]

interface BoxType {
    width?: number | null;
    height?: number | null;
    vectors: VectorType[] | null;
    x?: number | null;
    y?: number | null;
    e?: Event | null; // for debugging
}

interface Event {
    name: string;
    image: string;
    date: Date;
    box: BoxType;
}

interface BoxProps {
    e: Event
}

interface State {
    events: Event[];
}

const state: State = {
    events: [
        {
            name: "Was born",
            image: "birth.png",
            date: new Date("2016-01-01"), // TEMP - remove
            // startDate: "2016-01-07",
            // endDate: "2018-11-09",
            box: {
                vectors: []
            }
        },
        {
            name: "First communion",
            image: "first_communion.png",
            date: new Date("2016-02-01"),
            box: {
                vectors: []
            }
        },
        {
            name: "Started school",
            image: "foo",
            date: new Date("2016-04-01"),
            box: {
                vectors: []
            }
        },
        /*
        {
            name: "Graduated college",
            image: "college.png",
            date: new Date("2016-05-01"),
            box: {
                vectors: []
            }
        },
        {
            name: "Got married",
            image: "married.png",
            date: new Date("2016-06-01"),
            box: {
                vectors: []
            }
        },
        */
    ],
};


function App() {
    const startDate = new Date("January 1, 2016");
    const endDate = new Date("December, 2018");

    state.events.sort((a, b) => {
        const dateA = a.date
        const dateB = b.date
        if (dateA < dateB) {
            return -1
        } else if (dateB < dateA) {
            return 1
        } else {
            return 0
        }
    })

    return (
        <div className="App">
            <Timeline
                eventsData={state.events}
                startDate={startDate}
                endDate={endDate}
            />
        </div>
    );
}

const Vector: React.FC<VectorProps> = ({ width, height, dx, dy }) => {
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const length = Math.sqrt(dx * dx + dy * dy)

    const vectorStyle = {
        left: ((width - length) / 2) + "px",
        top: (height / 2 - 5) + "px",  // MAGIC NUMBER ALERT .point border-top-width
        width: length + "px",
        Transform: "rotate(" + angle + "deg)",
        WebkitTransform: "rotate(" + angle + "deg)"
    }
    const lineStyle = {
        marginLeft: length / 2 + "px",
        width: Math.max(0, length / 2 - 16) + "px" // MAGIC NUMBER ALERT .point border-left-width
    }
    return (
        <div className="Vector" style={vectorStyle} /*ref={el => vectorRefs[j] = el}*/>
            <div className="Vector-stem" style={lineStyle}></div>
            <div className="Vector-point"></div>
        </div>
    )
}

const Box = forwardRef<HTMLDivElement, BoxProps>((props, ref) => {
    const { e } = props
    const box = e.box // convenience
    box.e = e // backref for debugging

    let vectors: JSX.Element[] = [] 
    box.vectors.forEach((vector, j) => {
        const [otherBox, dx, dy] = vector
        vectors.push(
            <Vector key={j} width={box.width} height={box.height} dx={dx} dy={dy} />
        )
    })

    const formattedDate = (date: Date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return `${months[date.getMonth()]} ${date.getFullYear()}`
    }

    return (
        <div className="Timeline-event" ref={ref} style={{ top: box.y, left: box.x }}>
            <>
                <div className="Timeline-event-name">{e.name}</div>
                <div className="Timeline-event-date">{formattedDate(e.date)}</div>
                {vectors}
            </>
        </div>
    )
})

interface TimelineProps {
    eventsData: Event[];
    startDate: Date;
    endDate: Date;
}

const Timeline: React.FC<TimelineProps> = ({
    eventsData,
    startDate,
    endDate,
  }) => {
    const [events, setEvents] = useState(eventsData)
    const [renderedOnce, setRenderedOnce] = useState(false)
    const eventRefs = useRef([])
    const timelineRef = useRef(null)

    const dayDiff = (dateFrom: Date, dateTo: Date) => {
        const diffTime: number = Math.abs(dateTo.getTime() - dateFrom.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const totalDays = (startDate: Date, endDate: Date) => {
        return dayDiff(startDate, endDate)
    }

    useEffect(() => {
        if (!renderedOnce) {
            let width = timelineRef.current.clientWidth
            let height = timelineRef.current.clientHeight
            events.forEach((e, i) => {
                const box = e.box // convenience
                const ref = eventRefs.current[i]
                box.width = ref.clientWidth
                box.height = ref.clientHeight
                box.x = (width / 2) + (Math.random() * 200) - 100 - (box.width / 2)

                const days = dayDiff(startDate, e.date)
                box.y = (days / totalDays(startDate, endDate)) * height
            })
            computeVectors()
            const eventsCopy = [...events]
            setEvents(eventsCopy)
            setRenderedOnce(true)
        }
    })

    const projectionOverlaps = (minA: number, maxA: number, minB: number, maxB: number) => {
        return maxA >= minB && maxB >= minA
    }

    const isOverlapping = (boxA: BoxType, boxB: BoxType) => {
        return projectionOverlaps(boxA.x, boxA.x + boxA.width, boxB.x, boxB.x + boxB.width) &&
            projectionOverlaps(boxA.y, boxA.y + boxA.height, boxB.y, boxB.y + boxB.height)
    }

    // TODO add this to the event state prototype?
    const centerX = (box: BoxType) => {
        return box.x + (box.width / 2);
    }

    const centerY = (box: BoxType) => {
        return box.y + (box.height / 2);
    }

    const computeVectors = () => {
        events.map((e, i) => {
            const box = e.box // convenience
            if (!box.x) {
                throw new Error("x is undefined for box " + e.name)
            }
            if (!box.y) {
                throw new Error("y is undefined for box " + e.name)
            }
            if (!box.width) {
                throw new Error("width is undefined for box " + e.name)
            }
            if (!box.height) {
                throw new Error("height is undefined for box " + e.name)
            }
            events.map((otherE, j) => {
                const otherBox = otherE.box // convenience
                if (isOverlapping(box, otherBox)) {
                    if (i === j) {
                        return otherBox
                    }
                    const dx = centerX(otherBox) - centerX(box)
                    const dy = centerY(otherBox) - centerY(box)
                    box.vectors[j] = [otherBox, dx, dy]
                    otherBox.vectors[i] = [box, -dx, -dy]
                }
                return otherBox
            })
            return box
        })
    }

    const applyVectors = () => {
        events.forEach((e, i) => {
            e.box.vectors.forEach((vector, j) => {
                const [otherBox, dx, dy] = vector
                // TODO fix up naming inconsistencies
                if (isOverlapping(e.box, otherBox)) {
                    console.log("overlap btwn " + e.name + " and " + otherBox.e.name)
                    e.box.x -= dx / 2
                    e.box.y -= dy / 2
                    // otherBox.x += dx / 2
                    // otherBox.y += dy / 2
                }
            })
        })
    }

    const step = () => {
        applyVectors()
        const eventsCopy = [...events]
        setEvents(eventsCopy)
    }

    return (
        <div className="Timeline" key="timeline">
            <button className="Timeline-step" onClick={step}>
                Step
            </button>
            <div className="Timeline-container" ref={timelineRef}>
                {events.map((e, i) => {
                    return <Box e={e} key={i} ref={el => eventRefs.current[i] = el} />
                })}
            </div>
        </div>
    )
}

export default App;

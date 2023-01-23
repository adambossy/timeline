import React, { Component, useEffect, useRef, useState } from 'react'
import './App.css';

const state = {
    events: [
        {
            name: "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum ",
            image: "patreon_logo.png",
            date: new Date("2016-01-01"), // TEMP - remove
            startDate: "2016-01-07",
            endDate: "2018-11-09",
			// unflatten these at some point (turn `events` into `boxes` and stuff event data into `event` val)
			vectors: []
        },
        {
            name: "Mendozada",
            image: "mendozada_2016.png",
            date: new Date("2016-02-01"),
			vectors: []
        },
        /*
        {
            name: "Event designed to collide with Camp Grounded",
            image: "foo",
            date: new Date("2016-05-01"),
        },
        {
            name: "Camp Grounded",
            image: "camp_grounded.png",
            date: new Date("2016-05-01"),
        },
        {
            name: "Camp Grounded NYC",
            image: "camp_grounded.png",
            date: new Date("2016-06-01"),
        },
        {
            name: "Hot New Event",
            image: "camp_grounded.png",
            date: new Date("2017-01-01"),
        }
        */
    ],
};

function computeTicks(startDate, endDate, interval) {
    const months = monthDiff(startDate, endDate);
    const ticks = months / interval;
    return Math.round(ticks);
}

class EventBox {
    constructor(event, x, y, width, height) {
        this.event = event
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.isOverlapping = false
        this.vectors = []
    }

    centerX = () => {
        return this.x + (this.width / 2);
    }

    centerY = () => {
        return this.y + (this.height / 2);
    }
}

// TODO generalize to support both horizontal and vertical
class SimpleVerticalTimeline {

    margin = 10

    projectionOverlaps(minA, maxA, minB, maxB) {
        return maxA >= minB && maxB >= minA
    }

    isOverlapping(boxA, boxB) {
        return this.projectionOverlaps(boxA.x, boxA.x + boxA.width, boxB.x, boxB.x + boxB.width) &&
            this.projectionOverlaps(boxA.y, boxA.y + boxA.height, boxB.y, boxB.y + boxB.height)
    }

    totalDays(startDate, endDate) {
        return this.dayDiff(startDate, endDate)
    }

    dayDiff(dateFrom, dateTo) {
        const diffTime = Math.abs(dateTo - dateFrom);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    }

    create(eventBoxes, startDate, endDate, canvasHeight) {
        let lastBox
        const totalDays = this.totalDays(startDate, endDate)
        return eventBoxes.map((b, i) => {
            const days = this.dayDiff(startDate, b.event.date)
            b.y = (days / totalDays) * canvasHeight

            if (lastBox && 
                this.projectionOverlaps(
                    lastBox.y,
                    lastBox.y + lastBox.height + this.margin,
                    b.y,
                    b.y + b.height + this.margin)) {
                b.x = lastBox.x + lastBox.width + this.margin
            }

            lastBox = b
            return b
        });
    }
}


function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() +
   (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}

function App() {
    const startDate = new Date("January 1, 2016");
    const endDate = new Date("December, 2018");
    const interval = 3 // number of months per "tick"
    const canvasHeight = 1500;

    const eventRefs = useRef([]);
    let eventBoxes;

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

    // HACK
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    return (
        <div className="App">
            <Timeline
                eventsData={state.events}
                startDate={startDate}
                endDate={endDate}
                canvasHeight={canvasHeight}
                interval={interval}
                />
        </div>
    );
}


class SimpleIterativeTimeline {

    // TODO pull into utils
    dayDiff(dateFrom, dateTo) {
        const diffTime = Math.abs(dateTo - dateFrom);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    }

    constructor(events, startDate, endDate, canvasHeight) {
    }

    projectionOverlaps(minA, maxA, minB, maxB) {
        return maxA >= minB && maxB >= minA
    }

    isOverlapping(boxA, boxB) {
        return this.projectionOverlaps(boxA.x, boxA.x + boxA.width, boxB.x, boxB.x + boxB.width) &&
            this.projectionOverlaps(boxA.y, boxA.y + boxA.height, boxB.y, boxB.y + boxB.height)
    }

    step() {
		this.boxes.map((boxA, i) => {
			this.boxes.map((boxB, j) => {
				// Compute vectors
				if (this.isOverlapping(boxA, boxB)) {
					if (i == j) {
						return
					}
					const dx = boxB.centerX() - boxA.centerX()
					const dy = boxB.centerY() - boxA.centerY()
					boxA.vectors[j] = [dx, dy]
					console.log("boxA.vectors[" + j + "] " + dx + ", " + dy)
					boxB.vectors[i] = [-dx, -dy]
					console.log("boxB.vectors[" + i + "] " + dx + ", " + dy)

					boxA.x -= dx
					boxA.y -= dy
					boxB.x += dx
					boxB.y += dy
				}
			})

		})
    }
    
}

const Vector = (props) => {
	const {width, height, dx, dy} = props
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
	console.log("rendering Vector with lineStyle " + JSON.stringify(lineStyle))
	return (
		<div className="arrow" style={vectorStyle} /*ref={el => vectorRefs[j] = el}*/>
			<div className="line" style={lineStyle}></div>
			<div className="point"></div>
		</div>
	)
}

const UIBox = React.forwardRef((props, ref) => {
    const {event, box} = props

    let date
    if (event.date) {
        date = event.date.toDateString()
    }

    let vectors = []
    if (typeof box !== "undefined") {
        box.vectors.map((vector, j) => {
			const [dx, dy] = vector
            vectors.push(
                <Vector width={box.width} height={box.height} dx={dx} dy={dy} />
            )
        })
    }

	console.log("rendering UIBox " + event.name)
	return (
		<div className="Canvas-event" ref={ref}>
			<div className="Canvas-event-name">{event.name}</div>
			<div className="Canvas-event-date">{date}</div>
			{vectors}
		</div>
	)
});

const TimelineUI = ({ events, startDate, endDate, canvasHeight, interval }) => {

	let timeline = null

	const defaultData = {
		nmae: "foo",
		image: "bar.png",
		date: "patreon_logo.png",
		x: 0, // setCoords
		y: 0,
		width: 100, // getSize
		height: 100
	}

    // const [timeline, setTimeline] = useState(null)
	const [boxes, setBoxes] = useState([])

    const eventRefs = useRef([]);

    useEffect(() => {
        init2()
        draw()
    })

    const init2 = () => {
		events.map((e, i) => {
			const ref = eventRefs.current[i]
			e.width = ref.clientWidth
			e.height = ref.clientHeight
		})

/*
        // TODO possibly factor into own function; don't need to hold onto startDate, endDate and canvasHeight
        // Could also project these on a plane from 0 to 1 and then have the timelineUI extrapolate them into real coords (!)
        const totalDays = this.dayDiff(startDate, endDate)
        this.boxes = events.map((e, i) => {
            const x = Math.random() * 200 // 200 is a magic number to provide jitter

            const days = this.dayDiff(startDate, e.date)
            const y = Math.random() * 600 // (days / totalDays) * canvasHeight
            
            return new EventBox(e, x, y, e.width, e.height) 
        });
*/

		console.log("init2")
		// console.log("setTimeline " + timeline)
		// setTimeline(new SimpleIterativeTimeline(events, startDate, endDate, canvasHeight))
    }

    const draw = () => {
        if (timeline) {
            timeline.boxes.map((b, i) => {
                // Update positions
                const ref = eventRefs.current[i]
                // HACK move to props and setState if possible
                const style = "left:" + b.x + "px;top:" + b.y + "px"
                ref.setAttribute('style', style)
            });

			console.log("setTimeline " + timeline)
            // setTimeline(timeline)
        }
    }

    const step = () => {
        timeline.step()
        draw()
    }

    const numTicks = computeTicks(startDate, endDate, interval)
    const spaceBetweenTicks = canvasHeight / numTicks

	const initUIBoxes = () => {
		let uiBoxes = []
		for (let i = 0; i < events.length; i++) {
			const e = events[i]

            let box
            if (timeline) {
                box = timeline.boxes[i]
            }

			uiBoxes.push(
				<UIBox event={e} box={box} ref={el => eventRefs.current[i] = el} />
			)
		}
		return uiBoxes
	}

	console.log("rendering timeline")
    return (
        <div className="Timeline" key="timeline">
			<button onClick={step}>
				Step
			</button>
            <div className="Events-container" key="events-container">
                {initUIBoxes()}
            </div>
            <div className="Canvas" key="canvas">
                {
                    Array.from(Array(numTicks), (e, i) => {
                        const style = {top: i * spaceBetweenTicks + "px"};
                        const offsetDate = new Date(startDate)
                        const tickDate = new Date(offsetDate.setMonth(offsetDate.getMonth() + (i * interval)))
                        return <div
                            key={i}
                            className="Canvas-tick"
                            style={style}>
                                {tickDate.toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}
                            </div> 
                    })
                }
            </div>
        </div>
    )
}

const Box = React.forwardRef((props, ref) => {
	const { event } = props

    let vectors = []
	event.vectors.map((vector, j) => {
		const [dx, dy] = vector
		vectors.push(
			<Vector width={event.width} height={event.height} dx={dx} dy={dy} />
		)
	})

	console.log("rendering Box " + event.name)
	return (
		<div className="Canvas-event" ref={ref} style={{ top: event.y, left: event.x }}>
			<div className="Canvas-event-name">{event.name}</div>
			<div className="Canvas-event-date">{event.date.toString()}</div>
			{vectors}
		</div>
	)
})

const Timeline = ({ eventsData, startDate, endDate, canvasHeight, interval }) => {
	const [ events, setEvents ] = useState(eventsData)
	const [ renderedOnce, setRenderedOnce ] = useState(false)
    const eventRefs = useRef([]);

	events.map((e, i) => {
		if (!e.x) {
			e.x = Math.random() * 200 + 1
			e.y = Math.random() * 200 + 1
		}
	})

	useEffect(() => {
		console.log("useEffect")
		if (!renderedOnce) {
			console.log("initial render")
			// This gets called on every render, and it's fine because it's idempotent
			events.map((e, i) => {
				const ref = eventRefs.current[i]
				e.width = ref.clientWidth
				e.height = ref.clientHeight
			})
			computeVectors()
			const eventsCopy = [ ...events ]
			setEvents(eventsCopy)
			setRenderedOnce(true)
		}
	})

    const projectionOverlaps = (minA, maxA, minB, maxB) => {
        return maxA >= minB && maxB >= minA
    }

    const isOverlapping = (boxA, boxB) => {
        return projectionOverlaps(boxA.x, boxA.x + boxA.width, boxB.x, boxB.x + boxB.width) &&
            projectionOverlaps(boxA.y, boxA.y + boxA.height, boxB.y, boxB.y + boxB.height)
    }

	// TODO add this to the event state prototype?
	const centerX = (event) => {
        return event.x + (event.width / 2);
	}

	const centerY = (event) => {
        return event.y + (event.height / 2);
	}

	const computeVectors = () => {
		// TODO fix up naming (events / boxA&B)
		events.map((boxA, i) => {
			if (!boxA.x) {
				throw new Error("x is undefined for box " + boxA.name)
			}
			if (!boxA.y) {
				throw new Error("y is undefined for box " + boxA.name)
			}
			if (!boxA.width) {
				throw new Error("width is undefined for box " + boxA.name)
			}
			if (!boxA.height) {
				throw new Error("height is undefined for box " + boxA.name)
			}
			events.map((boxB, j) => {
				if (isOverlapping(boxA, boxB)) {
					if (i == j) {
						return boxB
					}
					const dx = centerX(boxB) - centerX(boxA)
					const dy = centerY(boxB) - centerY(boxA)
					console.log("dx " + dx + " dy " + dy)
					boxA.vectors[j] = [dx, dy]
					boxB.vectors[i] = [-dx, -dy]

				}
				return boxB 
			})
			return boxA
		})
	}

	const applyVectors = () => {
		events.map((event, i) => {
			event.vectors.map((vector, i) => {
				// apply only if overlapping
				const [ dx, dy ] = vector
				event.x -= dx / 2
				event.y -= dy / 2
			})
		})
	}

	const step = () => {
		console.log("step")
		// computeVectors()
		applyVectors()
		const eventsCopy = [ ...events ]
		setEvents(eventsCopy)
	}

	console.log("rendering Timeline")
	return (
		<div className="Timeline" key="timeline">
			<button className="Timeline-step" onClick={step}>
				Step
			</button>
			<div>
				{events.map((e, i) => {
					return <Box event={e} ref={el => eventRefs.current[i] = el} />
				})}
			</div>
		</div>
	)
}

export default App;

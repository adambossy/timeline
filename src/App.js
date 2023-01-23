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
			box: {
				vectors: []
			}
        },
        {
            name: "Mendozada",
            image: "mendozada_2016.png",
            date: new Date("2016-02-01"),
			box: {
				vectors: []
			}
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
					boxB.vectors[i] = [-dx, -dy]

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
	return (
		<div className="arrow" style={vectorStyle} /*ref={el => vectorRefs[j] = el}*/>
			<div className="line" style={lineStyle}></div>
			<div className="point"></div>
		</div>
	)
}

const Box = React.forwardRef((props, ref) => {
	const { e } = props
	const box = e.box // convenience


    let vectors = []
	box.vectors.map((vector, j) => {
		const [otherBox, dx, dy] = vector
		vectors.push(
			<Vector key={j} width={box.width} height={box.height} dx={dx} dy={dy} />
		)
	})

	return (
		<div className="Canvas-event" ref={ref} style={{ top: box.y, left: box.x }}>
			<div className="Canvas-event-name">{e.name}</div>
			<div className="Canvas-event-date">{e.date.toString()}</div>
			{vectors}
		</div>
	)
})

const Timeline = ({ eventsData, startDate, endDate, canvasHeight, interval }) => {
	const [ events, setEvents ] = useState(eventsData)
	const [ renderedOnce, setRenderedOnce ] = useState(false)
    const eventRefs = useRef([]);

	events.map((e, i) => {
		const box = e.box // convenience
		if (!box.x) {
			box.x = Math.random() * 200 + 1
			box.y = Math.random() * 200 + 1
		}
	})

	useEffect(() => {
		if (!renderedOnce) {
			// This gets called on every render, and it's fine because it's idempotent
			events.map((e, i) => {
				const box = e.box // convenience
				const ref = eventRefs.current[i]
				box.width = ref.clientWidth
				box.height = ref.clientHeight
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
		events.map((e, i) => {
			const box = e.box // convenience
			if (!box.x) {
				throw new Error("x is undefined for box " + box.name)
			}
			if (!box.y) {
				throw new Error("y is undefined for box " + box.name)
			}
			if (!box.width) {
				throw new Error("width is undefined for box " + box.name)
			}
			if (!box.height) {
				throw new Error("height is undefined for box " + box.name)
			}
			events.map((otherE, j) => {
				const otherBox = otherE.box // convenience
				if (isOverlapping(box, otherBox)) {
					if (i == j) {
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
		events.map((e, i) => {
			e.box.vectors.map((vector, j) => {
				const [ otherBox, dx, dy ] = vector
				// TODO fix up naming inconsistencies
				if (isOverlapping(e.box, otherBox)) {
					e.box.x -= dx / 2
					e.box.y -= dy / 2
				}
			})
		})
	}

	const step = () => {
		applyVectors()
		const eventsCopy = [ ...events ]
		setEvents(eventsCopy)
	}

	return (
		<div className="Timeline" key="timeline">
			<button className="Timeline-step" onClick={step}>
				Step
			</button>
			<div>
				{events.map((e, i) => {
					return <Box e={e} key={i} ref={el => eventRefs.current[i] = el} />
				})}
			</div>
		</div>
	)
}

export default App;

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
        },
        {
            name: "Mendozada",
            image: "mendozada_2016.png",
            date: new Date("2016-02-01"),
        },
        {
            name: "Event designed to collide with Camp Grounded",
            image: "foo",
            date: new Date("2016-05-01"),
        },
        /*
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
        this.fx = 0
        this.fy = 0
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


class Iterative2DTimeline {

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

    repulsive_force = 12250
    ticks = 100

    create(eventBoxes, startDate, endDate, canvasHeight) {
        const totalDays = this.totalDays(startDate, endDate)

        eventBoxes.forEach(function(box) {
            box.isOverlapping = false
        })

        for (let i = 0; i < eventBoxes.length; i++) {
            const boxA = eventBoxes[i]

            if (boxA.y = -1) { // HACK! Move to init function on this class
                const days = this.dayDiff(startDate, boxA.event.date)
                boxA.y = (days / totalDays) * canvasHeight
            }

            for (let j = i + 1; j < eventBoxes.length; j++) {
                const boxB = eventBoxes[j]
                if (this.isOverlapping(boxA, boxB)) {
                    boxA.isOverlapping = true 
                    boxB.isOverlapping = true 
                    const dx = boxB.centerX() - boxA.centerX()
                    const dy = boxB.centerY() - boxA.centerY()
                    const distanceSquared = dx * dx + dy * dy
                    const distance = Math.sqrt(distanceSquared)
                    const force = this.repulsive_force / distanceSquared
                    const fx = force * dx / distance
                    const fy = force * dy / distance
                    boxA.fx -= fx
                    boxA.fy -= fy
                    boxB.fx += fx
                    boxB.fy += fy
                    console.log("OVERLAPS! " + boxA.event.name + " & " + boxB.event.name +
                        "\n dx " + dx +
                        "\n dy " + dy +
                        "\n distanceSquared " + distanceSquared +
                        "\n distance " + distance +
                        "\n force " + force +
                        "\n fx " + fx +
                        "\n fy " + fy)
                }
            }
        }

        eventBoxes.forEach(function(box) {
            if (box.isOverlapping) {
                box.x += box.fx
                box.y += box.fy
            } else {
                box.fx = 0
                box.fy = 0
            }
        })

        return eventBoxes
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

/*
    useEffect(() => {
        // Prep eventBoxes
        eventBoxes = state.events.map((e, i) => {
            const ref = eventRefs.current[i]
            return new EventBox(e, Math.random() * 200, -1, ref.clientWidth, ref.clientHeight)
        });

        const timeline = new Iterative2DTimeline()

        function step() {
            timeline.create(eventBoxes, startDate, endDate, canvasHeight)

            // Apply creation results
            eventBoxes.map((b, i) => {
                const ref = eventRefs.current[i]
                /*
                const style = {
                    left: b.x,
                    top: b.y
                }
                this.setState
                *//*
                const style = "left:" + b.x + "px;top:" + b.y + "px" // HACK
                ref.setAttribute('style', style)
                return b
            });

            // setTimeout(() => step(), 1000)
        }

        for (let i = 0; i < 100; i++) {
            step()
        }
    })
*/

    // HACK
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    return (
        <div className="App">
            <TimelineUI
                events={state.events}
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
        // TODO possibly factor into own function; don't need to hold onto startDate, endDate and canvasHeight
        // Could also project these on a plane from 0 to 1 and then have the timelineUI extrapolate them into real coords (!)
        const totalDays = this.dayDiff(startDate, endDate)
        this.boxes = events.map((e, i) => {
            const x = Math.random() * 200 // 200 is a magic number to provide jitter

            const days = this.dayDiff(startDate, e.date)
            const y = Math.random() * 600 // (days / totalDays) * canvasHeight
            
            return new EventBox(e, x, y, e.width, e.height) 
        });
    }

    step() {

    }
    
}

const UIBox = React.forwardRef((props, ref) => {
    const {event, box} = props
    /*
    const vectorRefs = useRef([]);
    useEffect(() => {
    	const ref = vectorRefs.current[i]
    })
    */

    let date
    if (event.date) {
        date = event.date.toDateString()
    }

    let vectors = []
    if (typeof box !== "undefined") {
        box.vectors.map((vector, j) => {
			const [dx, dy] = vector
			const angle = Math.atan2(dy, dx) * 180 / Math.PI
			const length = Math.sqrt(dx * dx + dy * dy)

			const vectorStyle = {
                left: ((box.width - length) / 2) + "px",
                top: (box.height / 2 - 5) + "px",  // MAGIC NUMBER ALERT .point border-top-width
				width: length + "px",
                Transform: "rotate(" + angle + "deg)",
                WebkitTransform: "rotate(" + angle + "deg)"
            }
			const lineStyle = {
				marginLeft: length / 2 + "px",
				width: length / 2 - 16 + "px" // MAGIC NUMBER ALERT .point border-left-width
			}
            vectors.push(
                <div key={j} className="arrow" style={vectorStyle} /*ref={el => vectorRefs[j] = el}*/>
                    <div className="line" style={lineStyle}></div>
                    <div className="point"></div>
                </div>
            )
        })
    }

	return (
		<div className="Canvas-event" ref={ref}>
			<div className="Canvas-event-name">{event.name}</div>
			<div className="Canvas-event-date">{date}</div>
			{vectors}
		</div>
	)
});

// class TimelineUI extends Component {
const TimelineUI = ({ events, startDate, endDate, canvasHeight, interval }) => {

    const [timeline, setTimeline] = useState(null)
    const [boxes, setBoxes] = useState([])

    const eventRefs = useRef([]);

    useEffect(() => {
        init()
        draw()
    })

    const init = () => {
        if (!timeline) {
            console.log("timeline " + !timeline)

            events.map((e, i) => {
                const ref = eventRefs.current[i]
                e.width = ref.clientWidth
                e.height = ref.clientHeight
            })

            setTimeline(new SimpleIterativeTimeline(events, startDate, endDate, canvasHeight))
        }
    }

    const draw = () => {
        if (timeline) {
            timeline.boxes.map((b, i) => {
                // Update positions
                const ref = eventRefs.current[i]
                // HACK move to props and setState if possible
                const style = "left:" + b.x + "px;top:" + b.y + "px"
                ref.setAttribute('style', style)

                // Draw vectors
                timeline.boxes.map((boxB, j) => {
                    if (i == j) {
                        return
                    }
                    const boxA = b
                    const dx = boxB.centerX() - boxA.centerX()
                    const dy = boxB.centerY() - boxA.centerY()
					boxA.vectors[j] = [dx, dy]
					boxB.vectors[i] = [-dx, -dy]
                })

            });

            setBoxes(timeline.boxes)
        }


		// this.forceUpdate()
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
            if (i < boxes.length) {
                box = boxes[i]
            }

			uiBoxes.push(
				<UIBox event={e} box={box} ref={el => eventRefs.current[i] = el} />
			)
		}
		return uiBoxes
	}

    return (
        <div className="Timeline" key="timeline">
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

export default App;

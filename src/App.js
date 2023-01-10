import { useEffect, useRef } from 'react'
import './App.css';

const state = {
    events: [
        {
            name: "Worked at Patreon",
            image: "patreon_logo.png",
            date: new Date("2016-08-01"), // TEMP - remove
            startDate: "2016-01-07",
            endDate: "2018-11-09",
        },
        {
            name: "Mendozada",
            image: "mendozada_2016.png",
            date: new Date("2016-08-01"),
        },
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
        }
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
    }
}

// TODO generalize to support both horizontal and vertical
class SimpleVerticalTimeline {

    margin = 10

    projectionOverlaps(minA, maxA, minB, maxB) {
        return maxA >= minB && maxB >= minA
    }

    isOverlapping(boxA, boxB) {

        return this.projectionOverlaps(boxA.x, boxA.width, boxB.x, boxB.width) &&
            this.projectionOverlaps(boxA.y, boxA.height, boxB.y, boxB.height)
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
    const numTicks = computeTicks(startDate, endDate, interval);
    const spaceBetweenTicks = canvasHeight / numTicks;

    const eventRefs = useRef([]);

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

    useEffect(() => {
        // Prep eventBoxes
        const eventBoxes = state.events.map((e, i) => {
            const ref = eventRefs.current[i]
            return new EventBox(e, 0, 0, ref.clientWidth, ref.clientHeight)
        });

        console.log(new SimpleVerticalTimeline().create(eventBoxes, startDate, endDate, canvasHeight))

        // Apply creation results
        eventBoxes.map((b, i) => {
            const ref = eventRefs.current[i]
            /*
            const style = {
                left: b.x,
                top: b.y
            }
            this.setState
            */
            const style = "left:" + b.x + "px;top:" + b.y + "px" // HACK
            ref.setAttribute('style', style)
            return b
        });
    })

    return (
        <div className="App">
            <div className="Events-container">
                {state.events.map((e, i) => {
                    let date
                    if (e.date) {
                        date = e.date.toDateString()
                    }

                    return <div ref={el => eventRefs.current[i] = el}
                                key={i}
                                className="Canvas-event">
                        <div className="Canvas-event-name">{e.name}</div>
                        <div className="Canvas-event-date">{date}</div>
                    </div>
                })}
            </div>
            <div className="Canvas">
                {
                    Array.from(Array(numTicks), (e, i) => {
                        const style = {top: i * spaceBetweenTicks + "px"};
                        const offsetDate = new Date(startDate)
                        const tickDate = new Date(offsetDate.setMonth(offsetDate.getMonth() + (i * interval)))
                        return <div
                            className="Canvas-tick"
                            style={style}>
                                {tickDate.toLocaleDateString('en-us', { year:"numeric", month:"short", day:"numeric"})}
                            </div> 
                    })
                }
            </div>
        </div>
    );
}

export default App;

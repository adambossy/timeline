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

function createGraph(events, eventRefs, startDate, endDate, interval, spaceBetweenTicks) {
    // TODO figure out how to get all this to compute just once
    if (events.length === 0)
        return []
    let lastBottom = undefined
    let lastLeft = 0
    return events.map((e, i) => {
        const ref = eventRefs.current[i];
        // console.log(ref.clientWidth + 'x' + ref.clientHeight);

        let style = ref.getAttribute('style') // HACK! Appending to getAttribute is temporary in order to support random coloring
        if (e.date) {
            const y = monthDiff(startDate, e.date) * (spaceBetweenTicks / interval)
            style = style + ";top:" + y + "px"

            console.log(e.name + ' y ' + y + ' lastBottom ' + lastBottom)
            if (y < lastBottom) {
                const marginLeft = parseInt(window.getComputedStyle(ref).getPropertyValue('margin-left')) // UGLY
                const marginRight = parseInt(window.getComputedStyle(ref).getPropertyValue('margin-right')) // UGLY
                lastLeft += ref.clientWidth + marginLeft + marginRight
                style = style + "; left: " + lastLeft + "px"
                console.log("successfully shifted right ", lastLeft)
            } else {
                lastLeft = 0
                console.log("reset left")
            }

            ref.setAttribute('style', style)
            lastBottom = y + ref.clientHeight
        }
    });
}
/*
function dayDiff(dateFrom, dateTo) {
    const diffTime = Math.abs(dateTo - dateFrom);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
}
*/
function monthDiff(dateFrom, dateTo) {
    return dateTo.getMonth() - dateFrom.getMonth() +
   (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
}

const colors = [
    'red',
    'green',
    'blue',
    'gray'
]

/*
function randomColor() {
    const color = colors[Math.floor(Math.random() * colors.length)]
    return color
}
*/

function App() {
    const startDate = new Date("January 1, 2016");
    const endDate = new Date("December, 2018");
    const interval = 3 // number of months per "tick"

    const canvasHeight = 1200;
    const numTicks = computeTicks(startDate, endDate, interval);
    const spaceBetweenTicks = canvasHeight / numTicks;

    const eventRefs = useRef([]);

//    const eventRefs = Array.from(Array(numTicks), (e, i) => {
//        return useRef(null)
//    });

    state.events.sort((a, b) => {
        const dateA = a.date
        console.log('dateA', dateA);
        const dateB = b.date
        console.log('dateB', dateB);
        if (dateA < dateB) {
            return -1
        } else if (dateB < dateA) {
            return 1
        } else {
            return 0
        }
    })
    console.log(state.events)

    useEffect(() => {
        eventRefs.current = eventRefs.current.slice(0, state.events.length);
        eventRefs.current.map((e, i) => {
            // console.log(e.clientWidth + 'x' + e.clientHeight);
        })
        createGraph(state.events, eventRefs, startDate, endDate, interval, spaceBetweenTicks);
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

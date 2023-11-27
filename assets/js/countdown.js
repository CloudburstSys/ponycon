function fixed(number) {
    if (number < 10) {
        return "0" + number;
    } else {
        return number.toString();
    }
}

function _countdown() {
    Array.from(document.getElementsByClassName("countdown")).forEach((i) => {
        let diffStart = Math.round((parseInt(i.getAttribute("data-countdown-start-date")) - new Date().getTime()) / 1000);
        let diffEnd = Math.round((parseInt(i.getAttribute("data-countdown-end-date")) - new Date().getTime()) / 1000);

        let id = i.getAttribute("data-countdown-id");
        let breakData = eventBreaks[id];

        if (breakData.length !== 0) {
            // Remove already occurred breaks
            breakData = breakData.filter(eventBreak => {
                return eventBreak.end >= new Date().getTime();
            });

            // Get the nearest break (always the first element);
            let nearestBreak = breakData[0];

            if(nearestBreak !== undefined) {
                // Check if we're in its bounds.
                if (nearestBreak.start <= new Date().getTime()) {
                    // We are, display string saying that the event is on break.
                    let diffStart = Math.round((nearestBreak.end - new Date().getTime()) / 1000);

                    let weeks = 0;
                    let days = 0;
                    let hours = 0;
                    let minutes = 0;
                    let seconds = 0;

                    switch (localStorage.getItem("countdownUnit")) {
                        case null:
                        case "weeks":
                            weeks = Math.floor(diffStart / 604800);
                            days = Math.floor(diffStart / 86400) - (weeks * 7);
                            hours = Math.floor(diffStart / 3600) - (weeks * 168) - (days * 24);
                            minutes = Math.floor(diffStart / 60) - (weeks * 10080) - (days * 1440) - (hours * 60);
                            seconds = diffStart - (weeks * 604800) - (days * 86400) - (hours * 3600) - (minutes * 60);
                            break;
                        case "days":
                            days = Math.floor(diffStart / 86400);
                            hours = Math.floor(diffStart / 3600) - (days * 24);
                            minutes = Math.floor(diffStart / 60) - (days * 1440) - (hours * 60);
                            seconds = diffStart - (days * 86400) - (hours * 3600) - (minutes * 60);
                            break;
                        default:
                            console.error(`Unknown top-level unit for countdown: ${localStorage.getItem("countdownUnit")}.`);
                    }

                    i.innerHTML = `<span class="countdown-item">Paused (returns in <code>${fixed(hours)}</code>:<code>${fixed(minutes)}</code>:<code>${fixed(seconds)}</code>)</span>`;
                    return;
                }
            }
        }

        if (diffEnd <= 0) {
            i.innerHTML = "Over";
            return;
        }

        if (diffStart <= 0) {
            i.innerHTML = "Ongoing";
            return;
        }

        let weeks = 0;
        let days = 0;
        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        switch (localStorage.getItem("countdownUnit")) {
            case null:
            case "weeks":
                weeks = Math.floor(diffStart / 604800);
                days = Math.floor(diffStart / 86400) - (weeks * 7);
                hours = Math.floor(diffStart / 3600) - (weeks * 168) - (days * 24);
                minutes = Math.floor(diffStart / 60) - (weeks * 10080) - (days * 1440) - (hours * 60);
                seconds = diffStart - (weeks * 604800) - (days * 86400) - (hours * 3600) - (minutes * 60);
                break;
            case "days":
                days = Math.floor(diffStart / 86400);
                hours = Math.floor(diffStart / 3600) - (days * 24);
                minutes = Math.floor(diffStart / 60) - (days * 1440) - (hours * 60);
                seconds = diffStart - (days * 86400) - (hours * 3600) - (minutes * 60);
                break;
            default:
                console.error(`Unknown top-level unit for countdown: ${localStorage.getItem("countdownUnit")}.`);
        }

        i.innerHTML = `<span class="countdown-item">${weeks > 0 ? `<code>${weeks}</code>w ` : ``}${days > 0 ? `<code>${days}</code>d ` : ``}<code>${fixed(hours)}</code>:<code>${fixed(minutes)}</code>:<code>${fixed(seconds)}</code></span>`;
    })
}

setInterval(_countdown, 1000);

function applySettings() {
    localStorage.setItem("countdownUnit", document.getElementById("settings-countdownUnit").value);
}

window.onload = () => {
    _countdown();

    Array.from(document.getElementsByTagName("pc-date")).forEach((i) => {
        let date = new Date(parseInt(i.innerHTML.trim()));
        let parts = date.toString().split(" ");
        let time = parts[4].split(":");

        i.outerHTML = parts[0] + " " + parts[2] + " " + parts[1] + " " + parts[3] + ", " + time[0] + ":" + time[1];
    });

    // <a target="_blank" href="<%= event.location.openstreetmap.url %>"><%= event.location.name %></a>

}
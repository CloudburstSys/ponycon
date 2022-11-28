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

        if (diffEnd <= 0) {
            i.innerHTML = "Over";
            return;
        }

        if (diffStart <= 0) {
            i.innerHTML = "Ongoing";
            return;
        }

        let weeks = Math.floor(diffStart / 604800);
        let days = Math.floor(diffStart / 86400) - (weeks * 7);
        let hours = Math.floor(diffStart / 3600) - (weeks * 168) - (days * 24);
        let minutes = Math.floor(diffStart / 60) - (weeks * 10080) - (days * 1440) - (hours * 60);
        let seconds = diffStart - (weeks * 604800) - (days * 86400) - (hours * 3600) - (minutes * 60);

        i.innerHTML = `<span class="countdown-item">${weeks > 0 ? `<code>${weeks}</code>w ` : ``}${days > 0 ? `<code>${days}</code>d ` : ``}<code>${fixed(hours)}</code>:<code>${fixed(minutes)}</code>:<code>${fixed(seconds)}</code></span>`;
    })
}

setInterval(_countdown, 1000);

window.onload = () => {
    _countdown();

    Array.from(document.getElementsByTagName("pc-date")).forEach((i) => {
        let date = new Date(parseInt(i.innerHTML.trim()));
        let parts = date.toString().split(" ");
        let time = parts[4].split(":");

        i.outerHTML = parts[0] + " " + parts[2] + " " + parts[1] + " " + parts[3] + ", " + time[0] + ":" + time[1];
    })
}
let darkThemeDefault = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && (localStorage.getItem("theme") === "dark" || localStorage.getItem("theme") === null)) || localStorage.getItem("theme") === "dark";
let darkTheme = false;

document.getElementById("dark-theme").disabled = true;

function switchTheme() {
    if (darkTheme) {
        document.getElementById("dark-theme").disabled = true;
        document.getElementById("theme-switcher-img").src = "/assets/img/dark.svg";
        document.getElementById("settings-img").src = "/assets/img/settings_light.svg";
        darkTheme = false;
    } else {
        document.getElementById("dark-theme").disabled = false;
        document.getElementById("theme-switcher-img").src = "/assets/img/light.svg";
        document.getElementById("settings-img").src = "/assets/img/settings_dark.svg";
        darkTheme = true;
    }

    localStorage.setItem("theme", darkTheme ? "dark" : "light");
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
window.onload = () => {
    try {
        const everything = {
            state: {
                combo: 0,
            },
            dom: {
                frame: document.getElementById("frame"),
                world: document.getElementById("world"),
                comboBg: document.getElementById("combo-bg"),
                comboFg: document.getElementById("combo-fg"),
            },
        };
        window.addEventListener("message", (event) => {
            try {
                const message = event.data;
                switch (message.type) {
                    case "star": {
                        makeH1(message.value[0], everything);
                        everything.state.combo++;
                        break;
                    }
                    default: {
                        log("implement me");
                    }
                }
            }
            catch (error) {
                log(error, error.stack);
            }
        });
        requestAnimationFrame((now) => tick(now, 0, everything));
    }
    catch (error) {
        log(error, error.stack);
    }
};
const tick = (now, last, everything) => {
    try {
        everything.state.combo = clamp(0, 100)(everything.state.combo - 0.1);
        everything.dom.comboFg.style.width =
            unpx(getComputedStyle(everything.dom.comboBg).width) *
                (everything.state.combo / 100) +
                "px";
        document.documentElement.style.setProperty("--combo-width", `${everything.state.combo}%`);
        requestAnimationFrame((now) => tick(now, last, everything));
    }
    catch (error) {
        log(error, error.stack);
    }
};
const makeH1 = (code, everything) => {
    try {
        const h1 = document.createElement("h1");
        h1.innerHTML = code.toString();
        everything.dom.world.appendChild(h1);
        const comboStyle = getComputedStyle(everything.dom.comboBg);
        const comboHeight = unpx(comboStyle.height) +
            unpx(comboStyle.marginTop) +
            unpx(comboStyle.marginBottom) +
            unpx(comboStyle.paddingTop) +
            unpx(comboStyle.paddingBottom);
        const worldStyle = getComputedStyle(everything.dom.world);
        const worldWidth = unpx(worldStyle.width);
        const worldHeight = unpx(worldStyle.height);
        const h1Style = getComputedStyle(h1);
        const h1Width = unpx(h1Style.width);
        const h1Height = unpx(h1Style.height);
        h1.style.left = `${(worldWidth - h1Width) * Math.random()}px`;
        h1.style.top = `${comboHeight + (worldHeight - h1Height) * Math.random()}px`;
        h1.style.rotate = `${30 * Math.random() - 15}deg`;
        h1.addEventListener("animationend", () => {
            if (h1.classList.contains("entering")) {
                h1.classList.remove("entering");
                h1.classList.add("exiting");
            }
            else if (h1.classList.contains("exiting")) {
                h1.classList.remove("exiting");
                everything.dom.world.removeChild(h1);
            }
        });
        h1.classList.add("entering");
        return h1;
    }
    catch (error) {
        log(error, error.stack);
    }
};
const log = (...args) => {
    try {
        document.getElementById("log").innerHTML =
            `<p>${new Date().toLocaleTimeString()}: ${args.join(" ")}</p>` +
                document.getElementById("log").innerHTML;
    }
    catch (error) {
        log(error, error.stack);
        console.log(error, error.stack);
    }
};
const mod = (n, d) => ((n % d) + d) % d;
const stringify = (x) => ["string", "number"].includes(typeof x) ? x : JSON.stringify(x, null, 2);
const maybeGet = (x, key, fallback = undefined) => typeof x === "object" && !!x && key in x ? x[key] : fallback;
const clamp = (min, max) => (n) => Math.min(max, Math.max(min, n));
const unpx = (x) => parseFloat(x.slice(-2) === "px" ? x.slice(0, -2) : x);
//# sourceMappingURL=worker.js.map
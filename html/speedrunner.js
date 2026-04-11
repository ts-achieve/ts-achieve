window.onload = () => {
  try {
    log("starting up…");

    const vscode = acquireVsCodeApi();

    const everything = {
      state: {
        starmap: undefined,
        vscode: vscode,
        isRunning: false,
        history: [],
        startTime: -1,
        elapsedTime: -1,
      },
      dom: {
        h1: document.getElementsByTagName("h1")[0],
        latestUl: document.querySelector("#latest ul"),
        historyUl: document.querySelector("#history ul"),
        buttons: {
          begin: document.getElementById("begin-run"),
          end: document.getElementById("end-run"),
        },
      },
    };

    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.type) {
        case "starmap": {
          everything.state.starmap = new Map(message.value);
          break;
        }
        case "star": {
          handleStar(message.value, everything);
          break;
        }
      }
    });

    everything.dom.buttons.begin.addEventListener("click", (e) =>
      beginRun(e, everything),
    );
    everything.dom.buttons.end.addEventListener("click", (e) =>
      endRun(e, everything),
    );

    log("started up!");
  } catch (error) {
    log(error, error.stack);
  }
};

const handleStar = (code, everything) => {
  try {
    log("handling code:", code);
    const maybeOldStar = everything.state.starmap.get(code);
    if (maybeOldStar) {
      if ("encounterCount" in maybeOldStar) {
        maybeOldStar.encounterCount++;
      } else {
        maybeOldStar.encounterCount = 1;
        everything.dom.latestUl.innerHTML += `<li>${code}: ${maybeOldStar.messageTemplate}</li>`;
        document.getElementsByTagName("dd")[0].innerHTML =
          everything.state.starmap
            .values()
            .toArray()
            .filter((star) => "encounterCount" in star).length +
          " of " +
          everything.state.starmap.values().toArray().length;
      }
    }
  } catch (error) {
    log(error, error.stack);
  }
};

const beginRun = (event, everything) => {
  try {
    log("beginning run…");

    everything.state.isRunning = true;
    everything.state.vscode.postMessage({
      type: "isRunning",
      value: everything.state.isRunning,
    });
    everything.dom.buttons.begin.style.display = "none";
    everything.dom.buttons.end.style.display = "block";
    everything.dom.h1.classList.add("running");

    const timeH1 = document
      .getElementById("time")
      .getElementsByTagName("h1")[0];
    everything.state.startTime = performance.now();

    document.getElementsByTagName("dd")[0].innerHTML =
      "0 of " + everything.state.starmap.values().toArray().length;

    log("run begun!");

    const tick = () => {
      everything.state.elapsedTime = Math.round(
        performance.now() - everything.state.startTime,
      );
      timeH1.innerHTML = pprint(everything.state.elapsedTime);
      if (everything.state.isRunning) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  } catch (error) {
    log(error, error.stack);
  }
};

const pprint = (time) => {
  return (
    mod(Math.floor(time / (60 * 60 * 1000)), 60)
      .toString()
      .padStart(2, "0") +
    ":" +
    mod(Math.floor(time / (60 * 1000)), 60)
      .toString()
      .padStart(2, "0") +
    ":" +
    mod(Math.floor(time / 1000), 60)
      .toString()
      .padStart(2, "0") +
    "." +
    mod(time, 1000).toString().padStart(3, "0")
  );
};

const endRun = (event, everything) => {
  try {
    log("ending run…");

    everything.state.isRunning = false;
    everything.state.vscode.postMessage({
      type: "isRunning",
      value: everything.state.isRunning,
    });
    everything.dom.buttons.begin.style.display = "block";
    everything.dom.buttons.end.style.display = "none";
    everything.dom.h1.classList.remove("running");

    const achieved = everything.state.starmap
      .values()
      .toArray()
      .filter((star) => "encounterCount" in star).length;
    const total = everything.state.starmap.values().toArray().length;

    everything.dom.historyUl.innerHTML =
      `<li>Duration: ${pprint(everything.state.elapsedTime)}` +
      "<br>" +
      `Progress: ${((achieved / total) * 100).toFixed(2)}% (${achieved} of ${total})</li>` +
      everything.dom.historyUl.innerHTML;

    log("run ended!");
  } catch (error) {
    log(error, error.stack);
  }
};

const log = (...args) => {
  try {
    document.getElementById("log").innerHTML =
      `<p>${new Date().toLocaleTimeString()}: ${args.join(" ")}</p>` +
      document.getElementById("log").innerHTML;
  } catch (error) {
    log(error, error.stack);
  }
};

const mod = (n, d) => {
  return ((n % d) + d) % d;
};

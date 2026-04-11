window.onload = () => {
  try {
    log("starting up…");

    const vscode = acquireVsCodeApi();
    const oldState = vscode.getState();

    const everything = {
      state: {
        emptymap: maybeGet(oldState, "emptymap"),
        starmap: maybeGet(oldState, "entries")
          ? new Map(oldState.entries)
          : undefined,
        vscode: vscode,
        isRunning: maybeGet(oldState, "isRunning", false),
        history: maybeGet(oldState, "history", []),
        startTime: maybeGet(oldState, "startTime", -1),
        elapsedTime: maybeGet(oldState, "elapsedTime", 0),
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

    if (!everything.state.emptymap) {
      everything.state.vscode.postMessage({ type: "request", value: "map" });
    }

    window.addEventListener("message", (event) => {
      const message = event.data;
      switch (message.type) {
        case "emptymap": {
          everything.state.emptymap = message.value;
          everything.state.vscode.setState({
            emptymap: everything.state.emptymap,
          });
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

    resetDom(everything);

    if (everything.state.isRunning) {
      resumeRun(everything);
    }

    log("started up!");
  } catch (error) {
    log(error, error.stack);
  }
};

const handleStar = (code, everything) => {
  try {
    log("handling star:", code);
    const maybeOldStar = everything.state.starmap.get(code);

    if (maybeOldStar) {
      if ("encounterCount" in maybeOldStar) {
        maybeOldStar.encounterCount++;
      } else {
        const stars = everything.state.starmap.values().toArray();
        maybeOldStar.encounterCount = 1;
        everything.dom.latestUl.innerHTML += `<li>${code}: ${maybeOldStar.messageTemplate}</li>`;
        document.getElementsByTagName("dd")[0].innerHTML =
          stars.filter((star) => "encounterCount" in star).length +
          " of " +
          stars.length;
      }
    }
  } catch (error) {
    log(error, error.stack);
  }
};

const resumeRun = (everything) => {
  try {
    log("resuming run…");

    resetDom(everything);

    const oldState = everything.state.vscode.getState();

    everything.state.starmap = new Map(oldState.entries);
    everything.state.vscode.setState({
      entries: everything.state.starmap.entries().toArray(),
    });

    everything.state.startTime = oldState.startTime;

    everything.dom.buttons.begin.style.display = "none";
    everything.dom.buttons.end.style.display = "block";
    everything.dom.h1.classList.add("running");

    everything.state.isRunning = true;
    everything.state.vscode.postMessage({
      type: "running",
      value: everything.state.isRunning,
    });

    log("run resumed!");

    requestAnimationFrame((t) => tick(t, everything));
  } catch (error) {
    log(error, error.stack);
  }
};

const beginRun = (event, everything) => {
  try {
    log("beginning run…");

    resetDom(everything);

    everything.state.starmap = new Map(
      everything.state.emptymap.map(([k, v]) => [
        k,
        {
          category: v.category,
          code: v.code,
          kind: v.kind,
          messageTemplate: v.messageTemplate,
        },
      ]),
    );

    everything.state.startTime = Date.now();

    everything.state.vscode.setState({
      entries: everything.state.starmap.entries().toArray(),
    });

    everything.dom.buttons.begin.style.display = "none";
    everything.dom.buttons.end.style.display = "block";
    everything.dom.h1.classList.add("running");

    everything.state.isRunning = true;
    everything.state.vscode.postMessage({
      type: "running",
      value: everything.state.isRunning,
    });

    log("run begun!");

    requestAnimationFrame((t) => tick(t, everything));
  } catch (error) {
    log(error, error.stack);
  }
};

const tick = (t, everything) => {
  try {
    everything.dom.h1.innerHTML = pprint(everything.state.elapsedTime);

    everything.state.elapsedTime = Date.now() - everything.state.startTime;

    everything.state.vscode.setState({
      entries: everything.state.starmap.entries().toArray(),
      isRunning: everything.state.isRunning,
      history: everything.state.history,
      startTime: everything.state.startTime,
      elapsedTime: everything.state.elapsedTime,
    });

    if (everything.state.isRunning) {
      requestAnimationFrame((t) => tick(t, everything));
    }
  } catch (error) {
    log(error, error.stack);
  }
};

const pprint = (time) => {
  return (
    Math.floor(time / (60 * 60 * 1000))
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
    mod(Math.floor(time), 1000).toString().padStart(3, "0")
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

    const numberAchieved = everything.state.starmap
      .values()
      .toArray()
      .filter((star) => "encounterCount" in star).length;
    const numberTotal = everything.state.starmap.values().toArray().length;

    everything.state.history.push({
      duration: everything.state.elapsedTime,
      numberAchieved,
      numberTotal,
    });

    everything.state.vscode.setState({
      entries: everything.state.starmap.entries().toArray(),
      isRunning: everything.state.isRunning,
      history: everything.state.history,
    });

    renderHistoryUl(everything);

    log("run ended!");
  } catch (error) {
    log(error, error.stack);
  }
};

resetDom = (everything) => {
  log("resetting dom…");

  everything.dom.h1.innerHTML = "00:00:00.000";
  if (everything.state.starmap) {
    document.getElementsByTagName("dd")[0].innerHTML =
      "0 of " + everything.state.starmap.values().toArray().length;
  }
  everything.dom.latestUl.innerHTML = "";
  renderHistoryUl(everything);

  log("dom reset!");
};

const renderHistoryUl = (everything) => {
  everything.dom.historyUl.innerHTML = everything.state.history
    .map(
      (item) =>
        "<li>" +
        `Duration: ${pprint(item.duration)}` +
        "<br>" +
        `Progress: ${((item.numberAchieved / item.numberTotal) * 100).toFixed(2)}%` +
        " " +
        `(${item.numberAchieved} of ${item.numberTotal})` +
        "</li>",
    )
    .join("");
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

const stringify = (x) => {
  return ["string", "number"].includes(typeof x)
    ? x
    : JSON.stringify(x, null, 2);
};

const maybeGet = (x, key, fallback = undefined) => {
  return typeof x === "object" && !!x && key in x ? x[key] : fallback;
};

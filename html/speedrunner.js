window.onload = () => {
  try {
    log("starting up…");

    const vscode = acquireVsCodeApi();

    const everything = {
      state: {
        starmap: undefined,
        vscode: vscode,
        isRunning: false,
      },
      dom: {
        latestUl: document.getElementById("latest-ul"),
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

    const timeH1 = document
      .getElementById("time")
      .getElementsByTagName("h1")[0];
    const startTime = Date.now();

    log("run begun!");

    const tick = () => {
      const elapsedTime = Date.now() - startTime;
      timeH1.innerHTML =
        new Date(elapsedTime).toLocaleTimeString() +
        "." +
        (elapsedTime % 1000).toString().padStart(3, "0");
      if (everything.state.isRunning) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  } catch (error) {
    log(error, error.stack);
  }
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

    log("run ended!");
  } catch (error) {
    log(error, error.stack);
  }
};

const log = (...args) => {
  try {
    args.forEach((arg) => {
      try {
        document.getElementById("log").innerHTML +=
          `<p>${new Date().toLocaleTimeString()}: ${arg}</p>`;
      } catch (error) {
        log(error, error.stack);
      }
    });
  } catch (error) {
    log(error, error.stack);
  }
};

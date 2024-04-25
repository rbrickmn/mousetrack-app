(() => {
  const elHardwareCursor = document.getElementById("wanthardwarecursor");
  const elUseRAFTime = document.getElementById("useraftime");
  const elWantGraph = document.getElementById("wantgraph");
  const elWantEventNow = document.getElementById("wanteventnow");
  const elWantMousePath = document.getElementById("wantmousepath");
  let can = document.getElementById("can");
  let a = [];
  let lastT = 0;
  let tLastAnimate = 0;
  let info = "";
  const perf = window.performance;

  //--------------------------------------------------------------------------------
  const tick = () => perf.now();
  //--------------------------------------------------------------------------------
  const onMouseMove = (e) => {
    onMove(e.timeStamp, e.clientX, e.clientY);
  };
  //--------------------------------------------------------------------------------
  const onTouchMove = (e) => {
    e.preventDefault();
    const touches = e.changedTouches;
    const t = touches ? touches[0] : null;
    if (t) {
      onMove(e.timeStamp, t.clientX, t.clientY);
    }
  };
  //--------------------------------------------------------------------------------
  const onMove = (ets, clientX, clientY) => {
    const ts = elWantEventNow.checked ? tick() : ets;
    info = "average small delta=" + getAve().toFixed(2) + "ms";
    const r = can.getBoundingClientRect();
    const x = ((clientX - r.left) / (r.right - r.left)) * can.width;
    const y = ((clientY - r.top) / (r.bottom - r.top)) * can.height;
    a.push({ t: ts, x: x, y: y, off: ts - tLastAnimate, delta: ts - lastT });
    lastT = ts;
    while (ts - a[0].t >= 1000) {
      a.shift();
    }
  };
  //--------------------------------------------------------------------------------
  const getAve = () => {
    let dsum = 0;
    let dnum = 0;
    for (let loop = 1; loop < a.length; ++loop) {
      const delta = a[loop].t - a[loop - 1].t;
      if (delta < 20) {
        dsum += delta;
        ++dnum;
      }
    }
    return dnum ? dsum / dnum : 0;
  };
  //--------------------------------------------------------------------------------
  const getMouseDistance = (ms) => {
    const now = tick();
    let l1 = a.length - 1;
    while (l1 > 0 && now - a[l1].t < 80) {
      --l1;
    }
    if (l1 > 0) {
      const a1 = a[l1];
      const a2 = a[a.length - 1];
      return {
        x: ((a2.x - a1.x) / (a2.t - a1.t)) * ms,
        y: ((a2.y - a1.y) / (a2.t - a1.t)) * ms,
      };
    }
    return { x: 0, y: 0 };
  };

  //--------------------------------------------------------------------------------
  const animate = (tAnimate) => {
    const prev = tLastAnimate;
    tLastAnimate = elUseRAFTime.checked ? tAnimate : tick();
    const ofd = prev ? getMouseDistance(tLastAnimate - prev) : null;

    window.requestAnimationFrame(animate);

    doHardwareCursorWork();

    const ctx = can.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, can.width, can.height);

    // info line at top
    ctx.fillStyle = "#333333";
    ctx.font = "14px Poppins";
    ctx.textAlign = "left";
    ctx.fillText(
      a.length > 3
        ? a.length +
            " mouse events in " +
            (a[a.length - 1].t - a[0].t).toFixed(1) +
            "ms -- " +
            info
        : "INSTRUCTIONS: Move mouse around in this window",
      10,
      20
    );

    if (a.length > 0) {
      if (ofd) {
        // blue circle at one frame distance
        const jj = getMouseDistance(
          Math.max(0, tLastAnimate - a[a.length - 1].t)
        );
        const mx = a[a.length - 1].x + jj.x;
        const my = a[a.length - 1].y + jj.y;
        ctx.beginPath();
        ctx.arc(
          mx + 0.5,
          my + 0.5,
          2 * Math.sqrt(ofd.x * ofd.x + ofd.y * ofd.y),
          0,
          2 * Math.PI,
          false
        );
        ctx.strokeStyle = "#ff0000";
        ctx.stroke();
        // red box at last location
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(mx - 4 + 0.5, my - 4 + 0.5, 8, 8);
      }

      // mouse path
      if (elWantMousePath.checked) {
        ctx.beginPath();
        ctx.moveTo(a[0].x, a[0].y);
        for (let loop = 1; loop < a.length; ++loop) {
          const i = a[loop];
          ctx.lineTo(i.x, i.y);
        }
        ctx.strokeStyle = "#800080";
        ctx.stroke();
      }

      if (elWantGraph.checked) {
        const SCALE = 5;

        // polyline offsets from rAF
        ctx.beginPath();
        for (let loop = 0; loop < a.length; ++loop) {
          const i = a[loop];
          ctx.lineTo(loop * 5, can.height - i.off * SCALE);
        }
        ctx.strokeStyle = "#808080";
        ctx.stroke();

        // horizontal lines at 5/10/15/20 ms
        ctx.beginPath();
        ctx.setLineDash([5, 3]);
        ctx.strokeStyle = "#E0E0E0";
        ctx.moveTo(0, can.height - 5 * SCALE);
        ctx.lineTo(can.width, can.height - 5 * SCALE);
        ctx.moveTo(0, can.height - 10 * SCALE);
        ctx.lineTo(can.width, can.height - 10 * SCALE);
        ctx.moveTo(0, can.height - 15 * SCALE);
        ctx.lineTo(can.width, can.height - 15 * SCALE);
        ctx.moveTo(0, can.height - 20 * SCALE);
        ctx.lineTo(can.width, can.height - 20 * SCALE);
        ctx.stroke();

        // polyline deltas
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = "#0000FF";
        ctx.moveTo(0, can.height);
        for (let loop = 0; loop < a.length; ++loop) {
          const i = a[loop];
          ctx.lineTo(loop * 5, can.height - i.delta * SCALE);
        }
        ctx.stroke();
      }
    }
  };
  //--------------------------------------------------------------------------------
  const doHardwareCursorWork = () => {
    const hwWant = elHardwareCursor.checked ? "auto" : "none";
    if (hwWant != can.style.cursor) {
      can.style.cursor = hwWant;
    }
  };
  //--------------------------------------------------------------------------------
  const init = () => {
    can.addEventListener("mousemove", onMouseMove, false);
    can.addEventListener("touchmove", onTouchMove, true);
    animate();
  };

  init();
})();

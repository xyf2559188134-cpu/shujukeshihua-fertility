/* 数字里的生育 — 图表与交互 */
(function () {
  "use strict";
  var D = window.DATA;
  var FONT = '-apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
  var C = {
    male: "#3a6f93", female: "#cf5b3f", accent: "#b5402a", gold: "#c08a2d",
    ink: "#1a1714", muted: "#7c7468", line: "#e7e0d5", grid: "#efe9df"
  };
  var charts = [];
  function reg(c) { charts.push(c); return c; }
  function fmtWan(n) { return (n / 10000).toFixed(0); }

  /* ---------------- HERO 数字动画 ---------------- */
  function heroCount() {
    var el = document.getElementById("heroNum");
    if (!el) return;
    var from = 105, to = 118, dur = 1400, t0 = null, started = false;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = "118";
    }
    setTimeout(function () { if (!started) { started = true; requestAnimationFrame(step); } }, 1000);
  }

  /* ---------------- A1 象形图（性别比） ---------------- */
  function pictogram(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var cols = 25, F = 100, M = 118, extra = M - F;
    var unit = 4, ps = 3.1;
    var fRows = Math.ceil(F / cols), mRows = Math.ceil(M / cols);
    var W = cols * unit;
    var labelH = 6;
    var y0 = labelH, fH = fRows * unit, gap = 10;
    var mY = y0 + fH + gap + labelH;
    var H = mY + mRows * unit + 2;
    function people(count, sy, color, hiFrom, hiColor) {
      var s = "";
      for (var i = 0; i < count; i++) {
        var r = Math.floor(i / cols), c = i % cols;
        var col = (hiFrom != null && i >= hiFrom) ? hiColor : color;
        s += '<use href="#pp" x="' + (c * unit) + '" y="' + (sy + r * unit) + '" width="' + ps + '" height="' + ps + '" fill="' + col + '"/>';
      }
      return s;
    }
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" xmlns="http://www.w3.org/2000/svg" style="font-family:' + FONT + '">' +
      '<defs><symbol id="pp" viewBox="0 0 24 24"><circle cx="12" cy="6.2" r="4.3"/><path d="M3.5 23 C3.5 15 8 12.5 12 12.5 C16 12.5 20.5 15 20.5 23 Z"/></symbol></defs>' +
      '<text x="0" y="3.6" font-size="3.4" font-weight="700" fill="' + C.female + '">每 100 个女孩</text>' +
      people(F, y0, C.female) +
      '<text x="0" y="' + (mY - 2.2) + '" font-size="3.4" font-weight="700" fill="' + C.male + '">对应 118 个男孩</text>' +
      '<text x="' + (W) + '" y="' + (mY - 2.2) + '" text-anchor="end" font-size="3.2" font-weight="700" fill="' + C.accent + '">多出的 18 个 →</text>' +
      people(M, mY, C.male, F, C.accent) +
      '</svg>';
    el.innerHTML = svg;
    el.style.height = "auto";
  }

  /* ---------------- A2 斜率图（出生→存活 性别比） ---------------- */
  function chartA2(id) {
    var s = D.national_sex;
    var c = reg(echarts.init(document.getElementById(id)));
    c.setOption({
      textStyle: { fontFamily: FONT },
      grid: { left: 60, right: 120, top: 40, bottom: 40 },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category", data: ["活产子女", "存活子女"], boundaryGap: true,
        axisLine: { lineStyle: { color: C.line } }, axisLabel: { color: C.ink, fontSize: 14, fontWeight: 600 }
      },
      yAxis: {
        type: "value", min: 100, max: 122, name: "男孩 / 100女孩",
        nameTextStyle: { color: C.muted }, axisLabel: { color: C.muted },
        splitLine: { lineStyle: { color: C.grid } }
      },
      series: [
        {
          type: "line", data: [s.srb_born, s.srb_surv], symbolSize: 11, lineStyle: { width: 4, color: C.accent }, itemStyle: { color: C.accent },
          label: { show: true, position: "top", fontWeight: 700, color: C.accent, fontSize: 16, formatter: "{c}" },
          markLine: {
            silent: true, symbol: "none", data: [{ yAxis: 105 }],
            lineStyle: { type: "dashed", color: C.muted }, label: { formatter: "自然值 105", color: C.muted, position: "end" }
          },
          markPoint: {
            symbol: "rect", symbolSize: 0,
            data: [{ coord: [1, s.srb_surv], value: "女婴存活率反而更高\n97.93% > 97.22%", label: { show: true, position: "right", color: C.male, fontSize: 12, fontWeight: 600, offset: [10, 0] } }]
          }
        }
      ]
    });
  }

  /* ---------------- A3 分歧条形（民族性别比） ---------------- */
  function chartA3(id) {
    var arr = D.ethnic_srb.slice().sort(function (a, b) { return a.srb - b.srb; });
    var c = reg(echarts.init(document.getElementById(id)));
    c.setOption({
      textStyle: { fontFamily: FONT },
      grid: { left: 70, right: 50, top: 20, bottom: 30 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: function (v) { return v + " ∶100"; } },
      xAxis: { type: "value", min: 100, max: 125, splitLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.muted } },
      yAxis: { type: "category", data: arr.map(function (d) { return d.name; }), axisLine: { lineStyle: { color: C.line } }, axisLabel: { color: C.ink, fontSize: 13 } },
      series: [{
        type: "bar", data: arr.map(function (d) {
          var t = Math.max(0, Math.min(1, (d.srb - 107) / 15));
          var col = echarts.color.lerp(t, ["#7fae8e", C.gold, C.accent]);
          return { value: d.srb, itemStyle: { color: col, borderRadius: [0, 4, 4, 0] } };
        }),
        barWidth: "62%",
        label: { show: true, position: "right", color: C.ink, fontSize: 12, formatter: "{c}" },
        markLine: { silent: true, symbol: "none", data: [{ xAxis: 105 }], lineStyle: { type: "dashed", color: C.muted, width: 1.5 }, label: { formatter: "自然 105", color: C.muted, position: "start" } }
      }]
    });
  }

  /* ---------------- B1 中国地图（早育率） ---------------- */
  function chartB1(id) {
    echarts.registerMap("china", window.CHINA_GEOJSON);
    var feats = window.CHINA_GEOJSON.features.map(function (f) { return f.properties.name; });
    function full(short) {
      for (var i = 0; i < feats.length; i++) if (feats[i].indexOf(short) === 0) return feats[i];
      return short;
    }
    var data = D.provinces.filter(function (p) { return p.name !== "全国"; })
      .map(function (p) { return { name: full(p.name), value: p.teen, short: p.name }; });
    var c = reg(echarts.init(document.getElementById(id)));
    c.setOption({
      textStyle: { fontFamily: FONT },
      tooltip: { trigger: "item", formatter: function (o) { return (o.data ? o.data.short : o.name) + "<br/>15-19岁生育率：<b>" + (o.value || "—") + "‰</b>"; } },
      visualMap: {
        min: 0, max: 25, left: 20, bottom: 30, text: ["高 ‰", "低"],
        inRange: { color: ["#f2ede3", "#e9c98f", "#d98a3d", C.accent, "#7a1f12"] },
        textStyle: { color: C.muted }, calculable: true
      },
      series: [{
        type: "map", map: "china", roam: false, data: data,
        label: { show: false }, itemStyle: { borderColor: "#fff", borderWidth: .6, areaColor: "#f4efe7" },
        emphasis: { label: { show: true, color: C.ink }, itemStyle: { areaColor: "#f8e3b0" } }
      }]
    });
  }

  /* ---------------- B2 棒棒糖图（总和生育率） ---------------- */
  function chartB2(id) {
    var arr = D.provinces.filter(function (p) { return p.name !== "全国"; })
      .slice().sort(function (a, b) { return a.tfr - b.tfr; });
    var names = arr.map(function (d) { return d.name; });
    var c = reg(echarts.init(document.getElementById(id)));
    c.setOption({
      textStyle: { fontFamily: FONT },
      grid: { left: 64, right: 40, top: 16, bottom: 30 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: function (v) { return v + " 孩/人"; } },
      xAxis: { type: "value", min: 0.6, max: 2.3, splitLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.muted } },
      yAxis: { type: "category", data: names, axisLine: { lineStyle: { color: C.line } }, axisLabel: { color: C.ink, fontSize: 11 }, axisTick: { show: false } },
      series: [
        {
          type: "bar", data: arr.map(function (d) { return d.tfr; }), barWidth: 2.5,
          itemStyle: { color: C.line }, silent: true, z: 1
        },
        {
          type: "scatter", symbolSize: 11, z: 2,
          data: arr.map(function (d) {
            var t = Math.max(0, Math.min(1, (d.tfr - 0.7) / 1.4));
            return { value: d.tfr, itemStyle: { color: echarts.color.lerp(t, [C.male, C.gold, C.accent]) } };
          }),
          markLine: { silent: true, symbol: "none", data: [{ xAxis: 2.1 }], lineStyle: { type: "dashed", color: C.accent }, label: { formatter: "更替水平 2.1", color: C.accent, position: "insideEndTop" } }
        }
      ]
    });
  }

  /* ---------------- B3 多线折线（年龄别生育率） ---------------- */
  function chartB3(id) {
    var ages = ["15-19", "20-24", "25-29", "30-34", "35-39", "40-44", "45-49"];
    var pick = { "全国": C.muted, "北京": C.male, "贵州": C.accent };
    function row(n) { return D.provinces.find(function (p) { return p.name === n; }); }
    var series = Object.keys(pick).map(function (n) {
      return {
        name: n, type: "line", smooth: true, data: row(n).curve,
        symbolSize: 6, lineStyle: { width: n === "全国" ? 2 : 3.5, type: n === "全国" ? "dashed" : "solid", color: pick[n] },
        itemStyle: { color: pick[n] },
        endLabel: { show: true, formatter: "{a}", color: pick[n], fontWeight: 700 }
      };
    });
    var c = reg(echarts.init(document.getElementById(id)));
    c.setOption({
      textStyle: { fontFamily: FONT },
      grid: { left: 50, right: 70, top: 30, bottom: 40 },
      tooltip: { trigger: "axis" },
      legend: { data: Object.keys(pick), top: 0, textStyle: { color: C.ink } },
      xAxis: { type: "category", boundaryGap: false, data: ages, name: "年龄组", axisLine: { lineStyle: { color: C.line } }, axisLabel: { color: C.muted } },
      yAxis: { type: "value", name: "生育率 ‰", nameTextStyle: { color: C.muted }, splitLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.muted } },
      series: series
    });
  }

  /* ---------------- C1 切换条形（基数陷阱） ---------------- */
  var c1chart = null, c1mode = "count";
  function chartC1(id) {
    var edu = D.education;
    var names = edu.map(function (d) { return d.name; });
    c1chart = reg(echarts.init(document.getElementById(id)));
    renderC1();
    var box = document.getElementById("c1toggle");
    if (box) box.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      c1mode = b.getAttribute("data-mode");
      [].forEach.call(box.querySelectorAll("button"), function (x) { x.classList.toggle("on", x === b); });
      renderC1();
    });
    function renderC1() {
      var isCount = c1mode === "count";
      var vals = edu.map(function (d) { return isCount ? d.high3plus : d.mean; });
      var mx = Math.max.apply(null, vals);
      c1chart.setOption({
        textStyle: { fontFamily: FONT },
        grid: { left: 56, right: 30, top: 30, bottom: 70 },
        tooltip: {
          trigger: "axis", axisPointer: { type: "shadow" },
          valueFormatter: function (v) { return isCount ? (v / 10000).toFixed(1) + " 万人" : v + " 个/人"; }
        },
        xAxis: { type: "category", data: names, axisLine: { lineStyle: { color: C.line } }, axisLabel: { color: C.ink, fontSize: 12, interval: 0, rotate: 32 } },
        yAxis: {
          type: "value", name: isCount ? "生育≥3孩的女性（人）" : "人均活产子女数",
          nameTextStyle: { color: C.muted }, splitLine: { lineStyle: { color: C.grid } },
          axisLabel: { color: C.muted, formatter: isCount ? function (v) { return v / 10000 + "万"; } : "{value}" }
        },
        series: [{
          type: "bar", data: edu.map(function (d, i) {
            var v = vals[i];
            var hi = isCount ? (d.name === "小学" || d.name === "初中") : (d.name === "未上过学");
            return { value: v, itemStyle: { color: hi ? C.accent : C.male, borderRadius: [4, 4, 0, 0] } };
          }),
          barWidth: "55%",
          label: { show: true, position: "top", color: C.muted, fontSize: 11, formatter: function (p) { return isCount ? (p.value / 10000).toFixed(0) + "万" : p.value; } }
        }]
      }, true);
    }
  }

  /* ---------------- C2 热力图（教育×孩次） ---------------- */
  function chartC2(id) {
    var edu = D.education;
    var parity = ["0个", "1个", "2个", "3个", "4个", "5个+"];
    var eduNames = edu.map(function (d) { return d.name; });
    var data = [];
    edu.forEach(function (d, yi) {
      d.share.forEach(function (v, xi) { data.push([xi, yi, v]); });
    });
    var c = reg(echarts.init(document.getElementById(id)));
    c.setOption({
      textStyle: { fontFamily: FONT },
      grid: { left: 86, right: 24, top: 20, bottom: 70 },
      tooltip: { position: "top", formatter: function (o) { return eduNames[o.value[1]] + " · 生" + parity[o.value[0]] + "：<b>" + o.value[2] + "%</b>"; } },
      xAxis: { type: "category", data: parity, splitArea: { show: true }, axisLabel: { color: C.ink }, axisLine: { lineStyle: { color: C.line } } },
      yAxis: { type: "category", data: eduNames, splitArea: { show: true }, axisLabel: { color: C.ink, fontSize: 12 }, axisLine: { lineStyle: { color: C.line } } },
      visualMap: {
        min: 0, max: 55, calculable: true, orient: "horizontal", left: "center", bottom: 6,
        inRange: { color: ["#f7f3ec", "#e9c98f", "#d98a3d", C.accent] }, textStyle: { color: C.muted }
      },
      series: [{
        type: "heatmap", data: data,
        label: { show: true, color: "#3a2f24", fontSize: 11, formatter: function (o) { return o.value[2] >= 3 ? o.value[2] : ""; } },
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: "rgba(0,0,0,.2)" } }
      }]
    });
  }

  /* ---------------- 早育×孩次（堆叠柱：法定婚龄之前） ---------------- */
  function chartTeen(id) {
    var t = D.teen_parity.by_age;
    var ages = t.map(function (d) { return d.age + "岁"; });
    var mkLabel = function (min) {
      return { show: true, position: "inside", color: "#fff", fontSize: 11, fontWeight: 600, formatter: function (p) { return p.value >= min ? p.value : ""; } };
    };
    var c = reg(echarts.init(document.getElementById(id)));
    c.setOption({
      textStyle: { fontFamily: FONT },
      grid: { left: 56, right: 30, top: 44, bottom: 36 },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { data: ["第一孩", "第二孩", "第三孩及以上"], top: 0, textStyle: { color: C.ink } },
      xAxis: { type: "category", data: ages, axisLine: { lineStyle: { color: C.line } }, axisLabel: { color: C.ink, fontSize: 13 } },
      yAxis: { type: "value", name: "当年出生数（抽样）", nameTextStyle: { color: C.muted }, splitLine: { lineStyle: { color: C.grid } }, axisLabel: { color: C.muted } },
      series: [
        { name: "第一孩", type: "bar", stack: "x", data: t.map(function (d) { return d.p1; }), itemStyle: { color: "#b9c6cf" }, label: mkLabel(2000) },
        { name: "第二孩", type: "bar", stack: "x", data: t.map(function (d) { return d.p2; }), itemStyle: { color: C.gold }, label: mkLabel(300) },
        { name: "第三孩及以上", type: "bar", stack: "x", data: t.map(function (d) { return d.p3; }), itemStyle: { color: C.accent }, label: { show: true, position: "right", color: C.accent, fontSize: 11, fontWeight: 700, formatter: function (p) { return p.value >= 40 ? "三孩+ " + p.value : ""; } } }
      ]
    });
  }

  /* ---------------- 调度：滚动揭示 + 懒加载图表 ---------------- */
  var initFns = {
    c_a1: pictogram, c_a2: chartA2, c_a3: chartA3,
    c_b1: chartB1, c_teen: chartTeen, c_b2: chartB2, c_b3: chartB3,
    c_c1: chartC1, c_c2: chartC2
  };
  var done = {};
  function tryInit(id) {
    if (done[id]) return; done[id] = true;
    try { initFns[id](id); } catch (e) { console.error("chart " + id + " 失败", e); }
  }

  document.addEventListener("DOMContentLoaded", function () {
    heroCount();
    // reveal
    var revObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    [].forEach.call(document.querySelectorAll(".reveal"), function (el) { revObs.observe(el); });
    // charts lazy
    var chObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { tryInit(e.target.id); chObs.unobserve(e.target); } });
    }, { rootMargin: "120px" });
    Object.keys(initFns).forEach(function (id) { var el = document.getElementById(id); if (el) chObs.observe(el); });
  });

  window.addEventListener("resize", function () { charts.forEach(function (c) { c && c.resize && c.resize(); }); });
})();

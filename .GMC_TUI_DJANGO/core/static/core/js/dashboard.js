(() => {
  const chartRegistry = {};
  const GMC_BRAND = {
    matteGrey: "#4A4E52",
    verdeScandal: "#D0FF00",
    carbonBlack: "#0A0A0A",
    metallicSilver: "#C0C0C0",
    paleSilver: "#D8D8D8",
  };

  function readJSON(scriptId) {
    const node = document.getElementById(scriptId);
    if (!node) {
      return null;
    }
    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      console.error(`Invalid JSON for ${scriptId}`, error);
      return null;
    }
  }

  function baseOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: GMC_BRAND.metallicSilver,
            font: {
              family: "JetBrains Mono",
              size: 10,
            },
          },
        },
        tooltip: {
          titleFont: { family: "JetBrains Mono", size: 11 },
          bodyFont: { family: "JetBrains Mono", size: 10 },
          backgroundColor: GMC_BRAND.carbonBlack,
          borderColor: GMC_BRAND.matteGrey,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: {
            color: GMC_BRAND.metallicSilver,
            font: { family: "JetBrains Mono", size: 10 },
          },
          grid: {
            color: "rgba(74, 78, 82, 0.22)",
          },
        },
        y: {
          ticks: {
            color: GMC_BRAND.metallicSilver,
            font: { family: "JetBrains Mono", size: 10 },
          },
          grid: {
            color: "rgba(74, 78, 82, 0.22)",
          },
        },
      },
    };
  }

  function upsertChart(chartKey, canvasId, type, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      return;
    }

    if (chartRegistry[chartKey]) {
      chartRegistry[chartKey].destroy();
    }

    chartRegistry[chartKey] = new Chart(canvas, {
      type,
      data,
      options: {
        ...baseOptions(),
        ...options,
      },
    });
  }

  window.initDashboardCharts = function initDashboardCharts() {
    const composition = readJSON("composition-chart-data");
    if (composition) {
      upsertChart(
        "compositionChart",
        "compositionChart",
        "doughnut",
        {
          labels: composition.labels,
          datasets: [
            {
              data: composition.values,
              backgroundColor: composition.colors,
              borderColor: "#141a24",
              borderWidth: 2,
            },
          ],
        },
        {
          cutout: "58%",
          scales: {},
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        }
      );
    }

    const targetData = readJSON("target-chart-data");
    if (targetData) {
      upsertChart("targetCurrentChart", "targetCurrentChart", "bar", {
        labels: targetData.labels,
        datasets: [
          {
            label: "Current",
            data: targetData.current,
            backgroundColor: "#4CC9F0",
          },
          {
            label: "Target",
            data: targetData.target,
            backgroundColor: "#7AE582",
          },
        ],
      });
    }
  };

  window.initPortfolioChart = function initPortfolioChart() {
    const driftData = readJSON("drift-chart-data");
    if (!driftData) {
      return;
    }

    upsertChart("allocationDriftChart", "allocationDriftChart", "bar", {
      labels: driftData.labels,
      datasets: [
        {
          label: "Drift %",
          data: driftData.values,
          backgroundColor: driftData.values.map((value) => {
            if (value > 0) return GMC_BRAND.verdeScandal;
            if (value < 0) return GMC_BRAND.metallicSilver;
            return GMC_BRAND.matteGrey;
          }),
          borderColor: GMC_BRAND.carbonBlack,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    }, {
      plugins: {
        legend: {
          labels: {
            color: GMC_BRAND.paleSilver,
          },
        },
      },
    });
  };

  window.initMacroChart = function initMacroChart() {
    const trendData = readJSON("macro-trend-data");
    if (!trendData) {
      return;
    }

    upsertChart("macroTrendChart", "macroTrendChart", "line", {
      labels: trendData.labels,
      datasets: trendData.datasets.map((dataset) => ({
        ...dataset,
        borderWidth: 2,
        tension: 0.25,
        pointRadius: 2,
      })),
    });
  };

  window.initRealEstateChart = function initRealEstateChart() {
    const valueData = readJSON("real-estate-chart-data");
    if (!valueData) {
      return;
    }

    upsertChart("realEstateValueChart", "realEstateValueChart", "bar", {
      labels: valueData.labels,
      datasets: [
        {
          label: "Market",
          data: valueData.market,
          backgroundColor: "#4CC9F0",
        },
        {
          label: "Tax",
          data: valueData.tax,
          backgroundColor: "#F72585",
        },
      ],
    });
  };
})();

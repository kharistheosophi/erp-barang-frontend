export const getAnalyticsReports = () => {
  return {
    series: [
      {
        name: "Users",
        data: [10, 41, 35, 51, 49, 62, 69],
      },
    ],
    options: {
      chart: { toolbar: { show: false } },
      xaxis: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
    },
  }
}

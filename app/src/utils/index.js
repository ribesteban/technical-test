export function getMonths(count = 20) {
  const arr = [];
  var d = new Date();
  for (let i = 0; i < count; i++) {
    arr.push(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1)));
  }
  return arr;
}

export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatDateDMY(date) {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR");
}

export const getColorStatus = (status) => {
  switch (status) {
    case "pending":
      return "#ff4400";
    case "in_progress":
      return "#ff9900";
    case "done":
      return "#25b800";
    default:
      return "#000";
  }
};

const now = new Date();
const todayAt7AM = new Date(
  Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() - 1,
    7,
    0,
    0,
    0
  )
);

const utcSeconds = Math.floor(todayAt7AM.getTime() / 1000);
console.log("Today 7am UTC:", utcSeconds);

const tomorrowAt7AM = new Date(
  Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    7,
    0,
    0,
    0
  )
);

const utcSeconds2 = Math.floor(tomorrowAt7AM.getTime() / 1000);
console.log("Tomorrow 7am UTC:", utcSeconds2);

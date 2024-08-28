const REMAINING_TIME = 60;

const fetchBusData = async() => {
  try {
    const response = await fetch('/next-departure');

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching bus data ${error}`);
  }
};

const formatDate = date => date.toISOString().split('T')[0];
const formatTime = date => date.toTimeString().split(' ')[0].slice(0, 5);

const getRemainingSeconds = departureTime => {
  const now = new Date();
  const timeDeference = departureTime - now;

  return Math.floor(timeDeference / 1000);
}

const renderBusData = buses => {
  const tableBody = document.querySelector('#bus-table tbody');
  tableBody.textContent = '';

  buses.forEach(bus => {
    const row = document.createElement('tr');

    const nextDepartureDateTimeUTC = new Date (
      `${bus.nextDeparture.date}T${bus.nextDeparture.time}Z`
    );

    const remainingSeconds = getRemainingSeconds(nextDepartureDateTimeUTC);

    const remainingTimeTest = remainingSeconds < REMAINING_TIME ? 'Отправляется' : bus.nextDeparture.remaining;

    row.innerHTML = `
    <td>${bus.busNumber}</td>
    <td>${bus.startPoint} - ${bus.endPoint}</td>
    <td>${formatDate(nextDepartureDateTimeUTC)}</td>
    <td>${formatTime(nextDepartureDateTimeUTC)}</td>
    <td>${remainingTimeTest}</td>
    `;

    tableBody.append(row)
  });
};

const initWebSocket = () => {
  const ws = new WebSocket(`ws://${location.host}`);

  ws.addEventListener('open', () => {
    console.log('WebSocket connection');
  });

  ws.addEventListener('message', event => {
    const buses = JSON.parse(event.data);

    renderBusData(buses);
    updateCurrentTime();
  });

  ws.addEventListener('error', error => {
    console.log(`WebSocket error: ${error}`);
  });

  ws.addEventListener('close', error => {
    console.log('WebSocket connection close');
  });
};

const updateCurrentTime = () => {
  const currentTimeSpan = document.getElementById('current-time');

  const now = new Date();

  currentTimeSpan.textContent = now.toTimeString().split(' ')[0];
}

const init = async () => {
  const buses = await fetchBusData();

  renderBusData(buses);
  updateCurrentTime();
  initWebSocket();
}

init();
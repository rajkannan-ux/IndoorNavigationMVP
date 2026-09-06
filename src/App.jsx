import { useMemo, useState } from "react";
import "./App.css";

/*
============================================================
WAYFINDER - APARTMENT INDOOR NAVIGATION MVP
============================================================

Default starting point:
Main Entrance

Walkable areas:
Main Entrance → Foyer → Corridor → Room Doors

Rooms themselves are NOT walkable.

All navigation paths are orthogonal:
horizontal + vertical only.
============================================================
*/


/* ============================================================
   DESTINATIONS
============================================================ */

const places = {
  "Main Entrance": {
    node: "entrance",
    description: "Starting point",
  },

  "Bedroom 1": {
    node: "bedroom1Door",
    description: "Raj",
  },

  "Bedroom 2": {
    node: "bedroom2Door",
    description: "Das",
  },

  "Bedroom 3": {
    node: "bedroom3Door",
    description: "Jeswin",
  },

  Kitchen: {
    node: "kitchenDoor",
    description: "",
  },

  Bathroom: {
    node: "bathroomDoor",
    description: "",
  },
};


/* ============================================================
   WALKABLE MAP NODES

   Coordinates are based on the 1000 x 650 apartment map.
============================================================ */

const nodes = {

  /* Main entrance */

  entrance: [900, 650],

  /* Foyer */

  foyerBottom: [900, 570],
  foyerTop: [900, 380],

  /* Corridor */

  corridorRight: [795, 380],
  corridorBedroom1: [680, 380],
  corridorBathroom: [680, 420],
  corridorMiddle: [530, 380],
  corridorBedroom3: [390, 380],
  corridorKitchen: [365, 380],

  /* Room doors */

  bedroom1Door: [680, 300],
  bedroom2Door: [530, 300],
  bedroom3Door: [390, 300],

  kitchenDoor: [365, 350],

  bathroomDoor: [680, 420],
};


/* ============================================================
   WALKABLE CONNECTIONS

   IMPORTANT:
   Every connection is horizontal or vertical.
   There are NO diagonal connections.
============================================================ */

const connections = [

  /* Entrance → Foyer */

  ["entrance", "foyerBottom"],
  ["foyerBottom", "foyerTop"],

  /* Foyer → Corridor */

  ["foyerTop", "corridorRight"],

  /* Corridor */

  ["corridorRight", "corridorBedroom1"],
  ["corridorBedroom1", "corridorMiddle"],
  ["corridorMiddle", "corridorBedroom3"],
  ["corridorBedroom3", "corridorKitchen"],

  /* Bedroom 1 */

  ["corridorBedroom1", "bedroom1Door"],

  /* Bathroom */

  ["corridorBedroom1", "corridorBathroom"],
  ["corridorBathroom", "bathroomDoor"],

  /* Bedroom 2 */

  ["corridorMiddle", "bedroom2Door"],

  /* Bedroom 3 */

  ["corridorBedroom3", "bedroom3Door"],

  /* Kitchen */

  ["corridorKitchen", "kitchenDoor"],
];


/* ============================================================
   BUILD GRAPH
============================================================ */

function buildGraph() {

  const graph = {};

  Object.keys(nodes).forEach((node) => {
    graph[node] = [];
  });

  connections.forEach(([a, b]) => {

    const [x1, y1] = nodes[a];
    const [x2, y2] = nodes[b];

    const distance =
      Math.abs(x2 - x1) +
      Math.abs(y2 - y1);

    graph[a].push({
      node: b,
      distance,
    });

    graph[b].push({
      node: a,
      distance,
    });

  });

  return graph;
}

const graph = buildGraph();


/* ============================================================
   SHORTEST PATH
   DIJKSTRA
============================================================ */

function shortestPath(start, end) {

  if (start === end) {
    return [start];
  }

  const distance = {};
  const previous = {};
  const remaining = new Set(
    Object.keys(graph)
  );

  Object.keys(graph).forEach((node) => {
    distance[node] = Infinity;
    previous[node] = null;
  });

  distance[start] = 0;

  while (remaining.size > 0) {

    let current = null;
    let smallest = Infinity;

    remaining.forEach((node) => {

      if (distance[node] < smallest) {
        smallest = distance[node];
        current = node;
      }

    });

    if (current === null) {
      break;
    }

    remaining.delete(current);

    if (current === end) {
      break;
    }

    graph[current].forEach(
      ({ node, distance: edgeDistance }) => {

        if (!remaining.has(node)) {
          return;
        }

        const newDistance =
          distance[current] +
          edgeDistance;

        if (newDistance < distance[node]) {

          distance[node] = newDistance;
          previous[node] = current;

        }

      }
    );
  }


  const path = [];

  let current = end;

  while (current !== null) {

    path.unshift(current);

    current = previous[current];

  }


  if (path[0] !== start) {
    return [];
  }

  return path;
}


/* ============================================================
   PATH DISTANCE
============================================================ */

function getPathDistance(path) {

  let total = 0;

  for (let i = 1; i < path.length; i++) {

    const [x1, y1] = nodes[path[i - 1]];
    const [x2, y2] = nodes[path[i]];

    total +=
      Math.abs(x2 - x1) +
      Math.abs(y2 - y1);

  }

  return total;
}


/* ============================================================
   MULTIPLE DESTINATION OPTIMIZATION

   Small apartment = brute force is fine for MVP.
============================================================ */

function findBestOrder(
  startNode,
  destinations
) {

  if (destinations.length <= 1) {
    return destinations;
  }

  let bestOrder = null;
  let bestDistance = Infinity;


  function generate(
    currentOrder,
    remaining
  ) {

    if (remaining.length === 0) {

      let currentNode = startNode;
      let totalDistance = 0;


      currentOrder.forEach(
        (destination) => {

          const targetNode =
            places[destination].node;

          const path =
            shortestPath(
              currentNode,
              targetNode
            );

          totalDistance +=
            getPathDistance(path);

          currentNode = targetNode;

        }
      );


      if (totalDistance < bestDistance) {

        bestDistance = totalDistance;

        bestOrder = [
          ...currentOrder,
        ];

      }

      return;
    }


    remaining.forEach(
      (destination, index) => {

        const nextRemaining =
          [...remaining];

        nextRemaining.splice(index, 1);

        generate(
          [
            ...currentOrder,
            destination,
          ],
          nextRemaining
        );

      }
    );
  }


  generate([], destinations);

  return bestOrder || destinations;
}


/* ============================================================
   BUILD COMPLETE ROUTE
============================================================ */

function buildCompleteRoute(
  startNode,
  selectedDestinations
) {

  const ordered =
    findBestOrder(
      startNode,
      selectedDestinations
    );

  const completePath = [];

  let currentNode = startNode;


  ordered.forEach(
    (destination) => {

      const targetNode =
        places[destination].node;

      const path =
        shortestPath(
          currentNode,
          targetNode
        );


      path.forEach(
        (node, index) => {

          if (
            completePath.length === 0 ||
            index !== 0
          ) {

            completePath.push(node);

          }

        }
      );


      currentNode = targetNode;

    }
  );


  return {
    ordered,
    completePath,
  };
}


/* ============================================================
   APP
============================================================ */

function App() {

  /* Search */

  const [search, setSearch] =
    useState("");


  /* Starting point */

  const [startPoint, setStartPoint] =
    useState("Main Entrance");


  /* Selected destinations */

  const [
    selectedDestinations,
    setSelectedDestinations,
  ] = useState([]);


  /* Zoom */

  const [zoom, setZoom] =
    useState(1);


  /* ----------------------------------------------------------
     SEARCH SUGGESTIONS
  ---------------------------------------------------------- */

  const suggestions = useMemo(() => {

    if (!search.trim()) {
      return [];
    }


    return Object.keys(places)
      .filter(
        (name) =>
          name !== startPoint &&
          name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );

  }, [search, startPoint]);


  /* ----------------------------------------------------------
     ADD DESTINATION
  ---------------------------------------------------------- */

  function addDestination(destination) {

    if (
      !selectedDestinations.includes(
        destination
      )
    ) {

      setSelectedDestinations([
        ...selectedDestinations,
        destination,
      ]);

    }

    setSearch("");
  }


  /* ----------------------------------------------------------
     REMOVE DESTINATION
  ---------------------------------------------------------- */

  function removeDestination(destination) {

    setSelectedDestinations(
      selectedDestinations.filter(
        (item) =>
          item !== destination
      )
    );

  }


  /* ----------------------------------------------------------
     CHANGE START
  ---------------------------------------------------------- */

  function changeStartPoint(event) {

    const newStart =
      event.target.value;

    setStartPoint(newStart);

    /*
      If the new start was already
      selected as a destination,
      remove it.
    */

    setSelectedDestinations(
      selectedDestinations.filter(
        (destination) =>
          destination !== newStart
      )
    );

  }


  /* ----------------------------------------------------------
     CLEAR
  ---------------------------------------------------------- */

  function clearRoute() {

    setSelectedDestinations([]);

    setSearch("");

  }


  /* ----------------------------------------------------------
     CALCULATE ROUTE
  ---------------------------------------------------------- */

  const route = useMemo(() => {

    if (
      selectedDestinations.length === 0
    ) {
      return null;
    }


    const startNode =
      places[startPoint].node;


    return buildCompleteRoute(
      startNode,
      selectedDestinations
    );

  }, [
    startPoint,
    selectedDestinations,
  ]);


  /* ----------------------------------------------------------
     SVG ROUTE
  ---------------------------------------------------------- */

  const routePoints =
    route
      ? route.completePath
          .map(
            (node) =>
              nodes[node].join(",")
          )
          .join(" ")
      : "";


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <div className="app">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="top-bar">

        <div className="brand">

          <h1>WayFinder</h1>

          <p>
            Indoor Apartment Navigation
          </p>

        </div>


        {/* SEARCH */}

        <div className="search-area">

          <div className="search-box">

            <span className="search-icon">
              🔎
            </span>


            <input
              type="text"
              value={search}
              placeholder="Where do you want to go?"
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />


            {search && (

              <button
                className="clear-search"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>

            )}

          </div>


          {/* SUGGESTIONS */}

          {suggestions.length > 0 && (

            <div className="search-results">

              {suggestions.map(
                (destination) => (

                  <button
                    key={destination}
                    onClick={() =>
                      addDestination(
                        destination
                      )
                    }
                  >

                    <span className="suggestion-pin">
                      ●
                    </span>

                    <span className="suggestion-text">

                      {destination}

                    </span>

                  </button>

                )
              )}

            </div>

          )}

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="main-content">


        {/* ====================================================
            MAP
        ==================================================== */}

        <section className="map-card">


          <div className="map-header">

            <div>

              <h2>
                Apartment Layout
              </h2>

              <p>
                Select a starting point and destination
              </p>

            </div>


            {/* ZOOM */}

            <div className="zoom-controls">

              <button
                onClick={() =>
                  setZoom(
                    Math.min(
                      zoom + 0.15,
                      3
                    )
                  )
                }
              >
                +
              </button>


              <div className="zoom-level">

                {Math.round(
                  zoom * 100
                )}
                %

              </div>


              <button
                onClick={() =>
                  setZoom(
                    Math.max(
                      zoom - 0.15,
                      0.50
                    )
                  )
                }
              >
                −
              </button>

            </div>

          </div>


          {/* ==================================================
              MAP VIEWPORT
          ================================================== */}

          <div className="map-viewport">

            <div
              className="floor-plan"
              style={{
                transform:
                  `scale(${zoom})`,
              }}
            >


              {/* =================================================
                  ROUTE
              ================================================= */}

              {route && (

                <svg
                  className="route-layer"
                  viewBox="0 0 1000 650"
                  preserveAspectRatio="none"
                >

                  {/* White outline */}

                  <polyline
                    points={routePoints}
                    fill="none"
                    stroke="white"
                    strokeWidth="15"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />


                  {/* Blue route */}

                  <polyline
                    points={routePoints}
                    fill="none"
                    stroke="#1976d2"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />


                  {/* Direction dots */}

                  {route.completePath
                    .slice(0, -1)
                    .map(
                      (node, index) => {

                        const nextNode =
                          route
                            .completePath[
                              index + 1
                            ];


                        const [x1, y1] =
                          nodes[node];

                        const [x2, y2] =
                          nodes[nextNode];


                        const distance =
                          Math.abs(
                            x2 - x1
                          ) +
                          Math.abs(
                            y2 - y1
                          );


                        if (
                          distance < 50
                        ) {
                          return null;
                        }


                        const midX =
                          (x1 + x2) / 2;

                        const midY =
                          (y1 + y2) / 2;


                        return (

                          <circle
                            key={
                              `${node}-${index}`
                            }
                            cx={midX}
                            cy={midY}
                            r="4"
                            fill="white"
                          />

                        );

                      }
                    )}

                </svg>

              )}


              {/* =================================================
                  BEDROOM 3
              ================================================= */}

              <div className="room bedroom3">

                <div>

                  <h3>
                    Bedroom 3
                  </h3>

                  <p>
                    Jeswin
                  </p>

                </div>

              </div>


              {/* =================================================
                  BEDROOM 2
              ================================================= */}

              <div className="room bedroom2">

                <div>

                  <h3>
                    Bedroom 2
                  </h3>

                  <p>
                    Das
                  </p>

                </div>

              </div>


              {/* =================================================
                  BEDROOM 1
              ================================================= */}

              <div className="room bedroom1">

                <div>

                  <h3>
                    Bedroom 1
                  </h3>

                  <p>
                    Raj
                  </p>

                </div>

              </div>


              {/* =================================================
                  KITCHEN
              ================================================= */}

              <div className="room kitchen">

                <h3>
                  Kitchen
                </h3>

              </div>


              {/* =================================================
                  CORRIDOR
              ================================================= */}

              <div className="corridor">

                <span>
                  Corridor
                </span>

              </div>


              {/* =================================================
                  BATHROOM
              ================================================= */}

              <div className="room bathroom">

                <h3>
                  Bathroom
                </h3>

              </div>


              {/* =================================================
                  FOYER
              ================================================= */}

              <div className="foyer">

                <span>
                  Foyer
                </span>

              </div>


              {/* =================================================
                  ROOM DOORS
              ================================================= */}

              <div className="door bedroom3-door">
                <span />
              </div>


              <div className="door bedroom2-door">
                <span />
              </div>


              <div className="door bedroom1-door">
                <span />
              </div>


              <div className="door kitchen-door">
                <span />
              </div>


              <div className="door bathroom-door">
                <span />
              </div>


              {/* =================================================
                  MAIN ENTRANCE
              ================================================= */}

              <div className="main-entrance">

                <div className="entrance-door">

                  <div className="door-panel" />

                  <div className="door-handle" />

                </div>


                <div className="entrance-text">

                  Main Entrance

                </div>

              </div>


              {/* =================================================
                  DESTINATION MARKERS
              ================================================= */}

              {route &&
                route.ordered.map(
                  (destination, index) => {

                    const node =
                      places[
                        destination
                      ].node;

                    const [x, y] =
                      nodes[node];


                    return (

                      <div
                        key={destination}
                        className="destination-marker"
                        style={{
                          left:
                            x - 15,
                          top:
                            y - 15,
                        }}
                      >

                        {index + 1}

                      </div>

                    );

                  }
                )}

            </div>

          </div>

        </section>


        {/* ====================================================
            NAVIGATION PANEL
        ==================================================== */}

        <section className="navigation-panel">


          <div className="navigation-heading">

            <div>

              <h2>
                Navigation
              </h2>

              <p>
                Choose your starting point
                and destinations.
              </p>

            </div>


            {selectedDestinations.length >
              0 && (

              <button
                className="clear-button"
                onClick={clearRoute}
              >
                Clear all
              </button>

            )}

          </div>


          {/* ==================================================
              STARTING POINT
          ================================================== */}

          <div className="start-selector">

            <label>
              Starting point
            </label>


            <select
              value={startPoint}
              onChange={
                changeStartPoint
              }
            >

              {Object.keys(places).map(
                (place) => (

                  <option
                    key={place}
                    value={place}
                  >
                    {place}
                  </option>

                )
              )}

            </select>

          </div>


          {/* ==================================================
              SELECTED DESTINATIONS
          ================================================== */}

          {route && (

            <div className="route-list">


              <div className="route-step">

                <div className="step-number start-number">
                  🚪
                </div>


                <div className="step-content">

                  <strong>
                    {startPoint}
                  </strong>

                  <small>
                    Starting point
                  </small>

                </div>

              </div>


              {route.ordered.map(
                (destination, index) => (

                  <div
                    className="route-step"
                    key={destination}
                  >

                    <div className="step-number">

                      {index + 1}

                    </div>


                    <div className="step-content">

                      <strong>
                        {destination}
                      </strong>


                      {places[
                        destination
                      ].description && (

                        <small>

                          {
                            places[
                              destination
                            ].description
                          }

                        </small>

                      )}

                    </div>


                    <button
                      className="remove-button"
                      onClick={() =>
                        removeDestination(
                          destination
                        )
                      }
                    >
                      ×
                    </button>

                  </div>

                )
              )}

            </div>

          )}


          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {!route && (

            <div className="empty-route">

              <div className="empty-icon">
                🔎
              </div>

              <strong>
                Search for a destination
              </strong>

              <small>
                Choose a room from the search
                bar above.
              </small>

            </div>

          )}


          {/* ==================================================
              ADD MORE
          ================================================== */}

          {selectedDestinations.length >
            0 && (

            <div className="add-target">

              <span>
                ＋
              </span>


              <div>

                <strong>
                  Add another destination
                </strong>

                <small>
                  Use the search bar above
                  to add another room.
                </small>

              </div>

            </div>

          )}

        </section>

      </main>

    </div>

  );
}

export default App;
import { useMemo, useState } from "react";
import "./App.css";

const places = {
  "Main Entrance": {
    node: "entrance",
    description: "Starting point",
  },
  "Raj Bedroom": {
    node: "rajBedroomDoor",
    description: "Raj",
  },
  "Das Bedroom": {
    node: "dasBedroomDoor",
    description: "Das",
  },
  "Babu Bedroom": {
    node: "babuBedroomDoor",
    description: "Babu",
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

const nodes = {
  entrance: [900, 720],

  foyerBottom: [900, 620],
  foyerTop: [900, 430],

  corridorRight: [760, 430],
  corridorRaj: [720, 430],
  corridorBathroom: [660, 430],
  corridorDas: [560, 430],
  corridorBabu: [450, 430],
  corridorKitchen: [410, 430],

  rajBedroomDoor: [720, 360],
  dasBedroomDoor: [560, 360],
  babuBedroomDoor: [450, 360],

  kitchenDoor: [410, 430],
  bathroomDoor: [660, 480],
};

const connections = {
  entrance: ["foyerBottom"],

  foyerBottom: ["entrance", "foyerTop"],

  foyerTop: ["foyerBottom", "corridorRight"],

  corridorRight: ["foyerTop", "corridorRaj"],

  corridorRaj: [
    "corridorRight",
    "corridorBathroom",
    "corridorDas",
    "rajBedroomDoor",
  ],

  corridorBathroom: [
    "corridorRaj",
    "bathroomDoor",
  ],

  corridorDas: [
    "corridorRaj",
    "corridorBabu",
    "dasBedroomDoor",
  ],

  corridorBabu: [
    "corridorDas",
    "corridorKitchen",
    "babuBedroomDoor",
  ],

  corridorKitchen: [
    "corridorBabu",
    "kitchenDoor",
  ],

  rajBedroomDoor: ["corridorRaj"],
  dasBedroomDoor: ["corridorDas"],
  babuBedroomDoor: ["corridorBabu"],

  kitchenDoor: ["corridorKitchen"],
  bathroomDoor: ["corridorBathroom"],
};

function distance(a, b) {
  const [ax, ay] = nodes[a];
  const [bx, by] = nodes[b];

  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function findShortestPath(start, end) {
  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(nodes));

  Object.keys(nodes).forEach((node) => {
    distances[node] = Infinity;
    previous[node] = null;
  });

  distances[start] = 0;

  while (unvisited.size > 0) {
    let current = null;

    for (const node of unvisited) {
      if (
        current === null ||
        distances[node] < distances[current]
      ) {
        current = node;
      }
    }

    if (
      current === null ||
      distances[current] === Infinity
    ) {
      break;
    }

    unvisited.delete(current);

    if (current === end) {
      break;
    }

    for (const neighbor of connections[current]) {
      if (!unvisited.has(neighbor)) {
        continue;
      }

      const newDistance =
        distances[current] +
        distance(current, neighbor);

      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = current;
      }
    }
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

function getPathDistance(path) {
  let total = 0;

  for (let i = 0; i < path.length - 1; i++) {
    total += distance(
      path[i],
      path[i + 1]
    );
  }

  return total;
}

function buildCompleteRoute(
  startNode,
  destinationNames
) {
  let completePath = [];
  let currentNode = startNode;

  destinationNames.forEach((destinationName) => {
    const destinationNode =
      places[destinationName].node;

    const path = findShortestPath(
      currentNode,
      destinationNode
    );

    if (path.length > 0) {
      if (completePath.length === 0) {
        completePath = [...path];
      } else {
        completePath = [
          ...completePath,
          ...path.slice(1),
        ];
      }
    }

    currentNode = destinationNode;
  });

  return completePath;
}

/* -------------------------------------------------------
   VOICE DESTINATION RECOGNITION
------------------------------------------------------- */

function findVoiceDestination(text) {
  const value = text
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .trim();

  if (
    value.includes("രാജ്") ||
    value.includes("രാജിന്റെ") ||
    value.includes("raj")
  ) {
    return "Raj Bedroom";
  }

  if (
    value.includes("ദാസ്") ||
    value.includes("ദാസിന്റെ") ||
    value.includes("das")
  ) {
    return "Das Bedroom";
  }

  if (
    value.includes("ബാബു") ||
    value.includes("ബാബുവിന്റെ") ||
    value.includes("babu")
  ) {
    return "Babu Bedroom";
  }

  if (
    value.includes("കിച്ചൻ") ||
    value.includes("കിച്ചന്") ||
    value.includes("അടുക്കള") ||
    value.includes("kitchen")
  ) {
    return "Kitchen";
  }

  if (
    value.includes("ബാത്ത്റൂം") ||
    value.includes("ബാത്റൂം") ||
    value.includes("ടോയ്ലറ്റ്") ||
    value.includes("toilet") ||
    value.includes("bathroom")
  ) {
    return "Bathroom";
  }

  return null;
}

/* -------------------------------------------------------
   ENGLISH REPLIES
------------------------------------------------------- */

function getMainEntranceEnglishReply(destination) {
  switch (destination) {
    case "Raj Bedroom":
      return "The room straight ahead is Raj's bedroom.";

    case "Das Bedroom":
      return "Go straight and turn left. The second room on the right is Das's bedroom.";

    case "Babu Bedroom":
      return "Go straight and turn left. The third room on the right is Babu's bedroom.";

    case "Kitchen":
      return "Go straight, turn left, and continue straight. The kitchen is there.";

    case "Bathroom":
      return "Go straight and turn left. The first room on the left is the bathroom.";

    default:
      return "";
  }
}

/* -------------------------------------------------------
   MALAYALAM REPLIES
------------------------------------------------------- */

function getMainEntranceMalayalamReply(destination) {
  switch (destination) {
    case "Raj Bedroom":
      return "നേരെ കാണുന്നതാണ് രാജിന്റെ ബെഡ്‌റൂം.";

    case "Das Bedroom":
      return "നേരെ പോയി ഇടത്തോട്ട് തിരിഞ്ഞാൽ, വലതുവശത്തെ രണ്ടാമത്തെ മുറിയാണ് ദാസിന്റെ ബെഡ്‌റൂം.";

    case "Babu Bedroom":
      return "നേരെ പോയി ഇടത്തോട്ട് തിരിഞ്ഞാൽ, വലതുവശത്തെ മൂന്നാമത്തെ മുറിയാണ് ബാബുവിന്റെ ബെഡ്‌റൂം.";

    case "Kitchen":
      return "നേരെ പോയി ഇടത്തോട്ട് തിരിഞ്ഞ് വീണ്ടും നേരെ പോയാൽ കിച്ചൻ ആണ്.";

    case "Bathroom":
      return "നേരെ പോയി ഇടത്തോട്ട് തിരിഞ്ഞാൽ, ഇടതുവശത്തെ ആദ്യത്തെ മുറിയാണ് ബാത്ത്റൂം.";

    default:
      return "";
  }
}

/* -------------------------------------------------------
   GENERIC ENGLISH DIRECTIONS
------------------------------------------------------- */

function getGenericEnglishReply(
  startPoint,
  destination,
  path
) {
  if (!path || path.length < 2) {
    return `${destination} is here.`;
  }

  const movements = [];

  for (let i = 0; i < path.length - 1; i++) {
    const [x1, y1] = nodes[path[i]];
    const [x2, y2] = nodes[path[i + 1]];

    if (x2 > x1) {
      movements.push("right");
    } else if (x2 < x1) {
      movements.push("left");
    } else if (y2 > y1) {
      movements.push("down");
    } else if (y2 < y1) {
      movements.push("up");
    }
  }

  const usefulMovements =
    movements.filter(
      (movement, index) =>
        index === 0 ||
        movement !== movements[index - 1]
    );

  if (usefulMovements.length === 0) {
    return `${destination} is here.`;
  }

  let reply = `From ${startPoint}, `;

  const firstDirection =
    usefulMovements[0];

  if (
    firstDirection === "up" ||
    firstDirection === "down"
  ) {
    reply += "go straight";
  } else if (firstDirection === "left") {
    reply += "go left";
  } else {
    reply += "go right";
  }

  for (
    let i = 1;
    i < usefulMovements.length;
    i++
  ) {
    const previousDirection =
      usefulMovements[i - 1];

    const currentDirection =
      usefulMovements[i];

    if (
      previousDirection === "up" &&
      currentDirection === "left"
    ) {
      reply += ", then turn left";
    } else if (
      previousDirection === "up" &&
      currentDirection === "right"
    ) {
      reply += ", then turn right";
    } else if (
      previousDirection === "down" &&
      currentDirection === "right"
    ) {
      reply += ", then turn left";
    } else if (
      previousDirection === "down" &&
      currentDirection === "left"
    ) {
      reply += ", then turn right";
    } else if (
      previousDirection === "left" &&
      currentDirection === "up"
    ) {
      reply += ", then turn right";
    } else if (
      previousDirection === "left" &&
      currentDirection === "down"
    ) {
      reply += ", then turn left";
    } else if (
      previousDirection === "right" &&
      currentDirection === "up"
    ) {
      reply += ", then turn left";
    } else if (
      previousDirection === "right" &&
      currentDirection === "down"
    ) {
      reply += ", then turn right";
    }
  }

  reply += `, and you will reach ${destination}.`;

  return reply;
}

/* -------------------------------------------------------
   GENERIC MALAYALAM DIRECTIONS
------------------------------------------------------- */

function getGenericMalayalamReply(
  startPoint,
  destination,
  path
) {
  if (!path || path.length < 2) {
    return `${destination} ഇവിടെ തന്നെയാണ്.`;
  }

  const movements = [];

  for (let i = 0; i < path.length - 1; i++) {
    const [x1, y1] = nodes[path[i]];
    const [x2, y2] = nodes[path[i + 1]];

    if (x2 > x1) {
      movements.push("right");
    } else if (x2 < x1) {
      movements.push("left");
    } else if (y2 > y1) {
      movements.push("down");
    } else if (y2 < y1) {
      movements.push("up");
    }
  }

  const usefulMovements =
    movements.filter(
      (movement, index) =>
        index === 0 ||
        movement !== movements[index - 1]
    );

  if (usefulMovements.length === 0) {
    return `${destination} ഇവിടെ തന്നെയാണ്.`;
  }

  let reply = `${startPoint}ൽ നിന്ന് `;

  const firstDirection =
    usefulMovements[0];

  if (
    firstDirection === "up" ||
    firstDirection === "down"
  ) {
    reply += "നേരെ പോകുക";
  } else if (firstDirection === "left") {
    reply += "ഇടത്തോട്ട് പോകുക";
  } else {
    reply += "വലത്തോട്ട് പോകുക";
  }

  for (
    let i = 1;
    i < usefulMovements.length;
    i++
  ) {
    const previousDirection =
      usefulMovements[i - 1];

    const currentDirection =
      usefulMovements[i];

    if (
      previousDirection === "up" &&
      currentDirection === "left"
    ) {
      reply += ", ഇടത്തോട്ട് തിരിയുക";
    } else if (
      previousDirection === "up" &&
      currentDirection === "right"
    ) {
      reply += ", വലത്തോട്ട് തിരിയുക";
    } else if (
      previousDirection === "down" &&
      currentDirection === "right"
    ) {
      reply += ", ഇടത്തോട്ട് തിരിയുക";
    } else if (
      previousDirection === "down" &&
      currentDirection === "left"
    ) {
      reply += ", വലത്തോട്ട് തിരിയുക";
    } else if (
      previousDirection === "left" &&
      currentDirection === "up"
    ) {
      reply += ", വലത്തോട്ട് തിരിയുക";
    } else if (
      previousDirection === "left" &&
      currentDirection === "down"
    ) {
      reply += ", ഇടത്തോട്ട് തിരിയുക";
    } else if (
      previousDirection === "right" &&
      currentDirection === "up"
    ) {
      reply += ", ഇടത്തോട്ട് തിരിയുക";
    } else if (
      previousDirection === "right" &&
      currentDirection === "down"
    ) {
      reply += ", വലത്തോട്ട് തിരിയുക";
    }
  }

  reply += `, ${destination} എത്തും.`;

  return reply;
}

/* -------------------------------------------------------
   TEXT TO SPEECH
------------------------------------------------------- */

function getMalayalamVoice() {
  if (!("speechSynthesis" in window)) {
    return null;
  }

  const voices =
    window.speechSynthesis.getVoices();

  const exactVoice = voices.find(
    (voice) =>
      voice.lang &&
      voice.lang.toLowerCase() === "ml-in"
  );

  if (exactVoice) {
    return exactVoice;
  }

  const malayalamVoice = voices.find(
    (voice) =>
      voice.lang &&
      voice.lang.toLowerCase().startsWith("ml")
  );

  return malayalamVoice || null;
}

function speakText(text, language) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(text);

  if (language === "ml") {
    utterance.lang = "ml-IN";

    utterance.rate = 0.78;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voice = getMalayalamVoice();

    if (voice) {
      utterance.voice = voice;
    }
  } else {
    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
  }

  window.speechSynthesis.speak(
    utterance
  );
}

/* -------------------------------------------------------
   APP
------------------------------------------------------- */

function App() {
  const [startPoint, setStartPoint] =
    useState("Main Entrance");

  const [selectedDestinations, setSelectedDestinations] =
    useState([]);

  const [showVoiceStart, setShowVoiceStart] =
    useState(false);

  const [showVoiceLanguage, setShowVoiceLanguage] =
    useState(false);

  const [pendingVoiceStart, setPendingVoiceStart] =
    useState(null);

  const [isListening, setIsListening] =
    useState(false);

  const [voiceHeard, setVoiceHeard] =
    useState("");

  const [voiceReply, setVoiceReply] =
    useState("");

  const [voiceLanguage, setVoiceLanguage] =
    useState("en");

  const [voiceError, setVoiceError] =
    useState("");

  /* -----------------------------------------------------
     MAP ZOOM
  ----------------------------------------------------- */

  const [mapZoom, setMapZoom] =
    useState(1);

  function zoomIn() {
    setMapZoom((current) =>
      Math.min(
        Number((current + 0.1).toFixed(1)),
        2
      )
    );
  }

  function zoomOut() {
    setMapZoom((current) =>
      Math.max(
        Number((current - 0.1).toFixed(1)),
        0.5
      )
    );
  }

  function resetZoom() {
    setMapZoom(1);
  }

  const route = useMemo(() => {
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

  const nearestPlaces = useMemo(() => {
    const startNode =
      places[startPoint].node;

    return Object.keys(places)
      .filter(
        (place) => place !== startPoint
      )
      .map((place) => {
        const path =
          findShortestPath(
            startNode,
            places[place].node
          );

        return {
          name: place,
          distance:
            getPathDistance(path),
        };
      })
      .sort(
        (a, b) =>
          a.distance - b.distance
      );
  }, [startPoint]);

  function toggleDestination(place) {
    if (place === startPoint) {
      return;
    }

    setSelectedDestinations(
      (current) => {
        if (current.includes(place)) {
          return current.filter(
            (item) => item !== place
          );
        }

        return [...current, place];
      }
    );
  }

  function chooseVoiceStart(place) {
    setPendingVoiceStart(place);
    setShowVoiceStart(false);
    setShowVoiceLanguage(true);
  }

  function startVoiceSearch(
    selectedStartPoint,
    language
  ) {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setShowVoiceLanguage(false);

      const message =
        language === "ml"
          ? "ഈ ബ്രൗസറിൽ വോയ്സ് സെർച്ച് ലഭ്യമല്ല."
          : "Voice search is not available in this browser.";

      setVoiceReply(message);
      setVoiceLanguage(language);

      speakText(message, language);

      return;
    }

    setStartPoint(selectedStartPoint);
    setShowVoiceLanguage(false);

    setVoiceHeard("");
    setVoiceReply("");
    setVoiceError("");
    setVoiceLanguage(language);

    const recognition =
      new SpeechRecognition();

    if (language === "ml") {
      recognition.lang = "ml-IN";
    } else {
      recognition.lang = "en-IN";
    }

    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setVoiceHeard(transcript);

      const destination =
        findVoiceDestination(transcript);

      if (!destination) {
        const message =
          language === "ml"
            ? "ക്ഷമിക്കണം, ഏത് മുറിയിലേക്കാണ് പോകേണ്ടതെന്ന് മനസ്സിലായില്ല. വീണ്ടും പറയുക."
            : "Sorry, I could not understand which room you want to go to. Please try again.";

        setVoiceReply(message);

        speakText(
          message,
          language
        );

        return;
      }

      setSelectedDestinations([
        destination,
      ]);

      const startNode =
        places[selectedStartPoint].node;

      const destinationNode =
        places[destination].node;

      const path =
        findShortestPath(
          startNode,
          destinationNode
        );

      let message = "";

      if (language === "ml") {
        if (
          selectedStartPoint ===
          "Main Entrance"
        ) {
          message =
            getMainEntranceMalayalamReply(
              destination
            );
        } else {
          message =
            getGenericMalayalamReply(
              selectedStartPoint,
              destination,
              path
            );
        }
      } else {
        if (
          selectedStartPoint ===
          "Main Entrance"
        ) {
          message =
            getMainEntranceEnglishReply(
              destination
            );
        } else {
          message =
            getGenericEnglishReply(
              selectedStartPoint,
              destination,
              path
            );
        }
      }

      setVoiceReply(message);

      speakText(
        message,
        language
      );
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      let message;

      if (event.error === "not-allowed") {
        message =
          language === "ml"
            ? "മൈക്രോഫോൺ ഉപയോഗിക്കാൻ അനുമതി നൽകണം."
            : "Please allow microphone access.";
      } else if (
        event.error === "no-speech"
      ) {
        message =
          language === "ml"
            ? "ഒന്നും കേൾക്കാനായില്ല. വീണ്ടും ശ്രമിക്കുക."
            : "I could not hear anything. Please try again.";
      } else {
        message =
          language === "ml"
            ? "വോയ്സ് സെർച്ച് ചെയ്യാൻ കഴിഞ്ഞില്ല. വീണ്ടും ശ്രമിക്കുക."
            : "Voice search could not be completed. Please try again.";
      }

      setVoiceReply(message);

      speakText(
        message,
        language
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);

      setVoiceError(
        "Voice search could not start."
      );
    }
  }

  function speakAgain() {
    if (!voiceReply) {
      return;
    }

    speakText(
      voiceReply,
      voiceLanguage
    );
  }

  const routePoints = route
    .map((node) =>
      nodes[node].join(",")
    )
    .join(" ");

  const startMarker =
    nodes[places[startPoint].node];

  const destinationMarker =
    selectedDestinations.length > 0
      ? nodes[
          places[
            selectedDestinations[
              selectedDestinations.length - 1
            ]
          ].node
        ]
      : null;

  return (
    <div className="app">

      {/* -------------------------------------------------
          TOP BAR
      ------------------------------------------------- */}

      <header className="top-bar">

        <div>
          <h1>Indoor WayFinder</h1>

          <p>
            Find your way inside the building
          </p>
        </div>

        <button
          className={`voice-button ${
            isListening
              ? "listening"
              : ""
          }`}
          onClick={() =>
            setShowVoiceStart(true)
          }
          aria-label="Voice search"
          title="Voice search"
        >
          🎤
        </button>

      </header>

      {/* -------------------------------------------------
          MAIN
      ------------------------------------------------- */}

      <main className="main-content">

        <section className="control-panel">

          {/* Starting point */}

          <div className="card">

            <h2>Starting Point</h2>

            <select
              value={startPoint}
              onChange={(event) => {

                setStartPoint(
                  event.target.value
                );

                setSelectedDestinations(
                  []
                );

              }}
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

          {/* Destination */}

          <div className="card">

            <h2>
              Where do you want to go?
            </h2>

            <div className="destination-list">

              {Object.keys(places)
                .filter(
                  (place) =>
                    place !== startPoint
                )
                .map((place) => (

                  <button
                    key={place}
                    className={`destination-button ${
                      selectedDestinations.includes(
                        place
                      )
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleDestination(
                        place
                      )
                    }
                  >

                    <span>
                      {place}
                    </span>

                    {selectedDestinations.includes(
                      place
                    ) && (
                      <span>✓</span>
                    )}

                  </button>

                ))}

            </div>

          </div>

          {/* Nearest */}

          <div className="nearest-panel">

            <h2>
              Nearest from start
            </h2>

            {nearestPlaces.map(
              (place, index) => (

                <div
                  className="nearest-row"
                  key={place.name}
                >

                  <span>
                    {index + 1}.{" "}
                    {place.name}
                  </span>

                  <span>
                    {place.distance} units
                  </span>

                </div>

              )
            )}

          </div>

          {/* Navigation */}

          {selectedDestinations.length >
            0 && (

            <div className="navigation-card">

              <h2>Navigation</h2>

              <p>
                From{" "}
                <strong>
                  {startPoint}
                </strong>
              </p>

              <ol>

                {selectedDestinations.map(
                  (destination) => (

                    <li
                      key={destination}
                    >
                      {destination}
                    </li>

                  )
                )}

              </ol>

            </div>

          )}

        </section>

        {/* -------------------------------------------------
            MAP
        ------------------------------------------------- */}

        <section className="map-card">

          {/* Zoom controls */}

          <div className="map-zoom-controls">

            <button
              onClick={zoomOut}
              aria-label="Zoom out"
              title="Zoom out"
            >
              −
            </button>

            <button
              className="zoom-percentage"
              onClick={resetZoom}
              aria-label="Reset zoom"
              title="Reset zoom"
            >
              {Math.round(
                mapZoom * 100
              )}%
            </button>

            <button
              onClick={zoomIn}
              aria-label="Zoom in"
              title="Zoom in"
            >
              +
            </button>

          </div>

          {/* Map viewport */}

          <div className="map-viewport">

            <svg
              className="floor-map"
              viewBox="0 0 1100 800"
              style={{
                transform:
                  `scale(${mapZoom})`,
              }}
            >

              {/* Outer wall */}

              <rect
                x="100"
                y="70"
                width="900"
                height="650"
                className="wall"
              />

              {/* Bedroom vertical walls */}

              <line
                x1="470"
                y1="70"
                x2="470"
                y2="360"
                className="wall-line"
              />

              <line
                x1="650"
                y1="70"
                x2="650"
                y2="360"
                className="wall-line"
              />

              {/* Bedroom / corridor walls */}

              <line
                x1="100"
                y1="360"
                x2="430"
                y2="360"
                className="wall-line"
              />

              <line
                x1="500"
                y1="360"
                x2="530"
                y2="360"
                className="wall-line"
              />

              <line
                x1="590"
                y1="360"
                x2="700"
                y2="360"
                className="wall-line"
              />

              <line
                x1="760"
                y1="360"
                x2="1000"
                y2="360"
                className="wall-line"
              />

              {/* Kitchen wall */}

              <line
                x1="410"
                y1="360"
                x2="410"
                y2="395"
                className="wall-line"
              />

              <line
                x1="410"
                y1="465"
                x2="410"
                y2="720"
                className="wall-line"
              />

              {/* Bathroom */}

              <rect
                x="520"
                y="480"
                width="240"
                height="240"
                className="room-outline"
              />

              {/* Bathroom door opening */}

              <line
                x1="520"
                y1="480"
                x2="620"
                y2="480"
                className="wall-line"
              />

              <line
                x1="700"
                y1="480"
                x2="760"
                y2="480"
                className="wall-line"
              />

              {/* -------------------------------------------------
                  DOORS
              ------------------------------------------------- */}

              {/* Raj bedroom door */}

              <line
                x1="700"
                y1="360"
                x2="700"
                y2="315"
                className="door-line"
              />

              <path
                d="M700 360 A45 45 0 0 1 745 315"
                className="door-arc"
              />

              {/* Das bedroom door */}

              <line
                x1="530"
                y1="360"
                x2="530"
                y2="315"
                className="door-line"
              />

              <path
                d="M530 360 A45 45 0 0 1 575 315"
                className="door-arc"
              />

              {/* Babu bedroom door */}

              <line
                x1="430"
                y1="360"
                x2="430"
                y2="315"
                className="door-line"
              />

              <path
                d="M430 360 A45 45 0 0 1 475 315"
                className="door-arc"
              />

              {/* Kitchen door */}

              <line
                x1="410"
                y1="395"
                x2="455"
                y2="395"
                className="door-line"
              />

              <path
                d="M410 395 A45 45 0 0 1 455 440"
                className="door-arc"
              />

              {/* Bathroom door */}

              <line
                x1="620"
                y1="480"
                x2="620"
                y2="525"
                className="door-line"
              />

              <path
                d="M620 480 A45 45 0 0 0 665 525"
                className="door-arc"
              />

              {/* Main entrance door */}

              <line
                x1="855"
                y1="720"
                x2="855"
                y2="675"
                className="door-line"
              />

              <path
                d="M855 720 A45 45 0 0 1 900 675"
                className="door-arc"
              />

              {/* -------------------------------------------------
                  LABELS
              ------------------------------------------------- */}

              <text
                x="275"
                y="200"
                className="room-label"
              >
                Bedroom 3
              </text>

              <text
                x="275"
                y="230"
                className="room-sub-label"
              >
                Babu
              </text>

              <text
                x="560"
                y="200"
                className="room-label"
              >
                Bedroom 2
              </text>

              <text
                x="560"
                y="230"
                className="room-sub-label"
              >
                Das
              </text>

              <text
                x="825"
                y="200"
                className="room-label"
              >
                Bedroom 1
              </text>

              <text
                x="825"
                y="230"
                className="room-sub-label"
              >
                Raj
              </text>

              <text
                x="240"
                y="560"
                className="room-label"
              >
                Kitchen
              </text>

              <text
                x="600"
                y="610"
                className="room-label"
              >
                Bathroom
              </text>

              <text
                x="700"
                y="405"
                className="area-label"
              >
                Corridor
              </text>

              <text
                x="850"
                y="560"
                className="area-label"
              >
                Foyer
              </text>

              <text
                x="850"
                y="755"
                className="area-label"
              >
                Main Entrance
              </text>

              {/* -------------------------------------------------
                  ROUTE
              ------------------------------------------------- */}

              {route.length > 1 && (
                <>
                  <polyline
                    points={routePoints}
                    className="route-shadow"
                  />

                  <polyline
                    points={routePoints}
                    className="route-line"
                  />
                </>
              )}

              {/* Start marker */}

              <circle
                cx={startMarker[0]}
                cy={startMarker[1]}
                r="15"
                className="start-marker"
              />

              {/* Destination marker */}

              {destinationMarker && (
                <circle
                  cx={destinationMarker[0]}
                  cy={destinationMarker[1]}
                  r="15"
                  className="destination-marker"
                />
              )}

            </svg>

          </div>

        </section>

      </main>

      {/* -------------------------------------------------------
          STARTING POINT MODAL
      ------------------------------------------------------- */}

      {showVoiceStart && (

        <div className="voice-overlay">

          <div className="voice-modal">

            <h2>
              Where are you starting from?
            </h2>

            <p>
              Select your starting point.
            </p>

            <div className="voice-start-options">

              {Object.keys(places).map(
                (place) => (

                  <button
                    key={place}
                    onClick={() =>
                      chooseVoiceStart(
                        place
                      )
                    }
                  >
                    {place}
                  </button>

                )
              )}

            </div>

            <button
              className="voice-cancel"
              onClick={() =>
                setShowVoiceStart(false)
              }
            >
              Cancel
            </button>

          </div>

        </div>

      )}

      {/* -------------------------------------------------------
          LANGUAGE MODAL
      ------------------------------------------------------- */}

      {showVoiceLanguage && (

        <div className="voice-overlay">

          <div className="voice-modal">

            <h2>
              Choose language
            </h2>

            <p>
              Choose the language you want to
              speak.
            </p>

            <div className="language-options">

              <button
                className="language-button"
                onClick={() =>
                  startVoiceSearch(
                    pendingVoiceStart,
                    "en"
                  )
                }
              >
                🇬🇧 English
              </button>

              <button
                className="language-button"
                onClick={() =>
                  startVoiceSearch(
                    pendingVoiceStart,
                    "ml"
                  )
                }
              >
                🇮🇳 മലയാളം
              </button>

            </div>

            <button
              className="voice-cancel"
              onClick={() => {

                setShowVoiceLanguage(
                  false
                );

                setPendingVoiceStart(null);

              }}
            >
              Cancel
            </button>

          </div>

        </div>

      )}

      {/* -------------------------------------------------------
          VOICE RESULT
      ------------------------------------------------------- */}

      {(isListening ||
        voiceHeard ||
        voiceReply ||
        voiceError) && (

        <div className="voice-status">

          {isListening && (

            <div className="listening-text">
              🎤 Listening...
            </div>

          )}

          {voiceHeard && (

            <div className="voice-heard">

              <strong>
                You said:
              </strong>{" "}

              {voiceHeard}

            </div>

          )}

          {voiceReply && (

            <div className="voice-reply">

              <strong>
                {voiceLanguage === "ml"
                  ? "ഉത്തരം:"
                  : "Reply:"}
              </strong>

              <p>
                {voiceReply}
              </p>

              <button
                className="speak-again"
                onClick={speakAgain}
              >
                🔊 Speak again
              </button>

            </div>

          )}

          {voiceError && (

            <div className="voice-error">
              {voiceError}
            </div>

          )}

        </div>

      )}

    </div>
  );
}

export default App;

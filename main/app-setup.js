// File: app-setup.js - v1.34
// Responsabile dell'impostazione iniziale, creazione UI dinamica, listeners principali.

let currentSongDataForSave = null;
let glossaryChordData = {};
let CHORD_LIB = {};
let currentMidiData = null; // Dati della canzone attualmente generata
let midiSectionTitleElement = null; // Elemento H3 per il titolo della sezione download MIDI


document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generateButton');
    const songOutputDiv = document.getElementById('songOutput');
    const songOutputContainer = document.getElementById('song-output-container');
  const keySelectionDropdown = document.getElementById('keySelection');
    const structureDropdown = document.getElementById('songStructure');

    const actionButtonsContainer = document.getElementById('action-buttons');

    // --- Popolamento dropdown tonalità ---
   if (keySelectionDropdown && typeof possibleKeysAndModes !== 'undefined' && possibleKeysAndModes.length > 0) {
        possibleKeysAndModes.forEach(keyInfoLoop => {
            const option = document.createElement('option');
            option.value = `${keyInfoLoop.root}_${keyInfoLoop.mode}`;
            option.textContent = keyInfoLoop.name;
            keySelectionDropdown.appendChild(option);
        });
        const randomOption = keySelectionDropdown.querySelector('option[value="random"]');
        if (randomOption) randomOption.textContent = "Random";
    }


    const moodDropdown = document.getElementById('mood');

    const populateStructures = (mood = null) => {
        structureDropdown.innerHTML = '<option value="random" selected>Random (based on Mood)</option>'; // Pulisce e aggiunge l'opzione random

        let templates = SONG_STRUCTURE_TEMPLATES;
        if (mood) {
            templates = SONG_STRUCTURE_TEMPLATES.filter(t => t.mood === mood);

        }


        templates.forEach(template => {
            const opt = document.createElement('option');
            opt.value = template.id;
            opt.textContent = template.name;
            structureDropdown.appendChild(opt);
        });
    };

    if (typeof loadSongStructures === 'function') {
        loadSongStructures().then(() => {
            populateStructures(moodDropdown.value); // Popola inizialmente con il mood selezionato
        }).catch(() => {
            console.error("Could not load structures for dropdown.");
        });

    }


    moodDropdown.addEventListener('change', (event) => {
        populateStructures(event.target.value);
    });

    // --- Inizializzazione libreria accordi ---
    if (typeof buildChordLibrary === "function") {
        CHORD_LIB = buildChordLibrary();
    } else {
        console.error("buildChordLibrary function not found! Chord functionalities will be limited.");
    }

    // --- Event Listener principale ---
    if (generateButton) {
        if (typeof generateSongArchitecture === "function") {
            generateButton.addEventListener('click', generateSongArchitecture);
        } else {
            console.error("generateSongArchitecture function not found! Generation will not work.");
            generateButton.disabled = true;
            generateButton.textContent = 'Error: Setup Incomplete';
        }
    }

    // Definisci attachActionListenersGlobal per essere chiamata dopo la generazione della UI
    window.attachActionListenersGlobal = function() {
        const addListener = (id, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', handler);
            }
        };

        addListener('saveSongButton', handleSaveSong);
        addListener('downloadSingleTrackChordMidiButton', handleGeneratePad);
        addListener('generateChordRhythmButton', handleGenerateChordRhythm);
        addListener('generateMelodyButton', handleGenerateMelody);
        addListener('generateVocalLineButton', handleGenerateVocalLine);
        addListener('generateBassLineButton', handleGenerateBassLine);
        addListener('generateDrumTrackButton', handleGenerateDrumTrack);

        addListener('generateCountermelodyButton', () => addTrackToMidiData('Countermelody', generateCountermelodyForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, sectionCache)));
        addListener('generateTextureButton', () => addTrackToMidiData('Texture', generateTextureForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement }, sectionCache)));
        addListener('generateOrnamentButton', () => addTrackToMidiData('Ornament', generateOrnamentForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, sectionCache)));
        addListener('generateMiasmaticButton', () => addTrackToMidiData('Miasmatic', generateMiasmaticForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, sectionCache)));
        addListener('generateDronesButton', () => addTrackToMidiData('Drones', generateDronesForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, sectionCache)));
        addListener('generatePercussionButton', () => addTrackToMidiData('Percussion', generatePercussionForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, sectionCache)));
        addListener('generateGlitchFxButton', () => addTrackToMidiData('GlitchFx', generateGlitchFxForSong(currentMidiData, { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement, getPitchFromSymbol, getChordRootAndType, getDiatonicChords }, sectionCache)));
    };
});

function addTrackToMidiData(trackName, trackEvents) {
    if (!currentMidiData) {
        alert("Please generate a song first.");
        return;
    }
    if (trackEvents && trackEvents.length > 0) {
        const fileName = `${currentMidiData.title.replace(/[^a-zA-Z0-9_]/g, '_')}_${trackName}.mid`;
        downloadSingleTrackMidi(trackName, trackEvents, fileName, currentMidiData.bpm, currentMidiData.timeSignatureChanges);
    } else {
        alert(`Could not generate ${trackName} track with the current data.`);
    }
}

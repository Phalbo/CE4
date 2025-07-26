// File: main/app-song-generation.js - v1.34
// Contiene la logica principale per la generazione della struttura della canzone,
// degli accordi base, l'arrangiamento ritmico-armonico per sezione,
// e la preparazione dei 'mainChordSlots' per i generatori melodici.

/**
 * Funzione di utilità per ottenere un nome di sezione "pulito" per CSS o logica.
 * @param {string} sectionNameWithCount Nome della sezione, es. "Verse 1"
 * @returns {string} Nome pulito, es. "verse"
 */
function getCleanSectionName(sectionNameWithCount) {
    if (typeof sectionNameWithCount !== 'string') return 'default';
    return sectionNameWithCount.toLowerCase()
        .replace(/\s\d+$|\s\(\d+\)$/, '') // Rimuove numeri alla fine tipo "Verse 1" -> "Verse"
        .replace(/\s*\(double\)$/, 'double') // Gestisce "(double)" -> "chorusdouble" se attaccato
        .replace(/\s*\(modulato\)$/, 'mod')
        .replace(/\s*\(quiet\)$/, 'quiet')
        .replace(/\s*sospeso$/, 'sospeso')
        .trim()
        .replace(/[^\w-]+/g, '') // Rimuove caratteri non alfanumerici tranne - e _ (per coerenza)
        .replace(/\s+/g, '-'); // Sostituisce spazi con trattini per nomi CSS-like
}

/**
 * Normalizza un nome di accordo per usare i diesis.
 * @param {string} chordName Nome dell'accordo
 * @returns {string} Nome dell'accordo normalizzato
 */
function normalizeChordNameToSharps(chordName) {
    if (typeof chordName !== 'string' || !chordName.trim()) return chordName;
    // Assicura che le dipendenze globali siano disponibili
    if (typeof getChordRootAndType !== 'function' || typeof NOTE_NAMES === 'undefined' || typeof allNotesWithFlats === 'undefined' || typeof QUALITY_DEFS === 'undefined') {
        // console.warn("normalizeChordNameToSharps: Dipendenze globali mancanti. Restituzione input.");
        return chordName;
    }
    const { root, type } = getChordRootAndType(chordName.trim());
    if (!root) return chordName.trim(); // Se non riesce a parsare, restituisce l'originale

    const isValidSuffix = Object.values(QUALITY_DEFS).some(def => def.suffix === type.trim());
    if (!isValidSuffix && type.trim() !== "") {
        const flatIndexForRootOnly = allNotesWithFlats.indexOf(root);
        if (flatIndexForRootOnly !== -1 && NOTE_NAMES[flatIndexForRootOnly] && NOTE_NAMES[flatIndexForRootOnly] !== root) {
            return NOTE_NAMES[flatIndexForRootOnly];
        }
        return root;
    }

    const trimmedType = type.trim();

    const flatIndex = allNotesWithFlats.indexOf(root);
    if (flatIndex !== -1 && NOTE_NAMES[flatIndex] && NOTE_NAMES[flatIndex] !== root) {
        return NOTE_NAMES[flatIndex] + trimmedType;
    }
    return root + trimmedType;
}


function generateChordsForSection(
    sectionName,
    keyInfo,
    mood,
    allGeneratedChordsSet,
    measures,
    sectionTimeSignature,
    progressionCache,
    songData
) {
    if (!keyInfo || typeof keyInfo.root === 'undefined' || typeof keyInfo.mode === 'undefined') {
        console.error(`CRITICAL ERROR: Invalid keyInfo for section "${sectionName}".`, keyInfo);
        const fallbackChord = normalizeChordNameToSharps("C");
        allGeneratedChordsSet.add(fallbackChord);
        return [fallbackChord];
    }

    const keyRoot = keyInfo.root;
    const cleanSectionNameForStyle = getCleanSectionName(sectionName);
    const sectionCacheKey = getCleanSectionName(sectionName);

    // Correzione Bug #2 (Caching)
    if (progressionCache && progressionCache[sectionCacheKey]) {
        progressionCache[sectionCacheKey].forEach(chord => allGeneratedChordsSet.add(chord));
        return [...progressionCache[sectionCacheKey]];
    }

    let currentModeForDiatonicGeneration = keyInfo.mode;
    if (!scales[currentModeForDiatonicGeneration] || !scales[currentModeForDiatonicGeneration].intervals || scales[currentModeForDiatonicGeneration].intervals.length < 7) {
        const isMinorGuess = keyRoot.endsWith("m") || (keyInfo.name && keyInfo.name.toLowerCase().includes("minor"));
        currentModeForDiatonicGeneration = isMinorGuess ? 'Aeolian' : 'Ionian';
    }

    const useSeventhChords = Math.random() < 0.6; // Aumentata probabilità settime per maggiore interesse
    const diatonics = getDiatonicChords(keyRoot, currentModeForDiatonicGeneration, useSeventhChords);
    const fallbackTonic = keyRoot + (scales[currentModeForDiatonicGeneration]?.type === 'minor' ? 'm' : '');

    if (!diatonics || diatonics.length === 0) {
        console.error(`Cannot generate diatonic chords for ${keyRoot} ${currentModeForDiatonicGeneration}.`);
        allGeneratedChordsSet.add(fallbackTonic);
        return [fallbackTonic];
    }

    const rn = {
        'i': diatonics[0], 'I': diatonics[0], 'ii': diatonics[1], 'II': diatonics[1],
        'iii': diatonics[2], 'III': diatonics[2], 'iv': diatonics[3], 'IV': diatonics[3],
        'v': diatonics[4], 'V': diatonics[4], 'vi': diatonics[5], 'VI': diatonics[5],
        'vii': diatonics[6], 'VII': diatonics[6]
    };
    // Aggiunta di gradi alterati comuni per arricchire la mappa rn
    const phrygianBII = getChordFromModeAndDegree(keyRoot, 'Phrygian', 'bII');
    if(phrygianBII) rn['bII'] = phrygianBII;

    // --- Inizio Blocco di Logica Definitivo ---
    let targetBaseProgressionLength;
    let minChords, maxChords;

    switch (cleanSectionNameForStyle) {
        case 'intro':
        case 'outro':
        case 'bridge':
            minChords = 1;
            maxChords = 4;
            break;
        case 'verse':
        case 'chorus':
        case 'pre-chorus':
        case 'head':
            minChords = 2;
            maxChords = 5;
            break;
        case 'solo':
            minChords = 2;
            maxChords = 4;
            break;
        case 'silence':
            minChords = 0;
            maxChords = 0;
            break;
        default:
            minChords = 2;
            maxChords = 4;
            break;
    }

    if (minChords === 0 && maxChords === 0) {
        targetBaseProgressionLength = 0;
    } else {
        targetBaseProgressionLength = Math.floor(Math.random() * (maxChords - minChords + 1)) + minChords;
    }
    // --- Fine Blocco di Logica Definitivo ---

    // Fase 1: Nuova Libreria di Pattern Armonici
    const POP_PATTERNS = {
        major: {
            1: [['I'], ['IV'], ['V'], ['vi']],
            2: [['I', 'V'], ['I', 'IV'], ['ii', 'V'], ['IV', 'V'], ['I', 'vi']],
            3: [['I', 'IV', 'V'], ['ii', 'V', 'I'], ['I', 'vi', 'V'], ['IV', 'I', 'V'], ['I', 'iii', 'IV']],
            4: [['I', 'V', 'vi', 'IV'], ['vi', 'IV', 'I', 'V'], ['I', 'vi', 'IV', 'V'], ['I', 'IV', 'V', 'I'], ['I', 'ii', 'IV', 'V']],
            5: [['I', 'vi', 'ii', 'V', 'I'], ['I', 'V', 'vi', 'iii', 'IV'], ['I', 'IV', 'I', 'V', 'I'], ['vi', 'IV', 'I', 'V', 'I']]
        },
        minor: {
            1: [['i'], ['iv'], ['VI'], ['v']],
            2: [['i', 'v'], ['i', 'iv'], ['i', 'VI'], ['i', 'VII']],
            3: [['i', 'iv', 'v'], ['i', 'VI', 'VII'], ['i', 'VI', 'v'], ['i', 'VII', 'VI'], ['VI', 'VII', 'i']],
            4: [['i', 'VI', 'III', 'VII'], ['i', 'iv', 'v', 'i'], ['i', 'iv', 'VII', 'i'], ['i', 'v', 'VI', 'IV'], ['i', 'VII', 'VI', 'V']],
            5: [['i', 'v', 'VI', 'III', 'VII'], ['i', 'iv', 'v', 'VI', 'v'], ['i', 'VI', 'III', 'VII', 'i'], ['iv', 'v', 'i', 'VI', 'VII']]
        }
    };

    // Fase 2: Nuova Logica di Generazione
    let baseProgressionDegrees = [];
    if (targetBaseProgressionLength > 0) {
        const keyType = scales[currentModeForDiatonicGeneration]?.type === 'minor' ? 'minor' : 'major';
        const availablePatterns = POP_PATTERNS[keyType][targetBaseProgressionLength];

        if (availablePatterns && availablePatterns.length > 0) {
            baseProgressionDegrees = getRandomElement(availablePatterns);
        } else {
            const tonic = keyType === 'minor' ? 'i' : 'I';
            const dominant = keyType === 'minor' ? 'v' : 'V';
            baseProgressionDegrees = [tonic];
            for (let i = 1; i < targetBaseProgressionLength; i++) {
                baseProgressionDegrees.push(i % 2 === 1 ? dominant : tonic);
            }
        }
    }

    let finalBaseProgression = baseProgressionDegrees.map(degree => {
        const chordName = rn[degree] || fallbackTonic;
        const finalChord = colorizeChord(chordName, mood, keyInfo); // colorizeChord può aggiungere settime, etc.
        const normalized = normalizeChordNameToSharps(finalChord);
        allGeneratedChordsSet.add(normalized);
        return normalized;
    });

    // Fase 4: Miglioramento dell'Interscambio Modale
    if (songData && songData.enableModalInterchange && MOOD_PROFILES[mood]?.allowedModalBorrowing) {
        const interchangeChordsMap = getInterchangeChords(keyRoot, currentModeForDiatonicGeneration, true);

        if (Object.keys(interchangeChordsMap).length > 0) {
            const originalDegrees = [...baseProgressionDegrees];

            finalBaseProgression = finalBaseProgression.map((chord, index) => {
                const originalDegree = originalDegrees[index];
                const interchangeTarget = interchangeChordsMap[originalDegree];

                if (interchangeTarget && Math.random() < 0.35) {
                    allGeneratedChordsSet.add(interchangeTarget);
                    return interchangeTarget;
                }
                return chord;
            });
        }
    }

    if (progressionCache) {
        progressionCache[sectionCacheKey] = [...finalBaseProgression];
    }

    return finalBaseProgression;
}


/**
 * Funzione principale per generare l'architettura della canzone.
 * Modificata per includere la fase di "Arrangiamento Ritmico-Armonico"
 * e la creazione di 'mainChordSlots'.
 */
async function generateSongArchitecture() {
    const generateButton = document.getElementById('generateButton');
    const songOutputDiv = document.getElementById('songOutput');

    if (generateButton) { generateButton.disabled = true; generateButton.textContent = 'Generating...'; }
    songOutputDiv.innerHTML = '<p><em>Generating your sonic architecture...</em></p>';
    currentSongDataForSave = null; currentMidiData = {};
    glossaryChordData = {};
    sectionCache = {};

    if (midiSectionTitleElement) midiSectionTitleElement.style.display = 'none';
    const actionButtonIDs = [
        'saveSongButton', 'downloadSingleTrackChordMidiButton', 'generateChordRhythmButton',
        'generateMelodyButton', 'generateVocalLineButton', 'generateBassLineButton', 'generateDrumTrackButton'
    ];
    actionButtonIDs.forEach(id => {
        const btn = document.getElementById(id);
        if(btn) btn.style.display = 'none';
    });

    let capriceNumber = Math.floor(Math.random() * 999) + 1;

    try {
        const mood = document.getElementById('mood').value;
        const tempoFeeling = document.getElementById('tempo_feeling').value;
        const selectedKeyOptionValue = document.getElementById('keySelection').value;
        const forcedTimeSignatureValue = document.getElementById('forceTimeSignature').value;
        const selectedStructureTemplate = document.getElementById('songStructure') ? document.getElementById('songStructure').value : 'random';
        const enableModalInterchange = document.getElementById('enableModalInterchange') ? document.getElementById('enableModalInterchange').checked : false;



        const moodProfile = MOOD_PROFILES[mood] || MOOD_PROFILES["very_normal_person"];

        let selectedKey;
        if (selectedKeyOptionValue === "random") {
            const allowedScales = moodProfile.scales;
            const filteredKeys = possibleKeysAndModes.filter(k => allowedScales.includes(k.mode));
            selectedKey = getRandomElement(filteredKeys.length > 0 ? filteredKeys : possibleKeysAndModes);
        } else {
            const parts = selectedKeyOptionValue.split('_');
            selectedKey = possibleKeysAndModes.find(k => k.root === parts[0] && k.mode === parts[1]) || getRandomElement(possibleKeysAndModes);
        }
        if (!selectedKey || typeof selectedKey.root === 'undefined' || typeof selectedKey.mode === 'undefined') {
            console.error("ERRORE: Tonalità selezionata non valida.", selectedKey);
            songOutputDiv.innerHTML = "<p>Errore: Tonalità non valida. Prova con 'Random'.</p>";
            if (generateButton) { generateButton.disabled = false; generateButton.textContent = 'Generate';} return;
        }

               const bpm = generateBPM(tempoFeeling);

        let songStructureDefinition = getSongStructure(selectedStructureTemplate, mood);

        if (!songStructureDefinition) {
            // Fallback se getSongStructure non restituisce una struttura valida
            songStructureDefinition = getSongStructure('random', mood); // Prova a prenderne una casuale per quel mood
            if (!songStructureDefinition) {
                 // Ultimate fallback a una struttura di default
                songStructureDefinition = ["Intro", "Verse", "Chorus", "Outro"];
            }
        }

        let timeSignatureChanges = [];
        let activeTimeSignatureForSectionLogic = [4,4];

        if (forcedTimeSignatureValue !== "random") {
            const tsParts = forcedTimeSignatureValue.split('/');
            activeTimeSignatureForSectionLogic = [parseInt(tsParts[0]), parseInt(tsParts[1])];
            timeSignatureChanges = [{ tick: 0, ts: [...activeTimeSignatureForSectionLogic] }];
        } else {
            const moodTimeSignaturesPool = TIME_SIGNATURES_BY_MOOD[mood] || TIME_SIGNATURES_BY_MOOD["very_normal_person"];
            let cumulativeProb = 0;
            const randomChoiceForBaseTS = Math.random();
            for (const tsOpt of moodTimeSignaturesPool) {
                cumulativeProb += tsOpt.probability;
                if (randomChoiceForBaseTS < cumulativeProb) {
                    activeTimeSignatureForSectionLogic = [...tsOpt.ts];
                    break;
                }
            }
            if (!activeTimeSignatureForSectionLogic || activeTimeSignatureForSectionLogic.length !== 2) activeTimeSignatureForSectionLogic = [4,4];
            timeSignatureChanges = [{ tick: 0, ts: [...activeTimeSignatureForSectionLogic] }];
        }

        const songTitle = generatePhalboTitle();
        const displaySongTitle = songTitle;
        const styleNote = moodProfile.styleNotes || "Experiment.";

        currentMidiData = {
            title: songTitle, displayTitle: displaySongTitle, bpm: bpm, timeSignatureChanges: [], sections: [],
            keySignatureRoot: selectedKey.root, keyModeName: selectedKey.mode,
            fullKeyName: selectedKey.name || (selectedKey.root + " " + selectedKey.mode),
            capriceNum: capriceNumber, totalMeasures: 0, mainScaleNotes: [], mainScaleRoot: selectedKey.root,
            enableModalInterchange: enableModalInterchange
        };

        const allGeneratedChordsSet = new Set();
        let totalSongMeasures = 0;
        const progressionCache = {};
        let currentGlobalTickForTS = 0;
        const rawMidiSectionsData = [];

        songStructureDefinition.forEach((sectionNameString, sectionIndex) => {
            if(typeof sectionNameString !== 'string'){ console.error("Nome sezione non valido: ", sectionNameString); return; }

            let currentSectionTSForLogic = [...activeTimeSignatureForSectionLogic];
            if (forcedTimeSignatureValue === "random" && sectionIndex > 0) {
                const currentMoodTSOptions = TIME_SIGNATURES_BY_MOOD[mood] || TIME_SIGNATURES_BY_MOOD["very_normal_person"];
                const prevTSDefinition = currentMoodTSOptions.find(opt =>
                    opt.ts[0] === activeTimeSignatureForSectionLogic[0] && opt.ts[1] === activeTimeSignatureForSectionLogic[1]
                ) || currentMoodTSOptions[0];
                if (Math.random() < (prevTSDefinition.sectionChangeProbability || 0) && prevTSDefinition.allowedNext && prevTSDefinition.allowedNext.length > 0) {
                    currentSectionTSForLogic = getRandomElement(prevTSDefinition.allowedNext) || currentSectionTSForLogic;
                }
            }
            activeTimeSignatureForSectionLogic = [...currentSectionTSForLogic];

            const lastRegisteredTSChange = timeSignatureChanges[timeSignatureChanges.length - 1];
            if (!lastRegisteredTSChange || currentGlobalTickForTS > lastRegisteredTSChange.tick ||
                (activeTimeSignatureForSectionLogic[0] !== lastRegisteredTSChange.ts[0] || activeTimeSignatureForSectionLogic[1] !== lastRegisteredTSChange.ts[1])) {
                 if (!(currentGlobalTickForTS === 0 && timeSignatureChanges.length > 0 &&
                      activeTimeSignatureForSectionLogic[0] === timeSignatureChanges[0].ts[0] &&
                      activeTimeSignatureForSectionLogic[1] === timeSignatureChanges[0].ts[1] &&
                      timeSignatureChanges.length === 1 )) {
                    timeSignatureChanges.push({ tick: currentGlobalTickForTS, ts: [...activeTimeSignatureForSectionLogic] });
                }
            }

            const cleanSectionNameForLogic = getCleanSectionName(sectionNameString);
            const durationParams = SECTION_DURATION_GUIDELINES[cleanSectionNameForLogic] || SECTION_DURATION_GUIDELINES[getCleanSectionName(sectionNameString.split(" ")[0])] ||SECTION_DURATION_GUIDELINES["default"];
            const measures = typeof getRandomElement === 'function' ?
                getRandomElement( Array.from({length: durationParams.typicalMax - durationParams.typicalMin + 1}, (_, i) => durationParams.typicalMin + i) )
                : durationParams.typicalMin;
            const finalMeasures = measures || durationParams.typicalMin;
            totalSongMeasures += finalMeasures;

        const baseChordProgressionForSection = generateChordsForSection(
                sectionNameString,
                selectedKey,
                mood,
                allGeneratedChordsSet,
                finalMeasures,
                activeTimeSignatureForSectionLogic,
                progressionCache,
                currentMidiData
            );

            rawMidiSectionsData.push({
                name: sectionNameString,
                baseChords: baseChordProgressionForSection,
                measures: finalMeasures,
                timeSignature: [...activeTimeSignatureForSectionLogic],
                startTick: currentGlobalTickForTS,
                id: `section-${sectionIndex}`,
                detailedHarmonicEvents: [],
                mainChordSlots: [] // Aggiunto per i generatori melodici
            });

            const beatsPerMeasureInSection = activeTimeSignatureForSectionLogic[0];
            const beatUnitValueInSection = activeTimeSignatureForSectionLogic[1];
            const ticksPerBeatForThisSection = (4 / beatUnitValueInSection) * TICKS_PER_QUARTER_NOTE_REFERENCE;
            currentGlobalTickForTS += finalMeasures * beatsPerMeasureInSection * ticksPerBeatForThisSection;
        });

        // --- FASE DI CREAZIONE DEI mainChordSlots (Logica Avanzata per Accordi Variabili) ---
        rawMidiSectionsData.forEach(sectionData => {
            if (sectionData.baseChords.length === 0 || sectionData.measures === 0) {
                return; // Sezione vuota, non generare slot
            }

            const totalTicksInSection = sectionData.measures * (4 / sectionData.timeSignature[1]) * sectionData.timeSignature[0] * TICKS_PER_QUARTER_NOTE_REFERENCE;
            const numChords = sectionData.baseChords.length;

            // Calcola la durata di base per ogni accordo e la distribuzione dei resti
            const baseDuration = Math.floor(totalTicksInSection / numChords);
            let remainder = totalTicksInSection % numChords;

            let currentTick = 0;
            for (let i = 0; i < numChords; i++) {
                let chordDuration = baseDuration;
                // Distribuisci il resto equamente tra i primi accordi
                if (remainder > 0) {
                    chordDuration++;
                    remainder--;
                }

                if (chordDuration > 0) {
                    sectionData.mainChordSlots.push({
                        chordName: sectionData.baseChords[i],
                        effectiveStartTickInSection: currentTick,
                        effectiveDurationTicks: chordDuration,
                        timeSignature: sectionData.timeSignature,
                        sectionStartTick: sectionData.startTick
                    });
                }
                currentTick += chordDuration;
            }

            // Fallback di sicurezza: se la durata totale non corrisponde, aggiusta l'ultimo accordo
            if (sectionData.mainChordSlots.length > 0) {
                const lastSlot = sectionData.mainChordSlots[sectionData.mainChordSlots.length - 1];
                const calculatedTotalDuration = lastSlot.effectiveStartTickInSection + lastSlot.effectiveDurationTicks;
                if (calculatedTotalDuration !== totalTicksInSection) {
                    lastSlot.effectiveDurationTicks += (totalTicksInSection - calculatedTotalDuration);
                }
            }
        });
        // --- FINE FASE DI CREAZIONE mainChordSlots ---

        currentMidiData.sections = rawMidiSectionsData;
        currentMidiData.timeSignatureChanges = timeSignatureChanges;
        currentMidiData.totalMeasures = totalSongMeasures;

        const mainScaleText = getScaleNotesText(selectedKey.root, selectedKey.mode);
        const mainScaleParts = mainScaleText.split(':'); let mainScaleParsedNotes = []; let mainScaleParsedRoot = selectedKey.root; let mainScaleParsedName = selectedKey.mode;
        if (mainScaleParts.length === 2) {
            const nameAndRootPart = mainScaleParts[0].trim();
            const notesStringPart = mainScaleParts[1].trim();
            mainScaleParsedNotes = notesStringPart.split(' - ').map(n => n.trim());
            const rootMatch = nameAndRootPart.match(/^([A-G][#b]?)/);
            if (rootMatch && rootMatch[0]) {
                mainScaleParsedRoot = rootMatch[0];
                mainScaleParsedName = nameAndRootPart.substring(mainScaleParsedRoot.length).trim();
                if (mainScaleParsedName.includes("(")) {
                    mainScaleParsedName = mainScaleParsedName.substring(0, mainScaleParsedName.indexOf("(")).trim();
                }
            } else { mainScaleParsedName = nameAndRootPart; }
        } else {
            if (typeof scales !== 'undefined' && scales[selectedKey.mode] && scales[selectedKey.mode].intervals) {
                let rootIdx = NOTE_NAMES.indexOf(selectedKey.root);
                let useFlatsForDefault = ["F","Bb","Eb","Ab","Db","Gb"].includes(selectedKey.root) || selectedKey.root.includes("b");
                if (rootIdx === -1 && typeof allNotesWithFlats !== 'undefined') {
                    const sharpEquivalent = {"Db":"C#", "Eb":"D#", "Gb":"F#", "Ab":"G#", "Bb":"A#"}[selectedKey.root];
                    if (sharpEquivalent) rootIdx = NOTE_NAMES.indexOf(sharpEquivalent);
                    else rootIdx = allNotesWithFlats.indexOf(selectedKey.root);
                }
                if (rootIdx !== -1 && typeof getNoteName === "function") {
                    mainScaleParsedNotes = scales[selectedKey.mode].intervals.map(interval => getNoteName(rootIdx + interval, useFlatsForDefault));
                }
            }
        }
        currentMidiData.mainScaleNotes = mainScaleParsedNotes;
        currentMidiData.mainScaleRoot = mainScaleParsedRoot;

        if (typeof renderSongOutput === "function") {
            renderSongOutput(currentMidiData, allGeneratedChordsSet, styleNote, mainScaleText, mainScaleParsedNotes, mainScaleParsedRoot, mainScaleParsedName);
        } else {
            songOutputDiv.innerHTML = "<p>Errore: Funzione di rendering UI non trovata.</p>";
        }

        if (typeof updateEstimatedSongDuration === "function") {
            updateEstimatedSongDuration();
        }
      if (typeof buildSongDataForTextFile === "function") {
            buildSongDataForTextFile();
        }

        console.log("Progression cache during generation:", progressionCache);

        if (midiSectionTitleElement) midiSectionTitleElement.style.display = 'block';

        const actionButtonsContainer = document.getElementById('action-buttons');
        if(actionButtonsContainer) actionButtonsContainer.style.display = 'flex';

        const newGeneratorsSection = document.querySelector('.new-generators-section');
        if(newGeneratorsSection) newGeneratorsSection.style.display = 'flex';

        document.querySelectorAll('.action-button').forEach(btn => {
            btn.style.display = 'block';
        });


    } catch (error) {
        console.error("ERRORE CRITICO durante la generazione dell'architettura:", error, error.stack);
        songOutputDiv.innerHTML = `<p>Errore critico: ${error.message}. Controlla la console.</p>`;
    } finally {
        if (generateButton) { generateButton.disabled = false; generateButton.textContent = 'Generate'; }
    }
}

function applyProgressionVariation(baseProgression, mood, keyInfo) {
    if (!Array.isArray(baseProgression) || baseProgression.length === 0) return baseProgression;
    const newProg = [...baseProgression];
    if (Math.random() < 0.5) {
        // Vary length by adding or removing last chord
        if (Math.random() < 0.5 && newProg.length > 1) {
            newProg.pop();
        } else {
            const lastChord = newProg[newProg.length - 1];
            newProg.push(lastChord);
        }
    } else {
        // Vary final chord quality
        const lastChord = newProg[newProg.length - 1];
        newProg[newProg.length - 1] = normalizeChordNameToSharps(colorizeChord(lastChord, mood, keyInfo));
    }
    return newProg;
}

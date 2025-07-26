// gen/generateCountermelodyForSong.js

function generateCountermelodyForSong(songData, helpers, sectionCache) {
    // --- LIBRERIE MELODICHE E RITMICHE (VERSIONE ESTESA) ---

    // Motivi Melodici Abstratti: 'C' = Chord Tone, 'S' = Scale Tone. I suffissi indicano la direzione o la nota specifica.
    const MELODIC_MOTIFS = [
        // Pattern di base e movimenti graduali
        { name: "Walking Up", pattern: ['C', 'S_up', 'C_third', 'S_up'] },
        { name: "Walking Down", pattern: ['C', 'S_down', 'C_third', 'S_down'] },
        { name: "Full Arpeggio", pattern: ['C_root', 'C_third', 'C_fifth', 'C_seventh'] },
        { name: "Wave Motion", pattern: ['C_third', 'S_up', 'C_fifth', 'S_down'] },

        // Pattern con salti e contorni più ampi
        { name: "Leap and Recover", pattern: ['C_low', 'C_high', 'S_down', 'C_third'] },
        { name: "Mountain Range", pattern: ['C_low', 'S_up', 'C_high', 'S_down', 'C_low'] },
        { name: "Contrary Motion", pattern: ['C_low', 'S_up', 'C_high', 'S_down'] },
        { name: "Wide Leaps", pattern: ['C_root', 'C_seventh', 'C_third', 'C_high'] },

        // Pattern ritmici/enfatizzati
        { name: "Syncopated Anchor", pattern: ['C', 'rest', 'S_up', 'C'] },
        { name: "Pedal Tone Ostinato", pattern: ['C_root', 'S_up', 'C_root', 'S_down', 'C_root', 'C_third'] },
        { name: "Off-beat Emphasis", pattern: ['rest', 'C_third', 'rest', 'C_fifth'] },

        // Pattern Classici, Jazz e Complessi
        { name: "Baroque Turn", pattern: ['S_up', 'C', 'S_down', 'C'] },
        { name: "Jazz Enclosure", pattern: ['S_down', 'S_up', 'C', 'rest'] }, // Circonda la nota target
        { name: "Question-Answer", pattern: ['C_low', 'S_up', 'rest', 'C_high', 'S_down'] },
        { name: "Chromatic Passing", pattern: ['C', 'C_chromatic_up', 'S_up', 'rest'] }, // Usa una nota cromatica
        { name: "Suspense and Resolve", pattern: ['S_sus', 'C_root', 'rest', 'C_third'] }, // Crea tensione e risolve

        // Pattern lunghi per accordi estesi
        { name: "Long Run Up", pattern: ['C_root', 'S', 'C_third', 'S', 'C_fifth', 'S', 'C_seventh', 'S_up'] },
        { name: "Long Run Down", pattern: ['C_seventh', 'S', 'C_fifth', 'S', 'C_third', 'S', 'C_root', 'S_down'] },
        { name: "Fingerstyle Folk", pattern: ['C_root', 'C_fifth', 'C_third', 'C_fifth', 'S_up', 'C_fifth'] }
    ];

    // Pattern Ritmici (durate in beat, - = pausa)
    const RHYTHMIC_PATTERNS = [
        // Ritmi base e stabili
        [0.5, 0.5, 0.5, 0.5],                // Crome costanti
        [1.0, 1.0],                          // Semiminime
        [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25], // Semicrome costanti
        [1/3, 1/3, 1/3, 1/3, 1/3, 1/3],      // Terzine di crome

        // Ritmi puntati e sincopati
        [0.75, 0.25, 0.75, 0.25],            // Puntato
        [0.25, 0.5, 0.25],                   // Sincope classica
        [0.5, -0.25, 0.25, 0.5],             // Pausa sincopata
        [-0.25, 0.75, -0.25, 0.75],          // Enfasi in levare (off-beat)

        // Ritmi caratteristici di generi
        [0.5, 0.25, 0.25],                   // Galoppo
        [0.25, 0.25, 0.5],                   // Galoppo inverso
        [1.0, -0.5, 0.5],                    // Bossa Nova base
        [0.75, 0.75, 0.5],                   // Emiolia (sensazione di 3 su 2)
        [-0.5, 0.5, -0.5, 0.5],              // Levare tipico dello Ska

        // Ritmi con pause espressive
        [1.5, -0.5],                         // Nota lunga e respiro
        [0.5, 0.25, -0.25],                  // Ritmo "Heartbeat"
        [-0.5, 0.5, -0.5, 1.5],              // Fraseggio con pausa lunga
        [0.25, -0.25, 0.25, -0.25, 1.0],     // Ritmo "funky"

        // Ritmi complessi e cinematici
        [0.4, 0.4, 0.2, 0.6, 0.4],           // Ritmo irregolare "progressive"
        [2.0, 0.5, 0.5, 1.0]                 // Ritmo cinematico
    ];

    // --- LOGICA PRINCIPALE ---

    const track = [];
    const { getChordNotes, NOTE_NAMES, normalizeSectionName, getRandomElement } = helpers;
    const ticksPerBeat = 128;

    if (!sectionCache.countermelody) {
        sectionCache.countermelody = {};
    }

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.countermelody[baseName]) {
            const cachedSection = sectionCache.countermelody[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        let lastPitch = null; // Tiene traccia dell'ultima nota per connessioni più fluide

        section.mainChordSlots.forEach((slot) => {
            const chordNotesResult = getChordNotes(slot.chordName);
            const chordNoteNames = chordNotesResult ? chordNotesResult.notes : [];
            const scaleNoteNames = songData.mainScaleNotes || [];

            if (chordNoteNames.length === 0 || scaleNoteNames.length === 0) return;

            const chordPitches = chordNoteNames.map(n => NOTE_NAMES.indexOf(n));
            const scalePitches = scaleNoteNames.map(n => NOTE_NAMES.indexOf(n));

            const motif = getRandomElement(MELODIC_MOTIFS).pattern;
            const rhythm = getRandomElement(RHYTHMIC_PATTERNS);

            let currentTickInSlot = 0;
            let motifIndex = 0;
            let rhythmIndex = 0;

            while(currentTickInSlot < slot.effectiveDurationTicks) {
                const step = motif[motifIndex % motif.length];
                const durationInBeats = rhythm[rhythmIndex % rhythm.length];
                const durationInTicks = Math.round(Math.abs(durationInBeats * ticksPerBeat));

                // Tronca l'ultima nota se sfora
                const finalDuration = Math.min(durationInTicks, slot.effectiveDurationTicks - currentTickInSlot);

                if (durationInBeats > 0) {
                    let pitch = selectPitchForStep(step, chordPitches, scalePitches, lastPitch);

                    if (pitch !== null) {
                        pitch += 60; // Porta la melodia nell'ottava centrale

                        sectionTrack.push({
                            pitch: [pitch],
                            duration: `T${finalDuration}`,
                            startTick: slot.effectiveStartTickInSection + currentTickInSlot,
                            velocity: 70 + Math.floor(Math.random() * 25)
                        });
                        lastPitch = pitch;
                    }
                }

                currentTickInSlot += finalDuration;
                motifIndex++;
                rhythmIndex++;
            }
        });

        sectionCache.countermelody[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}

/**
 * Funzione helper avanzata per scegliere una nota appropriata.
 */
function selectPitchForStep(step, chordPitches, scalePitches, lastPitch) {
    const lastNote = lastPitch ? lastPitch % 12 : null;
    const findNext = (notes, current) => notes.find(p => p > current) || notes[0];
    const findPrev = (notes, current) => [...notes].reverse().find(p => p < current) || notes[notes.length - 1];

    switch (step) {
        // Chord Tones
        case 'C': return chordPitches[Math.floor(Math.random() * chordPitches.length)];
        case 'C_root': return chordPitches[0];
        case 'C_third': return chordPitches[1] || chordPitches[0];
        case 'C_fifth': return chordPitches[2] || chordPitches[0];
        case 'C_seventh': return chordPitches[3] || chordPitches[0];
        case 'C_up': return findNext(chordPitches, lastNote);
        case 'C_low': return chordPitches[0];
        case 'C_high': return chordPitches[chordPitches.length - 1];

        // Scale Tones
        case 'S': return scalePitches.filter(p => !chordPitches.includes(p))[Math.floor(Math.random() * (scalePitches.length - chordPitches.length))] || scalePitches[0];
        case 'S_up': return findNext(scalePitches, lastNote);
        case 'S_down': return findPrev(scalePitches, lastNote);
        case 'S_sus': // Nota di sospensione (la quarta della scala)
            return scalePitches[3] || scalePitches[0];

        // Chromatic Tones
        case 'C_chromatic_up':
            return lastNote !== null ? lastNote + 1 : chordPitches[0] + 1;

        default:
            return chordPitches[0];
    }
}

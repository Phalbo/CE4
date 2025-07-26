// gen/generateOrnamentForSong.js
const ORNAMENTS = {
    trill: (pitch, startTick, helpers) => {
        const ticksPer32nd = 16; // Durata di una biscroma
        const velocity = 80 + Math.floor(Math.random() * 20);
        return [
            { pitch: [pitch], duration: `T${ticksPer32nd}`, startTick: startTick, velocity: velocity },
            { pitch: [pitch + 2], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd, velocity: velocity },
            { pitch: [pitch], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd * 2, velocity: velocity },
            { pitch: [pitch + 2], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd * 3, velocity: velocity }
        ];
    },
    graceNote: (pitch, startTick, helpers) => {
        const ticksPer64th = 8; // Durata cortissima
        const velocity = 80 + Math.floor(Math.random() * 20);
        return [
            { pitch: [pitch - 3], duration: `T${ticksPer64th}`, startTick: startTick, velocity: velocity + 10 },
            { pitch: [pitch], duration: `T${ticksPer64th * 3}`, startTick: startTick + ticksPer64th, velocity: velocity }
        ];
    },
    mordent: (pitch, startTick, helpers) => {
        const ticksPer32nd = 16;
        const velocity = 80 + Math.floor(Math.random() * 20);
        return [
            { pitch: [pitch], duration: `T${ticksPer32nd}`, startTick: startTick, velocity: velocity },
            { pitch: [pitch - 2], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd, velocity: velocity - 10 },
            { pitch: [pitch], duration: `T${ticksPer32nd}`, startTick: startTick + ticksPer32nd * 2, velocity: velocity },
        ];
    },
    gruppetto: (pitch, startTick, helpers) => {
        const ticksPer64th = 8;
        const velocity = 80 + Math.floor(Math.random() * 20);
        return [
            { pitch: [pitch], duration: `T${ticksPer64th}`, startTick: startTick, velocity: velocity },
            { pitch: [pitch + 2], duration: `T${ticksPer64th}`, startTick: startTick + ticksPer64th, velocity: velocity - 5 },
            { pitch: [pitch], duration: `T${ticksPer64th}`, startTick: startTick + ticksPer64th * 2, velocity: velocity - 10 },
            { pitch: [pitch - 2], duration: `T${ticksPer64th}`, startTick: startTick + ticksPer64th * 3, velocity: velocity - 5 },
            { pitch: [pitch], duration: `T${ticksPer64th}`, startTick: startTick + ticksPer64th * 4, velocity: velocity },
        ];
    }
};

function generateOrnamentForSong(songData, helpers) {
    console.log("Ornament Generator: Avviato.");
    const track = [];
    const { getChordNotes, NOTE_NAMES } = helpers;
    const ticksPerBeat = 128;

    songData.sections.forEach(section => {
        section.mainChordSlots.forEach(slot => {
            const beatsInSlot = slot.effectiveDurationTicks / ticksPerBeat;
            for(let beat = 0; beat < beatsInSlot; beat++) {
                if (Math.random() < 0.05) { // Lower probability per beat
                    const chordNotesResult = getChordNotes(slot.chordName);
                    const chordNotes = chordNotesResult ? chordNotesResult.notes : [];
                    if (!chordNotes || chordNotes.length === 0) {
                        console.warn(`Skipping ornament for ${slot.chordName}: No chord notes found.`);
                        continue;
                    }

                    const ornamentType = ["trill", "graceNote", "mordent", "gruppetto"][Math.floor(Math.random() * 4)];
                    const targetNote = chordNotes[1] || chordNotes[0];
                    if (!targetNote) continue;

                    const pitch = NOTE_NAMES.indexOf(targetNote) + 60;
                    const ornamentStartTick = slot.effectiveStartTickInSection + (beat * ticksPerBeat);

                    const ornamentEvents = ORNAMENTS[ornamentType](pitch, ornamentStartTick, helpers);
                    track.push(...ornamentEvents);
                    console.log(`Ornament Generator: Ornamento '${ornamentType}' creato con successo.`);
                }
            }
        });
    });
    console.log("Ornament Generator: Processo completato. Eventi totali:", track.length);
    return track;
}

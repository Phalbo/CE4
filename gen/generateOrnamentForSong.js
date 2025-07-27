// gen/generateOrnamentForSong.js
function generateOrnamentForSong(songData, helpers) {
    console.log("Ornament Generator: Avviato.");
    const track = [];
    const { getChordNotes, NOTE_NAMES } = helpers;
    const ticksPerBeat = 128;

    songData.sections.forEach(section => {
        section.mainChordSlots.forEach(slot => {
            const beatsInSlot = slot.effectiveDurationTicks / ticksPerBeat;
            for (let beat = 0; beat < beatsInSlot; beat++) {
                if (Math.random() < 0.20) { // 20% probability per beat
                    const chordNotesResult = getChordNotes(slot.chordName);
                    const chordNotes = chordNotesResult ? chordNotesResult.notes : [];
                    if (!chordNotes || chordNotes.length === 0) {
                        console.warn(`Skipping ornament for ${slot.chordName}: No chord notes found.`);
                        continue;
                    }

                    const targetNote = chordNotes[1] || chordNotes[0];
                    if (!targetNote) continue;

                    const pitch = NOTE_NAMES.indexOf(targetNote) + 60;
                    const ornamentStartTick = slot.effectiveStartTickInSection + (beat * ticksPerBeat);

                    // Single diatonic grace note (acciaccatura)
                    const graceNotePitch = pitch - 2; // A step below
                    const graceNoteVelocity = 60; // Low velocity
                    const ticksPer64th = 8; // Very short duration

                    const ornamentEvents = [
                        { pitch: [graceNotePitch], duration: `T${ticksPer64th}`, startTick: ornamentStartTick, velocity: graceNoteVelocity },
                        { pitch: [pitch], duration: `T${ticksPerBeat - ticksPer64th}`, startTick: ornamentStartTick + ticksPer64th, velocity: 80 }
                    ];

                    track.push(...ornamentEvents);
                    console.log(`Ornament Generator: Ornamento 'graceNote' creato con successo.`);
                }
            }
        });
    });
    console.log("Ornament Generator: Processo completato. Eventi totali:", track.length);
    return track;
}

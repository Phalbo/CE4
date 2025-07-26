// gen/generateTextureForSong.js
function generateTextureForSong(songData, helpers, sectionCache) {
    const track = [];
    const { getChordNotes, NOTE_NAMES, normalizeSectionName } = helpers;

    if (!sectionCache.texture) {
        sectionCache.texture = {};
    }

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.texture[baseName]) {
            const cachedSection = sectionCache.texture[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        section.mainChordSlots.forEach(slot => {
            const chordNotesResult = getChordNotes(slot.chordName);
            let chordNotes = chordNotesResult ? chordNotesResult.notes : [];
            if (!chordNotes || chordNotes.length === 0) {
                console.warn(`Skipping slot for ${slot.chordName}: No chord notes found.`);
                return;
            }
            if (chordNotes.length < 3) return;

            // Apply inversion
            const inversion = Math.floor(Math.random() * 3); // 0: root, 1: 1st inv, 2: 2nd inv
            if (inversion === 1) {
                chordNotes = [chordNotes[1], chordNotes[2], chordNotes[0]];
            } else if (inversion === 2) {
                chordNotes = [chordNotes[2], chordNotes[0], chordNotes[1]];
            }

            const pitches = chordNotes.map((n, i) => {
                let pitch = NOTE_NAMES.indexOf(n) + 60;
                if(inversion === 1 && i > 0) pitch += 12;
                if(inversion === 2 && i > 1) pitch += 12;
                return pitch;
            });

            sectionTrack.push({
                pitch: pitches,
                duration: `T${slot.effectiveDurationTicks}`,
                startTick: slot.effectiveStartTickInSection,
                velocity: 40
            });
        });

        sectionCache.texture[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}

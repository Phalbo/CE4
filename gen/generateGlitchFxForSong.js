// gen/generateGlitchFxForSong.js
const GLITCH_EFFECTS = {
    stutter: (pitch, startTick) => {
        const events = [];
        for (let i = 0; i < 8; i++) {
            events.push({ pitch: [pitch], duration: 'T16', startTick: startTick + (i * 32), velocity: 110 });
        }
        return events;
    },
    pitchRiser: (pitch, startTick) => {
        const events = [];
        for (let i = 0; i < 4; i++) {
            events.push({ pitch: [pitch + i * 2], duration: 'T32', startTick: startTick + (i * 64), velocity: 90 + i * 5 });
        }
        return events;
    },
    gate: (pitch, startTick) => {
         return [{ pitch: [pitch], duration: 'T32', startTick: startTick, velocity: 100 }, { pitch: [pitch], duration: 'T32', startTick: startTick + 128, velocity: 100 }];
    },
    tapeStop: (pitch, startTick) => {
        return [{ pitch: [pitch], duration: 'T128', startTick: startTick, velocity: 100, pitchBend: -4096 }];
    },
    reverse: (pitch, startTick) => {
        return [
            { pitch: [pitch], duration: 'T16', startTick: startTick, velocity: 50 },
            { pitch: [pitch], duration: 'T112', startTick: startTick + 16, velocity: 120 }
        ];
    }
};

function generateGlitchFxForSong(songData, helpers, sectionCache) {
    const track = [];
    const { getChordNotes, NOTE_NAMES, getRandomElement, normalizeSectionName } = helpers;
    const ticksPerMeasure44 = 128 * 4;
    const scaleNotes = songData.mainScaleNotes;

    if (!scaleNotes || scaleNotes.length === 0) return [];

    if (!sectionCache.glitch) {
        sectionCache.glitch = {};
    }

    songData.sections.forEach(section => {
        const baseName = normalizeSectionName(section.name);
        if (sectionCache.glitch[baseName]) {
            const cachedSection = sectionCache.glitch[baseName];
            cachedSection.forEach(event => {
                track.push({ ...event, startTick: event.startTick + section.startTick });
            });
            return;
        }

        const sectionTrack = [];
        let totalTicks = 0;
        for (let m = 0; m < section.measures; m++) {
            if (Math.random() < 0.25) {
                const effectName = getRandomElement(Object.keys(GLITCH_EFFECTS));
                const randomNoteName = getRandomElement(scaleNotes);
                const pitch = NOTE_NAMES.indexOf(randomNoteName) + 60;
                const effectEvents = GLITCH_EFFECTS[effectName](pitch, totalTicks);
                sectionTrack.push(...effectEvents);
            }
            totalTicks += ticksPerMeasure44;
        }

        sectionCache.glitch[baseName] = sectionTrack;
        sectionTrack.forEach(event => {
            track.push({ ...event, startTick: event.startTick + section.startTick });
        });
    });
    return track;
}

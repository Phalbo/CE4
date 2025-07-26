# CapricEngine v2.29

## Changelog (v2.29)

*   **UI and Layout:**
    *   Styled the "download your global hit in MIDI format" title to match the glossary title.
    *   Fixed the button layout to be centered and responsive.
    *   Standardized the button size to be uniform.
*   **Bug Fixes:**
    *   Fixed a critical bug that caused multiple MIDI files to be generated on a single click by centralizing the event listener handling.
*   **Generator Improvements:**
    *   **Countermelody:** Increased rhythmic density and melodic variety by using eighth notes and more complex arpeggio patterns.
    *   **Texture:** Introduced chord inversions to create a more distinct harmonic texture.
    *   **Ornament:** Added new "mordent" and "gruppetto" patterns, humanized note velocity, and added debug logs.
    *   **Miasmatic:** Added 10 new patterns with syncopated rhythms and strategic pauses.
    *   **Percussion:** Ensured that the correct MIDI notes are used for the drum kit and percussions, and that both tracks are exported on MIDI channel 10.
    *   **Glitch FX:** Improved harmonic coherence by using notes from the current chord and added new "tape stop" and "reverse" effects.

# CapricEngine v2.26

## Changelog (v2.26)

*   **Advanced Generators Integration:** Seven new advanced musical generators have been added to expand the creative possibilities of the engine. Each generator is equipped with its own musical logic and is fully integrated into the existing architecture, including section-based caching for musical consistency.
    *   **Countermelody:** Creates a secondary melodic line that arpeggiates the chords, alternating between ascending and descending patterns to create movement and interest.
    *   **Texture:** Generates an airy, generative pad using high-octave notes (root, fifth, ninth) with slight timing variations to create a "shimmering" effect.
    *   **Drones:** Produces a sustained root note of the chord, with a small chance of playing the fifth or third to add subtle variation.
    *   **Ornament:** Adds realistic musical embellishments, such as trills and grace notes, with a low probability at the end of chord slots.
    *   **Miasmatic:** Uses a library of 15 "miasma" vocal riffs, dynamically varying the velocity, duration, and octave of each note to make every performance unique.
    *   **Percussion:** Includes a library of Rock, Funk, and Latin rhythmic patterns. It uses a fallback algorithm for non-4/4 time signatures to ensure a coherent result.
    *   **Glitch Fx:** Adds tempo-synced glitch effects (stutter, pitch riser, gate) that are randomly triggered on strong beats, anchoring the chaos to the song's structure.
*   **Architectural Enhancements:**
    *   **Multi-track MIDI Export:** The MIDI export logic has been upgraded to support an arbitrary number of tracks, allowing all new generated parts to be included in a single MIDI file.
    *   **Centralized Track Management:** A new helper function, `addTrackToMidiData`, has been implemented to centralize the process of adding new tracks to the main song data object.
*   **UI Fixes:**
    *   Resolved a regression where action buttons would not appear after song generation. All generator buttons are now correctly displayed.

# CapricEngine v2.25

## Changelog (v2.25)

*   **Dynamic Harmony Engine:** The harmonic engine now generates a variable number of chords per section (from 2 to 5) instead of a fixed number. This creates more natural and varied harmonic progressions.
    *   The number of chords is chosen based on the section type (e.g., verses are more likely to have 3-5 chords, while bridges might have 2-3).
    *   The rhythm of the chords is dynamically adjusted to fit the section's length, ensuring all instruments remain perfectly synchronized.
    *   This change affects all generative modules (melody, bass, arpeggiator), which now adapt to the new harmonic structure.

## Changelog (v2.24)

*   **Surreal Title Generator:** Implemented a new Dada-inspired title generator (`phalbo-title-generator.js`) using extensive word libraries and `chance.js` for creative and unique song titles.
*   **UI and Text Cleanup:**
    *   Fully translated the UI and text file outputs to English.
    *   Corrected the "Arpeggiator" button logic to prevent it from reverting to its old name.
    *   Sanitized generated MIDI file names to be based on the new unique titles.
    *   Removed obsolete sections from the generated text file for a cleaner output.
*   **Enhanced Chord Glossary:** The initial view of a chord's fingering in the glossary is now randomized, offering more variety at first glance.
*   **Bug Fixes:**
    *   Consolidated the `getWeightedRandom` function into a single, robust version in `theory-helpers.js` to fix a critical `TypeError`.

## Changelog (v2.23)

*   **Arpeggiator Overhaul:**
    *   Renamed "Chord Rhythm" generator to "Arpeggiator" for clarity.
    *   Massively expanded the arpeggiator's capabilities with a wide variety of new melodic and rhythmic patterns.
    *   Added support for chord inversions to create more melodic arpeggios.
    *   Fixed a critical bug where the wrong `getWeightedRandom` function was being called, causing crashes.
*   **Expanded Drum Library:**
    *   Added a significant number of new, genre-specific drum patterns (Rock, Pop, Funk, Metal, Electronic).
    *   Modularized the drum pattern library for easier future expansion.
*   **UI Updates:**
    *   Updated the UI to reflect the new "Arpeggiator" naming.

## Changelog (v2.22)

*   **MIDI Generation Overhaul:** Fixed critical bugs in the MIDI generation logic for all instruments.
    *   Resolved issues with "gaps" between musical phrases and notes extending beyond their intended duration.
    *   Ensured all tracks (Melody, Vocal, Bass, Drums) are perfectly synchronized.
*   **Robust Caching System:** Implemented a reliable caching system for all generated parts (melody, vocals, basslines, and drum patterns).
    *   Repeated sections (e.g., "Verse 1", "Verse 2") now have identical musical content, leading to more coherent and structured songs.
    *   The cache is intelligently cleared for each new song generation.

## Changelog (v2.21)

*   **Modal Interchange:** Implemented an optional modal interchange feature that allows the generator to borrow chords from parallel modes. This can be enabled or disabled in the UI.
*   **Bassline Improvements:**
    *   The bassline generator now has a higher minimum note range to prevent notes from going too low.
    *   Added a library of new rhythmic patterns for the bassline, increasing its variety.

## Changelog (v2.20) 


*   **Mood-Based Generation:** The song generation logic has been significantly improved to be more mood-aware.
    *   **Song Structure Templates:** Added 20 new song structure templates, each with a descriptive name (e.g., "Build & Collapse", "Fast Spiral") and associated with a specific mood. The UI now displays these names and filters them based on the selected mood.
    *   **Mood Profiles:** Introduced a new `MOOD_PROFILES` data structure that links moods to specific scales and style notes. This ensures a more coherent and context-aware musical output.
    *   **Smarter Key Selection:** When "Random" is selected for the key, the engine now chooses from a list of scales appropriate for the selected mood.

*   **UI/UX Improvements:**
    *   The "Structure Template" dropdown is now dynamically populated based on the selected mood.
    *   "Style Notes" are now displayed in the UI, providing a hint about the musical direction of the generated piece.

*   **Code Refactoring:**
    *   Replaced the old `MOOD_SONG_STRUCTURES` with the more comprehensive `MOOD_PROFILES`.
    *   Refactored the song generation and UI rendering logic to use the new mood-based system.

## Overview

CapricEngine is a web-based application that procedurally generates musical compositions. It allows users to select a mood, tempo, and key, and then generates a complete song structure with chords, a bassline, a melody, and a drum track. The application is built with HTML, CSS, and JavaScript, and uses the `midiwriter.js` library to export the generated music as MIDI files.

## Architecture

The application is divided into several modules, each responsible for a specific part of the song generation process.

### Core Modules

*   **`main/app-song-generation.js`**: This is the main module that orchestrates the song generation process. It defines the song structure, generates the chord progression, and creates the `mainChordSlots` that are used by the other generators.
*   **`main/app-midi-export.js`**: This module handles the creation and download of MIDI files for each track. It contains functions to generate the MIDI events for the chords, bassline, melody, and drums.
*   **`main/app-ui-render.js`**: This module is responsible for rendering the generated song data in the user interface. It displays the song structure, chords, and other information.
*   **`main/app-setup.js`**: This module initializes the application, sets up the user interface, and attaches event listeners to the various controls.

### Generator Modules


*   **`gen/generateBassLineForSong.js`**: This module generates the bassline for the song. It uses a sophisticated algorithm to create a bassline that is both rhythmically and harmonically interesting.
*   **`gen/bass-pitch-selector.js`**: This module contains the logic for selecting the pitches for the bassline. It uses a weighted random selection process to choose notes that are harmonically appropriate and create a smooth bassline.
*   **`gen/melody-generator.js`**: This module generates the melody for the song.
*   **`gen/generateVocalLineForSong.js`**: This module generates a vocal line for the song.
*   **`gen/generateDrumTrackForSong.js`**: This module generates the drum track for the song.

### Library Modules

*   **`lib/theory-helpers.js`**: This module contains a collection of helper functions for performing music theory calculations, such as getting the notes of a chord or a scale.
*   **`lib/config-music-data.js`**: This module contains the configuration data for the application, such as the available moods, tempos, and keys.
*   **`lib/midiwriter.js`**: This is an external library that is used to create the MIDI files.

## Future Development

Here is a list of potential improvements and new features for future versions of CapricEngine:

### 1. Humanization and Dynamics

*   **Centralized Velocity Humanization:** Introduce a `humanizeVelocity(base = 80, range = 10)` function to be used across all generators (melody, bass, drums, vocals). This function should not only add randomness but also incorporate musical logic, such as accenting strong beats, creating crescendos/decrescendos, and generating ghost notes.
*   **Micro-timing Adjustments:** Introduce subtle variations in the `startTick` of notes (e.g., +/- 5 ticks) to create a more human-like groove and swing feel.

### 2. Expanded Rhythmic and Harmonic Variety

*   **Advanced Arpeggios:** Create an `ARPEGGIO_PATTERNS` library with a variety of arpeggio patterns (e.g., root-fifth-third-octave, minor-7th, pentatonic, dominant-tension). The generator will then probabilistically select from this library to create more interesting and varied arpeggios for the bass and rhythm chords.
*   **Expanded Bass Rhythmic Patterns:** Continue to expand the `BASS_RHYTHMIC_PATTERNS` library with more genre-specific patterns (e.g., funk, reggae, disco, alt-rock) to increase the rhythmic variety of the basslines.

### 3. Generative Basslines

*   **Generative Bass Mode:** Add a "GENERATIVE" mode to the bassline generator that creates note durations based on weighted probabilities (e.g., 70% = 1 beat, 20% = 0.5 beats, 10% = 2 beats or legato). This will create more unpredictable and organic basslines.
*   **Intelligent Walking Basslines:** Implement a `generateWalkingLineToNextRoot()` function that connects the current root note to the next one with a series of diatonic or chromatic passing notes. This will be particularly useful for creating smooth transitions in bridges and verses.

### 4. Expanded Song Structures

*   **More Structure Templates:** Increase the number of available song structure templates from 10 to 20.
*   **Named and Categorized Structures:** Each structure template should have a descriptive name (e.g., "Emotive Ballad," "Riff & Release," "Funk Jam") and be categorized by mood or genre in the UI to make it easier for users to find the structure they're looking for.

### 5. Improved Melody and Vocal Lines

*   **Vocal Articulation and Dynamics:** Add more realistic variations in velocity to the vocal lines, with accents on the beginning and end of phrases.
*   **More Varied Vocal Rhythms:** Reduce the number of forced repetitions and introduce more natural-sounding pauses to make the vocal lines less monotonous.
*   **Contour-Based Melodies:** Implement support for generating melodies based on predefined contours (e.g., rising, falling, arch).

### 6. Humanized Drumming

*   **Hi-Hat Dynamics:** Introduce variations in hi-hat velocity to create a more realistic pop groove.
*   **Snare and Kick Variations:** Add subtle variations in the timing and velocity of snare and kick hits.
*   **Ghost Notes and Backbeat Accents:** Incorporate ghost notes and accents on the backbeat to create more dynamic and interesting drum patterns.

### 7. User Experience and Exporting

*   **In-Browser MIDI Preview:** Allow users to preview the generated tracks in the browser using the Web Audio API and a SoundFont or a library like `tone.js`.
*   **MusicXML Export:** Consider adding the ability to export the generated music as MusicXML files, which can be imported into a wide range of notation software.
*   **Custom Presets:** Allow users to save their own custom patterns and presets for future use.

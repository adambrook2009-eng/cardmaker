/**
 * Встроенная музыка — ноты, а не аудиофайлы: синтезируется в браузере (Web Audio),
 * весит байты, работает офлайн и не имеет проблем с лицензиями.
 * Народные/общественное достояние: Happy Birthday, Jingle Bells, Twinkle Twinkle.
 * Остальные мелодии — оригинальные.
 *
 * Нотация: «нота/доли» через пробел. C4…B5 — ноты, # и b — диез/бемоль, R — пауза.
 * Аккорды: «Am3/4» — ля минор от A3 на 4 доли. Без «/» — 1 доля.
 */
export type TrackId = 'birthday' | 'jingle' | 'twinkle' | 'romantic' | 'calm' | 'funny' | 'party';
export type InstrumentId = 'musicBox' | 'lead' | 'soft' | 'bell' | 'pad' | 'bass';
export type ChordStyle = 'pulse' | 'arp' | 'pad' | 'hold';

export interface Track {
  id: TrackId;
  icon: string;
  bpm: number;
  melody: string;
  lead: InstrumentId;
  chords?: string;
  style?: ChordStyle;
  harmony?: InstrumentId;
  /** Бочка на 1 и 3 долю, хай-хэт на восьмые. */
  drums?: boolean;
}

export const TRACKS: Track[] = [
  {
    id: 'birthday',
    icon: '🎂',
    bpm: 120,
    lead: 'musicBox',
    melody:
      'G4/.75 G4/.25 A4 G4 C5 B4/2 G4/.75 G4/.25 A4 G4 D5 C5/2 G4/.75 G4/.25 G5 E5 C5 B4 A4 F5/.75 F5/.25 E5 C5 D5 C5/2 R',
    chords: 'R C3/3 G2/3 G2/3 C3/3 C3/3 F2/3 C3/1.5 G2/1.5 C3/3',
    style: 'pulse',
    harmony: 'bass',
  },
  {
    id: 'jingle',
    icon: '🔔',
    bpm: 150,
    lead: 'musicBox',
    melody:
      'E5 E5 E5/2 E5 E5 E5/2 E5 G5 C5/1.5 D5/.5 E5/4 F5 F5 F5/1.5 F5/.5 F5 E5 E5 E5/.5 E5/.5 E5 D5 D5 E5 D5/2 G5/2 ' +
      'E5 E5 E5/2 E5 E5 E5/2 E5 G5 C5/1.5 D5/.5 E5/4 F5 F5 F5/1.5 F5/.5 F5 E5 E5 E5/.5 E5/.5 G5 G5 F5 D5 C5/4',
    chords: 'C3/4 C3/4 C3/4 C3/4 F2/4 C3/4 D3/4 G2/4 C3/4 C3/4 C3/4 C3/4 F2/4 C3/4 G2/4 C3/4',
    style: 'pulse',
    harmony: 'bass',
    drums: true,
  },
  {
    id: 'twinkle',
    icon: '⭐',
    bpm: 96,
    lead: 'musicBox',
    melody:
      'C5 C5 G5 G5 A5 A5 G5/2 F5 F5 E5 E5 D5 D5 C5/2 G5 G5 F5 F5 E5 E5 D5/2 G5 G5 F5 F5 E5 E5 D5/2 ' +
      'C5 C5 G5 G5 A5 A5 G5/2 F5 F5 E5 E5 D5 D5 C5/2',
    chords: 'C3/4 F3/4 C3/4 G2/4 C3/4 G2/4 C3/4 G2/4 C3/4 F3/4 C3/4 C3/4',
    style: 'arp',
    harmony: 'soft',
  },
  {
    id: 'romantic',
    icon: '🌹',
    bpm: 76,
    lead: 'soft',
    melody: 'E5/3 G5 A5/2 E5/2 F5/3 E5 D5/4 E5/3 G5 A5/2 C6/2 B5/2 G5/2 C6/4',
    chords: 'C3/4 Am2/4 F2/4 G2/4 C3/4 Am2/4 G2/4 C3/4',
    style: 'arp',
    harmony: 'soft',
  },
  {
    id: 'calm',
    icon: '🕊️',
    bpm: 58,
    lead: 'bell',
    melody: 'E5/4 C5/4 G4/4 B4/4 A4/4 F4/4 G4/4 R/4',
    chords: 'Am3/4 F3/4 C3/4 G3/4 Am3/4 F3/4 C3/4 G3/4',
    style: 'pad',
    harmony: 'pad',
  },
  {
    id: 'funny',
    icon: '🤪',
    bpm: 140,
    lead: 'lead',
    melody:
      'C5/.5 R/.5 E5/.5 G5/.5 A5/.5 G5/.5 E5 F5/.5 R/.5 A5/.5 F5/.5 E5/.5 C5/.5 D5 ' +
      'C5/.5 R/.5 E5/.5 G5/.5 C6/.5 B5/.5 A5/.5 G5/.5 F5/.5 D5/.5 B4/.5 D5/.5 C5 R',
    chords: 'C3/4 F2/4 C3/4 G2/4',
    style: 'pulse',
    harmony: 'bass',
    drums: true,
  },
  {
    id: 'party',
    icon: '🪩',
    bpm: 124,
    lead: 'lead',
    melody:
      'E5/.5 G5/.5 C6 B5/.5 A5/.5 G5 D5/.5 G5/.5 B5 A5/.5 G5/.5 D5 C5/.5 E5/.5 A5 G5/.5 E5/.5 C5 A4/.5 C5/.5 F5 E5/.5 D5/.5 C5',
    chords: 'C3/4 G2/4 Am2/4 F2/4',
    style: 'pulse',
    harmony: 'bass',
    drums: true,
  },
];

export const getTrack = (id: TrackId) => TRACKS.find((t) => t.id === id)!;

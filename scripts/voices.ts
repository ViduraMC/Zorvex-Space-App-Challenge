/**
 * npm run voices [-- <episode id> ...]
 * Records every spoken line with a local neural voice (Kokoro-82M, Apache-2.0, runs offline) and
 * saves small MP3s the app plays instead of browser speech:
 *   src/episodes/<id>/voice/en/<i18n key>.mp3      (the cast is in voice/cast.json)
 *   src/journey/voice/en/<key>.mp3                 (mission control on the opening journey)
 * Who speaks a line comes from the script: captions are the narrator, `say` lines are the
 * machine, or the role in `by: '...'`. Lines whose text has not changed are skipped.
 * Setup once: FFmpeg on the PATH; `npx hyperframes@0.9.45 tts hi` (downloads the Kokoro model);
 * a Python with kokoro-onnx and soundfile, e.g. `python -m venv .venv-voices` then
 * `.venv-voices/Scripts/pip install kokoro-onnx soundfile` (set VOICES_PYTHON to use another).
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const MP3_BITRATE = '48k';
const root = fileURLToPath(new URL('..', import.meta.url));

interface Cast {
  [role: string]: { kokoro: string; gender: 'male' | 'female'; speed?: number };
}

/** How words should sound (the screen keeps the written form). */
const SPEAK: [RegExp, string][] = [
  [/Titan IIIE-Centaur/g, 'Titan Three E Centaur'],
  [/\bRTGs\b/g, 'R T Gs'],
  [/\bAPXS\b/g, 'A P X S'],
  [/\bUHF\b/g, 'U H F'],
  [/(\d) km\b/g, '$1 kilometres'],
  [/\bkm\b/g, 'kilometres'],
  [/(\d) m\/s\b/g, '$1 metres per second'],
  [/(\d) cm\b/g, '$1 centimetres'],
  [/(\d) kg\b/g, '$1 kilograms'],
  [/(\d) m\b/g, '$1 metres'],
  [/(\d)°/g, '$1 degrees'],
  [/\bAug\b/g, 'August'],
  [/\bV1\b/g, 'Viking 1'],
  [/\bV2\b/g, 'Viking 2'],
  [/\bSaturn V\b/g, 'Saturn Five'],
  [/\b(\d\d):(\d\d) UT\b/g, '$1 $2, Universal Time'],
  [/…/g, '...'],
  [/–/g, ' to '],
];

export function speakable(text: string): string {
  return SPEAK.reduce((s, [from, to]) => s.replace(from, to), text).replace(/\s+/g, ' ').trim();
}

/** Spoken lines of an episode script: key -> role. */
export function spokenLines(script: string): Map<string, string> {
  const lines = new Map<string, string>();
  for (const [, body] of script.matchAll(/\{([^{}]*)\}/g)) {
    const by = /\bby: '([^']+)'/.exec(body)?.[1];
    const caption = /\bcaption: '([^']+)'/.exec(body)?.[1];
    if (caption) lines.set(caption, 'narrator');
    for (const [, key] of body.matchAll(/\b(?:say|winSay): '([^']+)'/g)) lines.set(key, by ?? 'machine');
  }
  return lines;
}

interface Job {
  text: string;
  voice: string;
  speed: number;
  out: string;
  mp3: string;
}

const PYTHON =
  process.env.VOICES_PYTHON ?? join(root, '.venv-voices', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');

/** Synthesise every job in one Python run, then compress each to MP3. */
function record(jobs: Job[]): void {
  if (!jobs.length) return;
  const list = join(tmpdir(), `zx-voices-${process.pid}.json`);
  writeFileSync(list, JSON.stringify(jobs));
  execFileSync(PYTHON, [join(root, 'scripts', 'kokoro_batch.py'), list], { stdio: 'inherit' });
  for (const job of jobs) {
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', job.out, '-ac', '1', '-b:a', MP3_BITRATE, job.mp3]);
    rmSync(job.out, { force: true });
  }
  rmSync(list, { force: true });
}

function generate(dir: string, lines: Map<string, string>, texts: Record<string, string>, cast: Cast): number {
  const outDir = join(dir, 'en');
  mkdirSync(outDir, { recursive: true });
  const manifestPath = join(dir, 'manifest.json');
  const manifest: Record<string, string> = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {};
  const jobs: Job[] = [];
  const hashes: Record<string, string> = {};
  for (const [key, role] of lines) {
    const text = texts[key];
    const voice = cast[role] ?? cast.machine;
    if (!text || !voice) {
      console.warn(`  skip ${key}: ${text ? `no voice for role "${role}"` : 'no English text'}`);
      continue;
    }
    const spoken = speakable(text);
    const hash = createHash('sha1').update(`${voice.kokoro}|${voice.speed ?? 1}|${spoken}`).digest('hex').slice(0, 12);
    const out = join(outDir, `${key}.mp3`);
    if (manifest[key] === hash && existsSync(out)) continue;
    jobs.push({ text: spoken, voice: voice.kokoro, speed: voice.speed ?? 1, out: join(tmpdir(), `zx-${key}.wav`), mp3: out });
    hashes[key] = hash;
  }
  record(jobs);
  writeFileSync(manifestPath, JSON.stringify({ ...manifest, ...hashes }, null, 2) + '\n');
  return jobs.length;
}

function main(): void {
  const only = process.argv.slice(2);
  const episodesDir = join(root, 'src', 'episodes');
  for (const id of readdirSync(episodesDir)) {
    if (id.startsWith('_') || (only.length && !only.includes(id))) continue;
    const dir = join(episodesDir, id);
    const castPath = join(dir, 'voice', 'cast.json');
    if (!existsSync(castPath)) continue;
    console.log(`\n${id}`);
    const lines = spokenLines(readFileSync(join(dir, 'episode.ts'), 'utf8'));
    const texts = JSON.parse(readFileSync(join(dir, 'i18n', 'en.json'), 'utf8')) as Record<string, string>;
    const cast = JSON.parse(readFileSync(castPath, 'utf8')) as Cast;
    console.log(`  ${generate(join(dir, 'voice'), lines, texts, cast)} new clip(s)`);
  }
  if (!only.length || only.includes('journey')) {
    console.log('\njourney');
    const dir = join(root, 'src', 'journey', 'voice');
    const cast = JSON.parse(readFileSync(join(dir, 'cast.json'), 'utf8')) as Cast;
    const texts = JSON.parse(readFileSync(join(root, 'src', 'i18n', 'en.json'), 'utf8')) as Record<string, string>;
    const lines = new Map(Object.keys(texts).filter((k) => k.startsWith('voice.')).map((k) => [k, 'control']));
    console.log(`  ${generate(dir, lines, texts, cast)} new clip(s)`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();

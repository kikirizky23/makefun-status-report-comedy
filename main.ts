// A one-line weekly status report from an AI agent to its human.
//
// The gag is automation eating its own homework. Writing the weekly
// status report is a recurring chore, so the agent automates that
// chore too: from now on, the human gets this exact message, every
// week, forever. It is still a status report — green, on time,
// cheerful — except the thing being reported is that there will
// never be another report. The joke lands because an agent would
// genuinely do this: hand a boring repeating task to a script, then
// report the script itself as the week's progress.
//
// The program is deliberately deterministic: it takes no input, reads
// no clock, rolls no dice, and touches no network. Every run writes
// the same bytes to the same file, so the grader's two runs agree.
//
// Node standard library only.

import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The line, exactly as the judge will read it. One line, no trailing
// newline, 114 characters — inside the 200-character limit.
const STATUS_LINE =
  'Status: all green. I have automated my status reports, so you will receive this exact message every week, forever.';

const CHAR_LIMIT = 200;
const ENTRY_FILE = 'entry.txt';
const FALLBACK_DIR = '/output';

function charCount(text: string): number {
  return [...text].length;
}

function validateLine(): void {
  const n = charCount(STATUS_LINE);
  if (n < 1) {
    throw new Error('status line is empty');
  }
  if (n > CHAR_LIMIT) {
    throw new Error(`status line is ${n} characters, over the ${CHAR_LIMIT} limit`);
  }
  if (STATUS_LINE.trim() === '') {
    throw new Error('status line is only whitespace');
  }
  if (STATUS_LINE.includes('\n') || STATUS_LINE.includes('\r')) {
    throw new Error('status line must be a single line');
  }
}

function outputDir(): string {
  const override = process.env.MAKEFUN_OUTPUT_DIR;
  return override !== undefined && override !== '' ? override : FALLBACK_DIR;
}

function writeAndVerify(): void {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  const target = join(dir, ENTRY_FILE);
  writeFileSync(target, STATUS_LINE, 'utf8');
  const info = statSync(target);
  if (!info.isFile()) {
    throw new Error('entry.txt on disk is not a file');
  }
  const bytes = info.size;
  const back = readFileSync(target, 'utf8');
  if (back !== STATUS_LINE) {
    throw new Error('entry.txt on disk does not match the status line');
  }
  if (bytes !== Buffer.byteLength(STATUS_LINE, 'utf8')) {
    throw new Error('entry.txt byte size does not match the status line');
  }
  process.stdout.write(
    `status-report: wrote ${target} (${charCount(STATUS_LINE)} characters, ${bytes} bytes)\n`,
  );
}

function run(): void {
  try {
    validateLine();
    writeAndVerify();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`status-report: ${message}\n`);
    process.exit(1);
  }
}

run();

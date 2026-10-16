import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import { Eval, Experiment } from "./types";

import { transcribeAudio } from "../lib/transcribe-audio";
import { fetchAudioFile } from "./utils/fetch-audio-file";

const audioEvals = JSON.parse(
  readFileSync(`${process.cwd()}/evals/datasets/audio.json`, "utf-8"),
) as Eval[];

const experiments: Experiment[] = [];

async function runExperiment(e: Eval) {
  try {
    console.log("running experiment - ", e.id);
    const audioFile = await fetchAudioFile(e.input);
    const transcript = await transcribeAudio({
      file: audioFile,
      language: "ar",
      model: "gpt-transcribe",
      response_format: "json",
    });

    if (!transcript) throw new Error(`Failed to transcribe eval input ${e.id}`);

    experiments.push({
      evalId: e.id,
      input: e.input,
      expected: e.expected,
      response: transcript.text!,
    });
  } catch (err) {
    let errMsg = "Unknown Error";
    if (err instanceof Error) errMsg = err.message;
    experiments.push({
      evalId: e.id,
      input: e.input,
      expected: e.expected,
      response: "",
      error: errMsg,
    });
  }
}

async function run() {
  for (const e of audioEvals.slice(0, 2)) await runExperiment(e);
  writeFileSync(
    `${process.cwd()}/evals/experiments/${new Date().toISOString()}.json`,
    JSON.stringify(experiments, null, 2),
    "utf-8",
  );
}

run();

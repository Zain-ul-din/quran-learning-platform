export type EvalDifficulty = "simple" | "medium" | "hard" | "edge";
export type EvalLayer = "audio" | "classification";
export type AudioDialect = string;

export type EvalMetadata = {
  chapter: number;
  verses: number[];
};

export type Eval = {
  id: string;
  input: string;
  expected: string;
  difficulty: EvalDifficulty;
  metadata: EvalMetadata;
} & {
  layer: "audio";
  dialect: AudioDialect;
};

export interface Experiment {
  evalId: string;
  input: string;
  expected: string;
  response: string;
  error?: string;
}

/*
Metric	              |  Weight   |  What it evaluates
------------------------------------------------------------------------------------------ 
Word accuracy	      |  40%	  |  Correct Arabic words
Completeness	      |  25%	  |  Missing or extra words
Word sequence	      |  15%	  |  Correct ordering of words
Arabic orthography	  |  10%	  |  Spelling and letter accuracy
Diacritics accuracy	  |  5%	      |  Harakat, shaddah, and other vowel marks, when provided
Qur'anic notation	  |  5%	      |  Pause symbols and script conventions, when required
---------------------------------------------------------------------------------------------
*/
export interface ScoredExperiment extends Experiment {
  score: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

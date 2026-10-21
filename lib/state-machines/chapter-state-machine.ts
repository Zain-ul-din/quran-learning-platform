import { assign, sendTo, setup } from "xstate";
import { recordAudio } from "./actions/record-audio";
import { evaluateAudio } from "./actions/evaluate-audio";
import { ChapterStateMachineContext, Events } from "./types";
import { playVerse } from "./actions/play-verse";
import { play } from "cuelume";

export const createChapterStateMachine = ({
  chapter,
  recitation,
  verses,
}: Pick<ChapterStateMachineContext, "chapter" | "recitation" | "verses">) => {
  const machine = setup({
    types: {
      context: {} as ChapterStateMachineContext,
      events: {} as Events,
    },
    actors: {
      recordAudio,
      evaluateAudio,
      playVerse,
    },
  }).createMachine({
    id: "root",
    initial: "idle",
    context: {
      chapter,
      recitation,
      verses,
      selectedVerse: verses[0],
      recitationContext: {},
      recitedVerses: {},
      listeningContext: {},
    },
    on: {
      RESET: {
        target: ".idle",
        actions: assign({
          selectedVerse: () => verses[0],
          recitationContext: () => ({}),
          recitedVerses: () => ({}),
          listeningContext: () => ({}),
        }),
      },
    },
    states: {
      idle: {
        on: {
          RECORD: "recitation",
          LISTEN: "listening",
          "verse.update": {
            actions: assign({
              selectedVerse: ({ event, context }) =>
                event.verse ?? context.selectedVerse,
            }),
          },
        },
      },
      recitation: {
        id: "recitation",
        initial: "recording",
        entry: [
          assign({
            recitationContext: ({ context }) => {
              return {
                ...context.recitationContext,
                error: undefined,
                notice: undefined,
              };
            },
          }),
          () => play("toggle", { theme: "bubble" }),
        ],
        states: {
          recording: {
            exit: () => play("toggle", { theme: "bubble" }),
            invoke: {
              id: "microphone",
              src: "recordAudio",
              input: { mimeType: undefined },
            },
            on: {
              STOP: {
                actions: [
                  sendTo("microphone", {
                    type: "STOP",
                  }),
                ],
              },
              "audio.elapsedMs": {
                actions: assign({
                  recitationContext: ({ event, context }) => {
                    return {
                      ...context.recitationContext,
                      elapsedMs: event.elapsedMs,
                    };
                  },
                }),
              },
              "audio.stream": {
                actions: assign({
                  recitationContext: ({ event, context }) => {
                    return {
                      ...context.recitationContext,
                      stream: event.stream,
                    };
                  },
                }),
              },
              "audio.recoded": [
                {
                  target: "evaluating",
                  actions: assign({
                    recitationContext: ({ event, context }) => {
                      return {
                        ...context.recitationContext,
                        audio: event.blob,
                      };
                    },
                  }),
                  guard: ({ event }) => {
                    const isValid = Boolean(event.blob) && event.blob.size > 0;
                    return isValid;
                  },
                },
                {
                  target: "#root.idle",
                },
              ],
              "audio.permissionGranted": {
                target: "#root.idle",
                actions: assign({
                  recitationContext: ({ context }) => {
                    return {
                      ...context.recitationContext,
                      notice: "Microphone access granted — hold to recite.",
                    };
                  },
                }),
              },
              "audio.error": {
                target: "#root.idle",
                actions: assign({
                  recitationContext: ({ event, context }) => {
                    return {
                      ...context.recitationContext,
                      error: event.error,
                    };
                  },
                }),
              },
            },
          },
          evaluating: {
            invoke: {
              id: "evaluation",
              src: "evaluateAudio",
              input: ({ context }) => ({
                blob: context.recitationContext.audio!,
                chapter: context.chapter,
                selectedVerse: context.selectedVerse,
              }),
            },
            on: {
              "evaluation.stream": {
                actions: assign({
                  recitedVerses: ({ event, context }) => {
                    return {
                      ...context.recitedVerses,
                      [event.verseId]: event.recitedWords,
                    };
                  },
                }),
              },
              "evaluation.success": {
                target: "#root.idle",
                actions: [
                  assign({
                    selectedVerse: ({ context }) => {
                      const currIdx = context.verses.findIndex(
                        (v) => v.id === context.selectedVerse.id,
                      );
                      return (
                        context.verses[currIdx + 1] ?? context.selectedVerse
                      );
                    },
                  }),
                  () => play("success", { theme: "bubble" }),
                ],
              },
              "evaluation.unsuccess": {
                target: "#root.idle",
                actions: [() => play("error", { theme: "bubble" })],
              },
              "evaluation.error": {
                target: "#root.idle",
                actions: assign({
                  recitationContext: ({ event, context }) => {
                    return {
                      ...context.recitationContext,
                      error: event.error,
                    };
                  },
                }),
              },
            },
          },
        },
      },
      listening: {
        invoke: {
          id: "play",
          src: "playVerse",
          input: ({ context }) => {
            return {
              recitation: context.recitation!,
              selectedVerse: context.selectedVerse,
            };
          },
        },
        on: {
          RECORD: "recitation",
          "verse.update": {
            actions: assign({
              selectedVerse: ({ event, context }) =>
                event.verse ?? context.selectedVerse,
            }),
            reenter: true,
            target: "listening",
          },
          PAUSE: {
            actions: [
              sendTo("play", {
                type: "play.pause",
              }),
            ],
          },
          "play.updateCurrentTime": {
            actions: assign({
              listeningContext: ({ context, event }) => {
                return {
                  ...context.listeningContext,
                  currentTime: event.currentTime,
                };
              },
            }),
          },
          "play.stop": {
            target: "#root.idle",
          },
          "play.finish": {
            target: "#root.idle",
          },
        },
      },
    },
  });

  return machine;
};

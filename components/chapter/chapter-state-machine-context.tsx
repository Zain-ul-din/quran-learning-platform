import { createChapterStateMachine } from "@/lib/state-machines/chapter-state-machine";
import { ChapterRecitationWithTiming } from "@/lib/state-machines/types";
import { Chapter, Verse } from "@quranjs/api";
import { useMachine } from "@xstate/react";
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

type MachineProps = {
  chapter: Chapter;
  recitation?: ChapterRecitationWithTiming | null;
  verses: Verse[];
};

const useChapterStateMachine = ({
  chapter,
  recitation,
  verses,
}: MachineProps) => {
  const machine = useMemo(
    () =>
      createChapterStateMachine({
        chapter,
        recitation,
        verses,
      }),
    [chapter, recitation, verses],
  );

  const [state, send, actorRef] = useMachine(machine);
  const isFirstMachine = useRef(true);

  const reset = useCallback(() => {
    send({ type: "RESET" });
  }, [send]);

  useEffect(() => {
    if (isFirstMachine.current) {
      isFirstMachine.current = false;
      return;
    }
    send({ type: "RESET" });
  }, [machine, send]);

  return useMemo(
    () =>
      Object.assign([state, send, actorRef] as const, {
        reset,
      }),
    [state, send, actorRef, reset],
  );
};

type ChapterStateMachineContextType = ReturnType<typeof useChapterStateMachine>;

export const ChapterStateMachineContext =
  createContext<ChapterStateMachineContextType>(
    {} as ChapterStateMachineContextType,
  );

export function ChapterStateMachineProvider({
  chapter,
  verses,
  recitation,
  children,
}: MachineProps & {
  children: ReactNode;
}) {
  const stateMachine = useChapterStateMachine({
    chapter,
    verses,
    recitation,
  });

  return (
    <ChapterStateMachineContext value={stateMachine}>
      {children}
    </ChapterStateMachineContext>
  );
}

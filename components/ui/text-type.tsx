// Adapted from React Bits TextType: https://reactbits.dev
//
// Changes from the original:
// - TypeScript, and the cursor tween is killed on unmount.
// - initialDelay applies once, before the first sentence, not before every one.
// - Under reduced motion nothing types: fallbackText (or the first sentence) shows as is.
// - The typed text is aria-hidden; pass the full text yourself (e.g. an sr-only span)
//   so assistive tech doesn't read a half-typed string.

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";
import "./text-type.css";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export interface TextTypeProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  text: string | string[];
  as?: ElementType;
  typingSpeed?: number;
  initialDelay?: number;
  pauseDuration?: number;
  deletingSpeed?: number;
  loop?: boolean;
  showCursor?: boolean;
  hideCursorWhileTyping?: boolean;
  cursorCharacter?: ReactNode;
  cursorClassName?: string;
  cursorBlinkDuration?: number;
  textColors?: string[];
  variableSpeed?: { min: number; max: number };
  onSentenceComplete?: (sentence: string, index: number) => void;
  startOnVisible?: boolean;
  reverseMode?: boolean;
  /** Shown statically under reduced motion. Defaults to the first sentence. */
  fallbackText?: string;
}

export default function TextType({
  text,
  as: Component = "div",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className,
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName,
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  startOnVisible = false,
  reverseMode = false,
  fallbackText,
  ...props
}: TextTypeProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const [hasStarted, setHasStarted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const textArray = useMemo(() => (Array.isArray(text) ? text : [text]), [text]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION);
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setIsVisible(true);
      },
      { threshold: 0.1 },
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!showCursor || !cursor || reducedMotion) return;

    gsap.set(cursor, { opacity: 1 });
    const tween = gsap.to(cursor, {
      opacity: 0,
      duration: cursorBlinkDuration,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut",
    });
    return () => {
      tween.kill();
    };
  }, [showCursor, cursorBlinkDuration, reducedMotion]);

  useEffect(() => {
    if (!isVisible || reducedMotion) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    const currentText = textArray[currentTextIndex];
    const processedText = reverseMode ? currentText.split("").reverse().join("") : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === "") {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) return;

          onSentenceComplete?.(textArray[currentTextIndex], currentTextIndex);
          setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
          setCurrentCharIndex(0);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => prev.slice(0, -1));
          }, deletingSpeed);
        }
      } else if (currentCharIndex < processedText.length) {
        timeout = setTimeout(
          () => {
            setDisplayedText((prev) => prev + processedText[currentCharIndex]);
            setCurrentCharIndex((prev) => prev + 1);
          },
          variableSpeed ? getRandomSpeed() : typingSpeed,
        );
      } else {
        if (!loop && currentTextIndex === textArray.length - 1) return;
        timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      }
    };

    if (!hasStarted) {
      timeout = setTimeout(() => {
        setHasStarted(true);
        executeTypingAnimation();
      }, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reducedMotion,
    reverseMode,
    variableSpeed,
    onSentenceComplete,
  ]);

  const shown = reducedMotion ? (fallbackText ?? textArray[0]) : displayedText;
  const color = textColors.length > 0 ? textColors[currentTextIndex % textColors.length] : undefined;
  const shouldHideCursor =
    reducedMotion ||
    (hideCursorWhileTyping && (currentCharIndex < textArray[currentTextIndex].length || isDeleting));

  return (
    <Component ref={containerRef} className={cn("text-type", className)} aria-hidden {...props}>
      <span className="text-type__content" style={color ? { color } : undefined}>
        {shown}
      </span>
      {showCursor && (
        <span
          ref={cursorRef}
          className={cn("text-type__cursor", cursorClassName, shouldHideCursor && "text-type__cursor--hidden")}
        >
          {cursorCharacter}
        </span>
      )}
    </Component>
  );
}

"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const questions = [
    { question: "React", image: "/monster1.jpg" },
    { question: "TypeScript", image: "/monster2.jpg" },
    { question: "JISOU", image: "/monster3.jpg" },
    { question: "GitHub", image: "/monster4.jpg" },
    { question: "Next.js", image: "/monster5.jpg" },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [userName, setUserName] = useState("");
  // 追加
  const [startTime, setStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [score, setScore] = useState(0);

  // 追加
  const addResult = (userName: string, startTime: number) => {
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const timeInSeconds = totalTime / 1000;
    const baseScore = 10000;
    const timeDeduction = Math.floor(timeInSeconds * 100);
    const score = Math.max(1000, baseScore - timeDeduction);

    return { totalTime, score };
  };

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const currentQuestion = questions[currentQuestionIndex];
      if (
        e.key.toLowerCase() ===
        currentQuestion.question[currentPosition].toLowerCase()
      ) {
        setCurrentPosition((prev) => prev + 1);
      }

      if (currentPosition === currentQuestion.question.length - 1) {
        if (currentQuestionIndex === questions.length - 1) {
          // 追加
          const { totalTime, score } = addResult(userName, startTime);
          setTotalTime(totalTime);
          setScore(score);
          
          setIsCompleted(true);
        } else {
          setCurrentQuestionIndex((prev) => prev + 1);
          setCurrentPosition(0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPosition, currentQuestionIndex]);

  const handleStart = () => {
    if (!userName) {
      alert("名前を入力してください");
      return;
    }

    setIsStarted(true);

    // 追加
    setStartTime(Date.now());
  };

  if (!isStarted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="text-center p-8">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name..."
            className="w-64 p-3 text-lg"
          />
        </div>
        <div>
          <button
            onClick={handleStart}
            className="px-8 py-3 text-xl bg-red-900"
          >
            Start Game
          </button>
        </div>
      </main>
    );
  }


  // 修正
  if (isCompleted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="text-center p-8">
          <h2>Result</h2>
          <div className="mb-8 space-y-2">
            <p>Player: {userName}</p>
            <p>
              Time
              <span>{(totalTime / 1000).toFixed(2)}</span>
              seconds
            </p>
            <p>Score: {score}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div
        className="text-center w-full h-screen bg-cover bg-center flex flex-col items-center justify-center"
        style={{
          backgroundImage: `url(${questions[currentQuestionIndex].image})`,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backgroundBlendMode: "overlay",
        }}
      >
        <div>
          {questions[currentQuestionIndex].question
            .split("")
            .map((char, index) => (
              <span
                key={index}
                style={{
                  color: index < currentPosition ? "#ff0000" : "white",
                }}
              >
                {char}
              </span>
            ))}
        </div>
      </div>
    </main>
  );
}

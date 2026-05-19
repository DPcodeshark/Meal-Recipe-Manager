import { useState } from 'react'
import { Check, X as XIcon, RotateCcw } from 'lucide-react'

/**
 * Data-driven quiz block at the end of a lesson.
 *
 * <Quiz questions={[
 *   {
 *     q: 'What is Vite?',
 *     choices: ['A dev server and build tool', 'A database', 'A hosting service'],
 *     correct: 0,
 *     explanation: 'Vite is the bundler/dev server we use to run and build the React app.'
 *   },
 *   ...
 * ]} />
 */
export default function Quiz({ questions }) {
  const [answers, setAnswers] = useState({})

  function pick(qIdx, choiceIdx) {
    if (answers[qIdx]?.locked) return
    setAnswers(prev => ({
      ...prev,
      [qIdx]: { choice: choiceIdx, locked: true },
    }))
  }

  function reset() {
    setAnswers({})
  }

  const correctCount = Object.entries(answers)
    .filter(([qIdx, a]) => a.locked && a.choice === questions[qIdx].correct)
    .length

  return (
    <section className="quiz">
      <header className="quiz-header">
        <span className="quiz-label">Quick check</span>
        {Object.keys(answers).length > 0 && (
          <button type="button" className="quiz-reset" onClick={reset} title="Reset">
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </header>

      {questions.map((q, qIdx) => {
        const ans = answers[qIdx]
        const locked = !!ans?.locked
        return (
          <div key={qIdx} className="quiz-question">
            <p className="quiz-prompt"><span className="quiz-num">{qIdx + 1}.</span> {q.q}</p>
            <ol className="quiz-choices">
              {q.choices.map((choice, cIdx) => {
                const isPicked = ans?.choice === cIdx
                const isCorrect = q.correct === cIdx
                let state = ''
                if (locked && isPicked && isCorrect) state = 'correct'
                else if (locked && isPicked && !isCorrect) state = 'wrong'
                else if (locked && isCorrect) state = 'reveal'
                return (
                  <li key={cIdx}>
                    <button
                      type="button"
                      className={`quiz-choice ${state}`}
                      disabled={locked && !isPicked && !isCorrect}
                      onClick={() => pick(qIdx, cIdx)}
                    >
                      <span className="quiz-choice-letter">{String.fromCharCode(65 + cIdx)}</span>
                      <span className="quiz-choice-text">{choice}</span>
                      {locked && isPicked && isCorrect && <Check size={16} />}
                      {locked && isPicked && !isCorrect && <XIcon size={16} />}
                      {locked && !isPicked && isCorrect && <Check size={16} />}
                    </button>
                  </li>
                )
              })}
            </ol>
            {locked && q.explanation && (
              <p className="quiz-explanation">{q.explanation}</p>
            )}
          </div>
        )
      })}

      {Object.keys(answers).length === questions.length && (
        <div className="quiz-summary">
          You got <strong>{correctCount}</strong> of {questions.length} right.
          {correctCount === questions.length && ' 🎉'}
        </div>
      )}
    </section>
  )
}

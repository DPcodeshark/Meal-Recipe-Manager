import Quiz from '../components/Quiz.jsx'

export default function Welcome() {
  return (
    <>
      <p className="lead">
        Hey — welcome to a short course on how the Dinner App got built, and
        how to keep it running. The app lives at <a href="https://zavods.com/meals" target="_blank" rel="noopener noreferrer"><strong>zavods.com/meals</strong></a>; the code lives at <a href="https://github.com/DPcodeshark/Meal-Recipe-Manager" target="_blank" rel="noopener noreferrer">github.com/DPcodeshark/Meal-Recipe-Manager</a>.
      </p>

      <p>
        It's a real, deployed app. About 4,000 lines of code, mostly built in a
        long collaboration session with Claude Code. The point of this course
        isn't to make you memorize how every line works — it's to use this app
        as a tangible project to help you learn modern web design and how you
        can build really interesting things quickly in conjunction with Claude
        Code (or your favorite competitor).
      </p>

      <h2>Who this is for</h2>
      <p>
        This guide is written for a "smart but inexperienced" reader. The
        assumption is you know how to read code a bit, you've written some
        JavaScript, and you've used the command line. Anything beyond that,
        we'll explain when it comes up.
      </p>

      <h2>What you'll get</h2>
      <ul>
        <li>A mental model of the stack: React + Firebase + a sprinkle of serverless functions.</li>
        <li>The actual commands you need to run the app locally, deploy changes, and check what's broken.</li>
        <li>Patterns for working with Claude Code: when to delegate, how to phrase a request, what good output looks like, when to push back.</li>
        <li>Enough vocabulary to read other people's web apps and have it click.</li>
      </ul>

      <h2>How to use these lessons</h2>
      <p>
        Each lesson is short — 5 to 10 minutes if you read carefully. There's a
        quiz at the end of most of them; it's not a grade, it's a checkpoint to
        notice what didn't stick. <strong>You can't break anything by clicking
        around.</strong> Open the actual codebase in another tab while you read
        — the lessons get a lot less abstract when you can see the file we're
        talking about.
      </p>

      <h2>A note on AI</h2>
      <p>
        This app was built with Claude doing most of the typing and a human (your
        uncle) doing the directing, reviewing, and the occasional "no, do it like
        this instead." That's the workflow you'll learn — not "Claude writes
        everything and you click approve," but a real back-and-forth where you're
        the senior engineer and Claude is a fast, thorough, slightly over-eager
        junior who needs clear instructions and a careful eye on the diff.
      </p>

      <Quiz
        questions={[
          {
            q: "What's the most accurate way to describe how this app was built?",
            choices: [
              "Claude wrote everything autonomously with no human review",
              "A human directed, Claude typed, both reviewed and iterated",
              "A human wrote everything by hand, ignoring AI tools",
              "Claude only handled the CSS",
            ],
            correct: 1,
            explanation: "The right mental model for Claude Code work is collaboration, not autonomy. You're the engineer; Claude is a fast pair-programmer. Both halves matter.",
          },
          {
            q: "What should you do while reading these lessons?",
            choices: [
              "Memorize every line of code before moving on",
              "Open the actual codebase in another tab and look at the files we discuss",
              "Skip the quizzes — they don't matter",
              "Take notes on paper only",
            ],
            correct: 1,
            explanation: "Concrete > abstract. The lessons reference real files in the real repo; reading along with the code makes everything click faster.",
          },
        ]}
      />
    </>
  )
}

// Soft access gate for the Learn site. This is a "polite keep-out" sign,
// not real security — anyone who clones the public GitHub repo can read
// the lesson source directly, and anyone who reads the bundled JS in
// DevTools can see this value. It exists to deter casual drive-by traffic.
//
// To change: edit the string below, then run:
//   npm run build && firebase deploy --only hosting
export const LEARN_PIN = '3232'

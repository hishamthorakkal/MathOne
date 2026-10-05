import { canSpeak, speak } from '../engine/audio';

/** Renders text, highlighting **key numbers and clues**. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') ? (
          <mark key={i} className="clue">
            {p.slice(2, -2)}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

export function ReadAloud({ text, label = 'Read to Me' }: { text: string; label?: string }) {
  if (!canSpeak()) return null;
  return (
    <button type="button" className="btn btn-soft read-aloud" onClick={() => speak(text)} aria-label="Read the question aloud">
      🔊 <span>{label}</span>
    </button>
  );
}

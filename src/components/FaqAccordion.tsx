import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface Faq {
  question: string;
  answer: string;
}

export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="card divide-y divide-[var(--color-border)] overflow-hidden p-0">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-start justify-between gap-4 px-7 py-6 text-left transition-colors hover:bg-[var(--color-surface-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-accent)]"
                aria-expanded={isOpen}
              >
                <span className="text-lg font-semibold text-[var(--color-ink)]">
                  {faq.question}
                </span>
                <span className="mt-1 ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-raised)] text-[var(--color-ink-muted)] transition-transform duration-200">
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-7 pb-6">
                      <p className="max-w-2xl text-base leading-relaxed text-[var(--color-ink-muted)]">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

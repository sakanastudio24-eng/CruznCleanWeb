'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp, ChevronDown, ChevronUp, Clock3, Droplets, CreditCard, Car } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Returns the quick-help FAQ entries shown in the modal.
 */
function getQuickFaqs(): FaqItem[] {
  return [
    {
      question: 'How long does a detail take?',
      answer: 'Maintenance details usually take about 90 minutes. Full interior or exterior services run about 3 hours each, and a full reset can take 6 to 8 hours.',
      icon: Clock3,
    },
    {
      question: 'Do I need to provide water or power?',
      answer: 'No. Mobile jobs are planned to run with our own water and power setup where available.',
      icon: Droplets,
    },
    {
      question: 'What forms of payment do you accept?',
      answer: 'Cash, Zelle, Venmo, Cash App, and PayPal are accepted after service completion. Debit and credit card support is planned next.',
      icon: CreditCard,
    },
    {
      question: 'Can I book multiple cars at once?',
      answer: 'Yes. Add vehicles in the dock, select services per vehicle, then book all in one flow.',
      icon: Car,
    },
  ];
}

/**
 * Renders a modal with high-priority answers and FAQ links.
 */
export function QuickHelpModal(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dialogId = 'quick-help-dialog';
  const descriptionId = 'quick-help-description';
  const faqs = getQuickFaqs();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarCompensation > 0) {
      document.body.style.paddingRight = `${scrollbarCompensation}px`;
    }

    /**
     * Closes the modal when Escape key is pressed.
     */
    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('keydown', onKeydown);
    window.requestAnimationFrame(() => dialogRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      document.removeEventListener('keydown', onKeydown);
    };
  }, [open]);

  /**
   * Toggles expansion state for one FAQ row.
   */
  function toggleFaq(index: number): void {
    setExpandedIndex((current) => (current === index ? null : index));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative rounded-full p-2 text-white transition duration-300 hover:bg-white/10 hover:text-fog"
        aria-label="Open quick help"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
      >
        <CircleHelp className="h-5 w-5" />
      </button>

      {open && mounted
        ? createPortal(
            <div
              className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/60 px-4 py-6"
              role="presentation"
              onClick={() => setOpen(false)}
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="quick-help-title"
                aria-describedby={descriptionId}
                id={dialogId}
                tabIndex={-1}
                ref={dialogRef}
                className="gray-card relative my-auto w-full max-w-2xl transition-transform duration-300 animate-[fadeUp_0.25s_ease-out]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-fog/20 p-2 text-fog">
                      <CircleHelp className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 id="quick-help-title" className="font-heading text-xl font-semibold text-ink sm:text-2xl">
                        Quick Help
                      </h2>
                      <p id={descriptionId} className="text-sm text-ink/60">
                        Top questions from customers
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close quick help"
                  >
                    ✕
                  </button>
                </div>

                <div className="max-h-[70vh] space-y-2 overflow-y-auto px-5 py-4">
                  {faqs.map((faq, index) => {
                    const expanded = expandedIndex === index;
                    const Icon = faq.icon;

                    return (
                      <article key={faq.question} className="rounded-xl border border-white/10 bg-[#111111]">
                        <button
                          type="button"
                          onClick={() => toggleFaq(index)}
                          aria-expanded={expanded}
                          aria-controls={`quick-help-faq-answer-${index}`}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/10"
                        >
                          <span className="rounded-full bg-fog/20 p-2 text-fog">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="flex-1 text-sm font-semibold text-ink">{faq.question}</span>
                          {expanded ? <ChevronUp className="h-4 w-4 text-ink/55" /> : <ChevronDown className="h-4 w-4 text-ink/55" />}
                        </button>
                        {expanded ? (
                          <p id={`quick-help-faq-answer-${index}`} className="px-4 pb-4 text-sm text-ink/75">
                            {faq.answer}
                          </p>
                        ) : null}
                      </article>
                    );
                  })}

                  <div className="rounded-xl border border-white/15 bg-white/[0.06] p-4">
                    <p className="text-sm text-ink/75">
                      Need more details? View full FAQ or continue directly to booking.
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Link
                        href="/faq"
                        onClick={() => setOpen(false)}
                        className="rounded-full bg-charcoal px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-ink"
                      >
                        View Full FAQ
                      </Link>
                      <Link
                        href="/booking"
                        onClick={() => setOpen(false)}
                        className="rounded-full border border-fog px-4 py-2 text-center text-sm font-semibold text-fog transition hover:bg-fog/10"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

export function RaphaelFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "Is this AI Image Generator really 100% free?",
      answer:
        "Yes, absolutely. There is no signup, no subscription, no credit card required, and no hidden fees. You can visit the website and start creating neural images immediately with 0 credits.",
    },
    {
      question: "Why is there a 3-minute cooldown between image generations?",
      answer:
        "To ensure fair access for everyone and protect our inference clusters from abusive bot traffic without forcing users to sign in or complete annoying CAPTCHAs, we enforce a strict 3-minute fair usage window (1 generation every 3 minutes). The cooldown continues accurately even if you refresh or switch tabs.",
    },
    {
      question: "Can I choose which AI model generates my image?",
      answer:
        "Yes! You can choose between Auto Smart Router, Cloudflare Workers AI FLUX.1-schnell, Cloudflare SDXL Lightning (1024px), Cloudflare SDXL Base 1.0, Hugging Face FLUX.1, and AI Horde Distributed. If your preferred provider experiences high load, our fallback engine automatically routes to the best available backup.",
    },
    {
      question: "Do I need to create an account or provide an email?",
      answer:
        "No account is ever required. We do not ask for your email, phone number, or passwords. Your generated images and prompts are saved locally in your browser's private storage (IndexedDB) for convenience.",
    },
    {
      question: "Can I use the generated images for commercial projects?",
      answer:
        "Yes. You retain full ownership and rights over the images you generate through our platform. You are free to use them for personal artwork, websites, social media, marketing, and commercial products.",
    },
    {
      question: "How does the multi-cluster provider routing work?",
      answer:
        "Our backend health-checks multiple inference backends in real-time, tracking latency, neuron quotas, and error rates. When you request an image, it dynamically routes the generation to the fastest and highest quality healthy cluster.",
    },
  ];

  return (
    <section className="w-full max-w-[1128px] mx-auto py-10 border-t border-stone-200/80 dark:border-stone-800">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Everything you need to know about our free AI image generator and multi-model router
        </p>
      </div>

      <div className="space-y-3 max-w-3xl mx-auto">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#201913] overflow-hidden transition-all shadow-2xs"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-stone-900 dark:text-stone-100 cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-amber-600" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/80 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

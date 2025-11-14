import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Card({ title, subtitle, content, icon }) {
  return (
    <div>
      <div className="bg-white rounded-xl border border-card-primary shadow-sm p-5 mb-6">
        <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
          {icon}
          {title}
        </h1>
        <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
      </div>
      {content && (
        <motion.div
          className="rounded-2xl bg-white border border-card-primary shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6 mb-5"
          variants={fadeUp}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-xl font-bold text-[#007b91] mb-4">
            {content.title}
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  {content.step1?.title}
                </div>
                <div className="text-sm text-slate-600">
                  {content.step1?.description}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  {content.step2?.title}
                </div>
                <div className="text-sm text-slate-600">
                  {content.step2?.description}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  {content.step3?.title}
                </div>
                <div className="text-sm text-slate-600">
                  {content.step3?.description}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 font-bold flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  {content.step4?.title}
                </div>
                <div className="text-sm text-slate-600">
                  {content.step4?.description}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

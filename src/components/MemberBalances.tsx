import React, { useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Users } from 'lucide-react';
import { Member, Expense } from '../types/trip';
import { calculateBalances } from '../utils/splits';
import { formatINR } from '../utils/money';

interface MemberBalancesProps {
  members: Member[];
  expenses: Expense[];
}

export const MemberBalances: React.FC<MemberBalancesProps> = ({ members, expenses }) => {
  const balances = useMemo(() => calculateBalances(members, expenses), [members, expenses]);

  const netSumPaise = useMemo(
    () => balances.reduce((acc, curr) => acc + curr.netPaise, 0),
    [balances]
  );

  return (
    <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            Group Balances
          </h2>
          <p className="text-sm text-slate-500">
            Net balance for all 5 friends (Goa trip).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Zero-sum check: </span>
          <strong className="font-mono text-slate-800">{formatINR(netSumPaise)}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {balances.map(({ member, netPaise, statusText, paidPaise, owedPaise }) => {
          const isPositive = netPaise > 0;
          const isNegative = netPaise < 0;
          const isSettled = netPaise === 0;

          return (
            <div
              key={member.id}
              className={`rounded-xl p-4 border transition-all ${
                isPositive
                  ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                  : isNegative
                  ? 'bg-amber-50/60 border-amber-200/80 text-amber-950'
                  : 'bg-slate-50/80 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isPositive
                        ? 'bg-emerald-600 text-white'
                        : isNegative
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-400 text-white'
                    }`}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-sm text-slate-900">{member.name}</span>
                </div>

                {isPositive && (
                  <ArrowDownLeft
                    className="w-4 h-4 text-emerald-600"
                    aria-label="Gets back"
                  />
                )}
                {isNegative && (
                  <ArrowUpRight
                    className="w-4 h-4 text-amber-600"
                    aria-label="Owes"
                  />
                )}
                {isSettled && (
                  <CheckCircle2
                    className="w-4 h-4 text-slate-400"
                    aria-label="Settled up"
                  />
                )}
              </div>

              {/* Status text strictly matches requirement: 'gets back ₹X', 'owes ₹X' or 'settled up' */}
              <div
                className={`text-sm font-semibold mb-2 ${
                  isPositive
                    ? 'text-emerald-700'
                    : isNegative
                    ? 'text-amber-800'
                    : 'text-slate-600'
                }`}
              >
                {statusText}
              </div>

              {/* Breakdown details */}
              <div className="text-[11px] text-slate-500 flex flex-col gap-0.5 pt-2 border-t border-slate-200/60 font-mono">
                <div className="flex justify-between">
                  <span>Paid:</span>
                  <span>{formatINR(paidPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Share:</span>
                  <span>{formatINR(owedPaise)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

import React from 'react';
import { Icons } from './Icons';
import { Transaction } from '../types';

interface RecentTransactionsListProps {
  transactions: Transaction[];
  onViewAll?: () => void;
  onTransactionClick?: (transaction: Transaction) => void;
}

const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({
  transactions = [],
  onViewAll,
  onTransactionClick
}) => {
  const formatCurrency = (amount: number) => {
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : (Number(amount) || 0);
    return '₦' + safeAmount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const recent = transactions.slice(0, 4);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Recent Transactions
        </h3>
        <button
          onClick={onViewAll}
          className="text-[#008751] hover:text-[#00663d] font-semibold text-sm flex items-center space-x-1 cursor-pointer transition-colors active:scale-95"
        >
          <span>View All</span>
          <Icons.ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Transactions List */}
      {recent.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#008751] flex items-center justify-center mx-auto mb-2">
            <Icons.Clock size={24} />
          </div>
          <p className="text-sm font-semibold text-slate-800">No Transactions Yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Fund your wallet or buy airtime/data to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] overflow-hidden">
          {recent.map((tx) => {
            const isCredit = tx.type === 'credit';
            return (
              <div
                key={tx.id}
                onClick={() => onTransactionClick?.(tx)}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100"
              >
                {/* Left: Icon + Description + Date */}
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isCredit
                        ? 'bg-emerald-50 text-[#008751]'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isCredit ? (
                      <Icons.ArrowDownLeft size={18} strokeWidth={2.5} />
                    ) : (
                      <Icons.ArrowUpRight size={18} strokeWidth={2.5} />
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 tracking-tight leading-tight">
                      {tx.description}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(tx.date)}
                    </p>
                  </div>
                </div>

                {/* Right: Amount + Status */}
                <div className="text-right">
                  <span
                    className={`text-sm font-bold tracking-tight block ${
                      isCredit ? 'text-[#008751]' : 'text-slate-900'
                    }`}
                  >
                    {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <span className="inline-block px-1.5 py-0.2 text-[9px] font-semibold rounded text-emerald-600 bg-emerald-50 mt-0.5">
                    Successful
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsList;

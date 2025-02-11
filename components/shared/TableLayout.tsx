// Common column widths and styles for all tables
export const columnStyles = {
  name: "p-4 text-left font-medium w-[30%]",      // Name/Type/Referrer
  email: "p-4 text-left font-medium w-[30%]",     // Email/Referred User
  role: "p-4 text-left font-medium w-[15%]",      // Role/Amount/Referrer Coins
  coins: "p-4 text-left font-medium w-[15%]",     // Coins/Status
  actions: "p-4 text-left font-medium w-[10%]"    // Actions/Date
};

export const cellStyles = {
  base: "p-4",
  text: "text-black/60 dark:text-white/60",
  truncate: "truncate",
  flexLeft: "flex items-center gap-2",
  flexCenter: "flex items-center justify-center gap-2",
  badge: {
    admin: "px-3 py-1 rounded-full text-xs font-medium bg-black text-white dark:bg-white dark:text-black",
    user: "px-3 py-1 rounded-full text-xs font-medium bg-black/10 dark:bg-white/10",
    completed: "px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500",
    active: "px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500",
    pending: "px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500"
  }
}; 
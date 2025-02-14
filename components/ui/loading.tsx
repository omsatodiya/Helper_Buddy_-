export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-20 h-20 border-8 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
} 
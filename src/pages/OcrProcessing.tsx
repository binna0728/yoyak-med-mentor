const OcrProcessing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center safe-area-padding px-6">
      <h1 className="text-xl font-bold text-foreground mb-2">AI 분석 중</h1>
      <p className="text-muted-foreground text-sm mb-10">텍스트를 인식하고 있어요</p>

      {/* Spinner */}
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-10" />

      {/* Skeleton UI */}
      <div className="w-full max-w-sm space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="tds-card animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OcrProcessing;

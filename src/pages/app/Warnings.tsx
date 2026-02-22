import { AlertTriangle, Info, AlertCircle, Loader2 } from 'lucide-react';
import { useWarnings } from '@/hooks/useSupabase';

const severityConfig: Record<string, any> = {
  high: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: '높음' },
  medium: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: '보통' },
  low: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', label: '낮음' },
};

const Warnings = () => {
  const { data: warnings = [], isLoading } = useWarnings();

  if (isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">상호작용 & 식사 충돌</h1>
        <p className="text-muted-foreground">약물 간 상호작용과 식사 타이밍 충돌을 확인하세요</p>
      </div>

      {warnings.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Info className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">현재 경고 사항이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {warnings.map((warning: any) => {
            const config = severityConfig[warning.severity] || severityConfig.low;
            const Icon = config.icon;
            return (
              <div key={warning.id} className={`rounded-xl border ${config.border} ${config.bg} p-4`}>
                <div className="mb-2 flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{warning.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{warning.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Warnings;

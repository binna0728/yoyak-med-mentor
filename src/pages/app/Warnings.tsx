import { useState } from 'react';
import { AlertTriangle, Info, AlertCircle, Loader2, Filter, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWarnings, useInteractionMatrix } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';

const severityConfig: Record<string, any> = {
  high: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: '높음' },
  medium: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', label: '보통' },
  low: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', label: '낮음' },
};

const typeLabels: Record<string, string> = {
  'drug-drug': '💊 약물 상호작용',
  'drug-food': '🍽️ 식사 충돌',
  'drug-condition': '🏥 질환 주의',
};

const Warnings = () => {
  const { data: warnings = [], isLoading } = useWarnings();
  const { data: durMatrix = [], isLoading: loadingDur } = useInteractionMatrix();
  const [activeTab, setActiveTab] = useState<'warnings' | 'dur'>('warnings');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  if (isLoading || loadingDur) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const filteredWarnings = severityFilter === 'all'
    ? warnings
    : warnings.filter((w: any) => w.severity === severityFilter);

  const sortedDur = [...durMatrix].sort((a: any, b: any) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.severity as keyof typeof order] ?? 2) - (order[b.severity as keyof typeof order] ?? 2);
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">상호작용 & 안전성</h1>
        <p className="text-muted-foreground">약물 간 상호작용과 식사 타이밍 충돌을 확인하세요</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'warnings' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('warnings')}
        >
          경고 ({warnings.length})
        </Button>
        <Button
          variant={activeTab === 'dur' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('dur')}
        >
          DUR 분석 ({durMatrix.length})
        </Button>
      </div>

      {activeTab === 'warnings' && (
        <>
          {/* Severity filter */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {['all', 'high', 'medium', 'low'].map(level => (
              <button
                key={level}
                onClick={() => setSeverityFilter(level)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  severityFilter === level
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {level === 'all' ? '전체' : severityConfig[level]?.label}
              </button>
            ))}
          </div>

          {filteredWarnings.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Info className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">현재 경고 사항이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWarnings.map((warning: any) => {
                const config = severityConfig[warning.severity] || severityConfig.low;
                const Icon = config.icon;
                return (
                  <div key={warning.id} className={`rounded-xl border ${config.border} ${config.bg} p-4`}>
                    <div className="mb-2 flex items-start gap-3">
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">{warning.title}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          {warning.type && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              {typeLabels[warning.type] || warning.type}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{warning.description}</p>
                        {warning.source_snippet && warning.source_snippet !== warning.description && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">출처 원문 보기</summary>
                            <p className="mt-1 rounded bg-muted p-2 text-xs text-muted-foreground">{warning.source_snippet}</p>
                          </details>
                        )}
                        {warning.medication_ids?.length > 0 && (
                          <div className="mt-2 flex gap-1">
                            {warning.medication_ids.map((mid: string) => (
                              <Link key={mid} to={`/app/medications/${mid}`} className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline">
                                약 상세 <ExternalLink className="h-3 w-3" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'dur' && (
        <>
          {sortedDur.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Info className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">DUR 분석 결과가 없습니다</p>
              <p className="mt-1 text-xs text-muted-foreground">처방전 업로드 시 자동으로 분석됩니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedDur.map((entry: any) => {
                const config = severityConfig[entry.severity] || severityConfig.low;
                const Icon = config.icon;
                return (
                  <div key={entry.id} className={`rounded-xl border ${config.border} ${config.bg} p-4`}>
                    <div className="flex items-start gap-3">
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">{entry.drug_a} ↔ {entry.drug_b}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
                            {config.label}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {typeLabels[entry.contraindication_type] || entry.contraindication_type}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{entry.risk_description}</p>
                        {entry.recommended_action && (
                          <p className="mt-1 text-sm font-medium text-primary">💡 {entry.recommended_action}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Warnings;

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useSeniorMode } from '@/contexts/SeniorModeContext';
import { cn } from '@/lib/utils';
import { healthBlogPosts } from '@/data/healthBlog';
import type { BlogPost } from '@/data/healthBlogTypes';

type CategoryFilter = '전체' | '복용가이드' | '건강상식' | '시니어케어';

const categoryColors: Record<string, string> = {
  '복용가이드': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '건강상식': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  '시니어케어': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

const HealthBlog = () => {
  const { isSeniorMode: sr } = useSeniorMode();
  const [filter, setFilter] = useState<CategoryFilter>('전체');
  const [viewing, setViewing] = useState<BlogPost | null>(null);

  const categories: CategoryFilter[] = ['전체', '복용가이드', '건강상식', '시니어케어'];

  const filtered = filter === '전체'
    ? healthBlogPosts
    : healthBlogPosts.filter(p => p.category === filter);

  if (viewing) {
    return (
      <div>
        <button onClick={() => setViewing(null)}
          className="flex items-center gap-1 text-muted-foreground mb-4 hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" />
          <span className={sr ? 'text-lg' : 'text-sm'}>목록으로</span>
        </button>

        <article className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{viewing.thumbnail}</span>
            <div>
              <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1', categoryColors[viewing.category])}>
                {viewing.category}
              </span>
              <h2 className={cn('font-bold text-foreground', sr ? 'text-xl' : 'text-lg')}>{viewing.title}</h2>
            </div>
          </div>

          <p className={cn('text-muted-foreground', sr ? 'text-base' : 'text-sm')}>{viewing.date}</p>

          <div className={cn('text-foreground leading-relaxed whitespace-pre-line', sr ? 'text-lg' : 'text-base')}>
            {viewing.content}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border',
              filter === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50',
              sr && 'text-base px-4 py-2',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 블로그 카드 리스트 */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">아직 글이 없어요.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <div
              key={post.id}
              onClick={() => setViewing(post)}
              className="cursor-pointer bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex gap-3">
                <span className={cn('flex-shrink-0', sr ? 'text-4xl' : 'text-3xl')}>{post.thumbnail}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', categoryColors[post.category])}>
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <h3 className={cn('font-semibold text-foreground mb-1 truncate', sr ? 'text-lg' : 'text-base')}>
                    {post.title}
                  </h3>
                  <p className={cn('text-muted-foreground line-clamp-2', sr ? 'text-base' : 'text-sm')}>
                    {post.summary}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* n8n 자동 발간 안내 */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        매주 새로운 건강 글이 자동으로 업데이트됩니다
      </p>
    </div>
  );
};

export default HealthBlog;

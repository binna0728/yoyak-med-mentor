export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: '복용가이드' | '건강상식' | '시니어케어';
  thumbnail: string;
  date: string;
  auto?: boolean;
}

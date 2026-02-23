// 美容師国家試験 実施結果データ（公益財団法人 理容師美容師試験研修センター公式）
// 出典: https://www.rbc.or.jp/exam/past_result/

export const EXAM_RESULTS = [
  { exam: '第52回', year: '令和07', season: '秋', applicants: 4788, takers: 4569, passed: 2989, rate: 65.4 },
  { exam: '第51回', year: '令和06', season: '春', applicants: 20025, takers: 19776, passed: 17427, rate: 88.1 },
  { exam: '第50回', year: '令和06', season: '秋', applicants: 4988, takers: 4763, passed: 2622, rate: 55.0 },
  { exam: '第49回', year: '令和05', season: '春', applicants: 19833, takers: 19523, passed: 16888, rate: 86.5 },
  { exam: '第48回', year: '令和05', season: '秋', applicants: 4387, takers: 4149, passed: 2478, rate: 59.7 },
  { exam: '第47回', year: '令和04', season: '春', applicants: 19852, takers: 19505, passed: 17266, rate: 88.5 },
  { exam: '第46回', year: '令和04', season: '秋', applicants: 3828, takers: 3548, passed: 2145, rate: 60.5 },
  { exam: '第45回', year: '令和03', season: '春', applicants: 18836, takers: 18536, passed: 17104, rate: 92.3 },
  { exam: '第44回', year: '令和03', season: '秋', applicants: 5057, takers: 4774, passed: 2871, rate: 60.1 },
  { exam: '第43回', year: '令和02', season: '春', applicants: 18386, takers: 18107, passed: 15502, rate: 85.6 },
  { exam: '第42回', year: '令和02', season: '秋', applicants: 5076, takers: 4853, passed: 2993, rate: 61.7 },
  { exam: '第41回', year: '令和元',  season: '春', applicants: 17591, takers: 17288, passed: 14709, rate: 85.1 },
  { exam: '第40回', year: '令和元',  season: '秋', applicants: 5432, takers: 5134, passed: 2982, rate: 58.1 },
  { exam: '第39回', year: '平成30', season: '春', applicants: 18814, takers: 18521, passed: 15956, rate: 86.2 },
];

// 春期・秋期の傾向コメント
export const SEASON_NOTES = {
  spring: '春期（2〜3月）は2年制専門学校の卒業時期と重なるため受験者数・合格率ともに高い傾向',
  fall:   '秋期（9〜10月）は既卒者が多く、合格率は春期より低くなりやすい',
};

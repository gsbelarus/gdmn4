export type Language = 'en' | 'be' | 'ru';

export const detectLanguage = (s: string): Language => {

  interface I {
    letters: string;
    language: Language;
    score: number;
  };

  const alphabets: I[] = [
    {
      letters: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
      language: 'ru',
      score: 0
    },
    {
      letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      language: 'en',
      score: 0
    },
    {
      letters: 'абвгдеёжзійклмнопрстуўфхцчш\'ыьэюяАБВГДЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШ\'ЫЬЭЮЯ',
      language: 'be',
      score: 0
    },
  ];

  for (let i = 0; i < s.length; i++) {
    const ch = s.charAt(i);
    for (let j = 0; j < alphabets.length; j++) {
      if (alphabets[j].letters.includes(ch)) {
        alphabets[j].score++;
      }
    }
  }

  return alphabets.sort( (a, b) => b.score - a.score )[0].language;
};

export function util(): string {
  return 'util';
};

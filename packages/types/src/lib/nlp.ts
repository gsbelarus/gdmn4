export type Language = 'en' | 'be' | 'ru';

export interface INLPDialogItem {
  id: string;
  who: string;
  language: Language;
  text: string;
  command?: string;
};

export type NLPDialog = INLPDialogItem[];

export function nlpDialogItem(who: string, language: Language, text: string, command?: string): INLPDialogItem {
  return {
    id: crypto.randomUUID(),
    who,
    language,
    text,
    command
  }
};

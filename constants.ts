
import { Dialogue } from './types';

export const DIALOGUE_DB: Dialogue[] = [
  {
    id: '1',
    context: 'Daily Greetings',
    lines: [
      { speaker: 'A', text: "Hi, how have you been lately?", translation: "안녕, 요즘 어떻게 지냈어?" },
      { speaker: 'B', text: "I've been a bit busy, but everything is good. You?", translation: "좀 바빴지만 다 괜찮아. 너는?" },
      { speaker: 'A', text: "Same here. Just trying to stay productive.", translation: "나도 마찬가지야. 그냥 보람차게 보내려고 노력 중이지." },
      { speaker: 'B', text: "That's the spirit! Let's catch up soon.", translation: "좋은 자세네! 조만간 또 보자." }
    ],
    bibleVerse: {
      kr: "너희는 세상의 빛이라 산 위에 있는 동네가 숨겨지지 못할 것이요",
      en: "You are the light of the world. A town built on a hill cannot be hidden.",
      ref: "Matthew 5:14"
    }
  },
  {
    id: '2',
    context: 'Ordering Coffee',
    lines: [
      { speaker: 'A', text: "Can I get a large iced americano, please?", translation: "아이스 아메리카노 라지 사이즈 한 잔 주시겠어요?" },
      { speaker: 'B', text: "Sure. Would you like anything else with that?", translation: "물론이죠. 다른 것도 필요하신가요?" },
      { speaker: 'A', text: "No, that's all. How much is it?", translation: "아뇨, 그게 다예요. 얼마인가요?" },
      { speaker: 'B', text: "It's four dollars and fifty cents.", translation: "4달러 50센트입니다." }
    ],
    bibleVerse: {
      kr: "사람이 떡으로만 살 것이 아니요 하나님의 입으로부터 나오는 모든 말씀으로 살 것이라",
      en: "Man shall not live by bread alone, but by every word that comes from the mouth of God.",
      ref: "Matthew 4:4"
    }
  }
];

export const STORAGE_KEYS = {
  SETTINGS: 'echo_talk_settings',
  PROGRESS: 'echo_talk_progress'
};

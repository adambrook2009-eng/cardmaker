import type { CategoryId, Lang } from '../types';

/** Готовые тексты: пользователь выбирает, а не пишет. */
export const PHRASES: Record<CategoryId, Record<Lang, string[]>> = {
  congrats: {
    ru: [
      'С днём рождения! Пусть каждый день будет праздником!',
      'Поздравляю! Счастья, здоровья и улыбок!',
      'С праздником! Пусть мечты сбываются!',
      'Ура! Ещё один год крутости!',
      'С Новым годом! Пусть он будет волшебным!',
    ],
    he: [
      'יום הולדת שמח! שכל יום יהיה חגיגה!',
      'מזל טוב! הרבה אושר, בריאות וחיוכים!',
      'חג שמח! שכל החלומות יתגשמו!',
      'הידד! עוד שנה של מגניבות!',
      'שנה טובה ומתוקה!',
    ],
    en: [
      'Happy Birthday! May every day feel like a party!',
      'Congratulations! Wishing you joy, health and smiles!',
      'Happy holidays! May all your dreams come true!',
      'Hooray! Another year of awesome!',
      'Happy New Year! Make it a magical one!',
    ],
  },
  wishes: {
    ru: [
      'Хорошего дня и отличного настроения!',
      'Удачи во всех начинаниях!',
      'Пусть сегодня всё получится!',
      'Желаю вдохновения и сил!',
      'Доброе утро! Пусть день будет светлым!',
    ],
    he: [
      'שיהיה לך יום נפלא ומצב רוח מעולה!',
      'בהצלחה בכל הדרכים!',
      'שהיום הכל יצליח!',
      'המון השראה וכוח!',
      'בוקר טוב! שיהיה יום מואר!',
    ],
    en: [
      'Have a wonderful day and a great mood!',
      'Good luck with everything you start!',
      'May everything work out today!',
      'Wishing you inspiration and strength!',
      'Good morning! Have a bright day!',
    ],
  },
  sympathy: {
    ru: [
      'Я рядом. Ты не один.',
      'Я рядом. Ты не одна.',
      'Искренне соболезную. Светлая память.',
      'Всё обязательно наладится.',
      'Обнимаю и думаю о тебе.',
    ],
    he: [
      'אני כאן בשבילך.',
      'משתתפים בצערך. יהי זכרו ברוך.',
      'יהיה בסדר. אני איתך.',
      'מחבקים וחושבים עליך.',
      'שלא תדעו עוד צער.',
    ],
    en: [
      "I'm here for you. You're not alone.",
      'With deepest sympathy. Forever in our hearts.',
      'Everything will be okay.',
      'Sending hugs and thinking of you.',
      'Wishing you comfort and peace.',
    ],
  },
  funny: {
    ru: [
      'Понедельник: загрузка… 3%',
      'Я не ленюсь, я в режиме энергосбережения',
      'Сначала кофе — разговоры потом ☕',
      'Возраст — это просто число. Очень большое число 😄',
      'Работаю над собой. Пока без результата 🙃',
    ],
    he: [
      'יום ראשון: טוען… 3%',
      'אני לא עצלן, אני במצב חיסכון באנרגיה',
      'קודם קפה — אחר כך שיחות ☕',
      'גיל זה רק מספר. מספר ממש גדול 😄',
      'עובד על עצמי. בינתיים בלי תוצאות 🙃',
    ],
    en: [
      'Monday: loading… 3%',
      "I'm not lazy, I'm in energy-saving mode",
      'Coffee first — talk later ☕',
      'Age is just a number. A really big number 😄',
      'Working on myself. No results yet 🙃',
    ],
  },
  kind: {
    ru: [
      'Ты делаешь этот мир лучше ☀️',
      'Просто напоминаю: ты чудо!',
      'Котик желает тебе мурчательного дня 🐾',
      'Улыбнись — тебе идёт!',
      'Пусть рядом будет только тепло',
    ],
    he: [
      'העולם טוב יותר בזכותך ☀️',
      'רק תזכורת קטנה: את/ה מדהים/ה!',
      'החתול מאחל לך יום מגרגר 🐾',
      'חיוך ממש מתאים לך!',
      'שיהיה לך רק חום ואהבה',
    ],
    en: [
      'You make the world a better place ☀️',
      'Just a reminder: you are amazing!',
      'Kitty wishes you a purr-fect day 🐾',
      'Smile — it suits you!',
      'Wishing you nothing but warmth',
    ],
  },
  love: {
    ru: [
      'Я тебя люблю ❤️',
      'Спасибо, что ты есть!',
      'Ты — моё счастье',
      'Огромное спасибо за всё!',
      'С тобой каждый день особенный',
    ],
    he: [
      'אני אוהב אותך ❤️',
      'אני אוהבת אותך ❤️',
      'תודה שאת/ה בחיים שלי!',
      'תודה רבה על הכל!',
      'איתך כל יום הוא מיוחד',
    ],
    en: [
      'I love you ❤️',
      'Thank you for being you!',
      'You are my happiness',
      'Thank you so much for everything!',
      'Every day with you is special',
    ],
  },
};

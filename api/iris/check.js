const twilio = require('twilio');

async function getWhoopMetrics() {
  const base = 'https://api.prod.whoop.com/developer/v2';
  let token = process.env.WHOOP_ACCESS_TOKEN;

  const whoopGet = async (endpoint) => {
    let res = await fetch(base + endpoint, {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (res.status === 401) {
      const r = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: process.env.WHOOP_REFRESH_TOKEN,
          client_id: process.env.WHOOP_CLIENT_ID,
          client_secret: process.env.WHOOP_CLIENT_SECRET,
        })
      });
      const text = await r.text();
      let t;
      try { t = JSON.parse(text); } catch(e) { throw new Error('Token refresh failed: ' + text); }
      token = t.access_token;
      res = await fetch(base + endpoint, {
        headers: { Authorization: 'Bearer ' + token }
      });
    }
    const text = await res.text();
    try { return JSON.parse(text); } catch(e) { throw new Error('WHOOP API error on ' + endpoint + ': ' + text); }
  };

const rec = await whoopGet('/recovery?limit=1');
const cycle = await whoopGet('/cycle?limit=1');
const sleep = await whoopGet('/activity/sleep?limit=1');

  const recovery = rec.records && rec.records[0];
  const sl = sleep.records && sleep.records[0];
  const cy = cycle.records && cycle.records[0];

  return {
    recoveryScore: Math.round((recovery && recovery.score && recovery.score.recovery_score) || 0),
    hrv: Math.round((recovery && recovery.score && recovery.score.hrv_rmssd_milli) || 0),
    rhr: Math.round((recovery && recovery.score && recovery.score.resting_heart_rate) || 0),
    sleepPerf: Math.round((sl && sl.score && sl.score.sleep_performance_percentage) || 0),
    sleepHours: (sl && sl.score && sl.score.stage_summary && sl.score.stage_summary.total_in_bed_time_milli)
      ? (sl.score.stage_summary.total_in_bed_time_milli / 3600000).toFixed(1) : '?',
    strain: (cy && cy.score && cy.score.strain) ? cy.score.strain.toFixed(1) : '0.0',
  };
}

function buildMessage(m, userName) {
  var rec = m.recoveryScore;
  var hrv = m.hrv;
  var strain = parseFloat(m.strain);
  var mode = rec >= 67 ? 'performance' : rec >= 34 ? 'recovery' : 'repos';

  var foodIntro = {
    performance: 'Privilégie les glucides complexes et les protéines aujourd\'hui. Ton score de ' + rec + '% indique que ton corps est prêt à absorber un effort intense — fuel en conséquence.',
    recovery: 'Privilégie les aliments anti-inflammatoires aujourd\'hui. Ton HRV à ' + hrv + 'ms signale un stress nerveux actif — la nutrition est ton levier principal ce matin.',
    repos: 'Privilégie les aliments faciles à digérer aujourd\'hui. Ton corps est en zone rouge à ' + rec + '% — toute énergie dépensée en digestion est volée à ta récupération.'
  }[mode];

  var meals = {
    performance: {
      modeLabel: '⚡ Performance',
      modeContext: 'Ton corps est prêt. Fuel maximum aujourd\'hui.',
      breakfast: { name: 'Power Oat Bowl', detail: 'Avoine · Whey protein · Banane · Miel', macros: '38g P · 82g G · 558 kcal', why: '💡 L\'avoine fournit des glucides complexes stables sur 3-4h. La whey déclenche la synthèse protéique dès le matin.' },
      lunch: { name: 'Bowl Poulet & Riz complet', detail: 'Blanc de poulet · Riz brun · Brocolis · Huile d\'olive', macros: '45g P · 68g G · 580 kcal', why: '💡 Le riz brun recharge le glycogène sans pic insulinique. Le brocolis apporte du sulforaphane, anti-inflammatoire naturel.' },
      snack: { name: 'Shake pré-séance', detail: 'Banane · Whey · Dattes · Lait entier', macros: '28g P · 48g G · 340 kcal', why: '💡 À prendre 30 min avant l\'effort. Le glucose rapide crée un pic d\'énergie disponible dès l\'échauffement.' },
      dinner: { name: 'Steak & Patate douce', detail: 'Steak grass-fed · Patate douce · Asperges · Beurre', macros: '42g P · 52g G · 538 kcal', why: '💡 La patate douce recharge le glycogène de façon optimale 4-6h après l\'effort.' },
      hydration: '3.2 L'
    },
    recovery: {
      modeLabel: '🔄 Recovery',
      modeContext: 'Système nerveux en récupération. Anti-inflammatoire prioritaire.',
      breakfast: { name: 'Smoothie Bowl Anti-Inflammatoire', detail: 'Myrtilles · Curcuma · Yaourt grec · Poivre noir', macros: '22g P · 52g G · 390 kcal', why: '💡 Les anthocyanines des myrtilles + curcumine ciblent les cytokines inflammatoires. Le poivre noir multiplie l\'absorption de curcumine par 20.' },
      lunch: { name: 'Bowl Saumon & Quinoa', detail: 'Saumon sauvage · Quinoa · Concombre · Citron', macros: '42g P · 45g G · 510 kcal', why: '💡 L\'EPA et DHA du saumon réduisent directement les cytokines pro-inflammatoires liées à ta baisse de HRV. Effet visible sous 24-48h.' },
      snack: { name: 'Amandes & Cerises acidulées', detail: 'Amandes · Cerises séchées · Chocolat noir 85%', macros: '8g P · 28g G · 280 kcal', why: '💡 76mg de magnésium par 30g d\'amandes active les récepteurs GABA. Les cerises contiennent des précurseurs de mélatonine.' },
      dinner: { name: 'Bouillon Poulet Curcuma', detail: 'Blanc de poulet · Bouillon d\'os · Gingembre · Curcuma', macros: '35g P · 22g G · 340 kcal', why: '💡 Repas léger — moins tu digères, plus ton corps récupère. Gingembre + curcuma agissent toute la nuit.' },
      hydration: '2.6 L'
    },
    repos: {
      modeLabel: '🧘 Repos total',
      modeContext: 'Ton corps est en zone rouge. Zéro effort, récupération maximum.',
      breakfast: { name: 'Toast Banane & Beurre d\'amande', detail: 'Pain complet · Banane · Beurre d\'amande · Miel', macros: '10g P · 58g G · 380 kcal', why: '💡 Simple et facile à digérer. La banane apporte du potassium pour rééquilibrer les électrolytes.' },
      lunch: { name: 'Sardines & Avocat', detail: 'Sardines · Avocat · Salade verte · Citron', macros: '28g P · 18g G · 480 kcal', why: '💡 Sardines + avocat = duo le plus concentré en EPA/DHA + acide oléique. Agit directement sur l\'inflammation vasculaire.' },
      snack: { name: 'Jus de cerises & Amandes', detail: '30ml concentré · Amandes · À 15h impérativement', macros: '6g P · 32g G · 240 kcal', why: '💡 Pris à 15h, démarre la préparation au sommeil 6h à l\'avance. Investissement direct pour demain matin.' },
      dinner: { name: 'Riz blanc, Saumon & Légumes', detail: 'Riz blanc · Saumon vapeur · Légumes · Dîner avant 19h30', macros: '38g P · 45g G · 460 kcal', why: '💡 Riz blanc ce soir — se digère en 1h contre 3h pour le riz brun. Dîner avant 19h30, rien après 20h.' },
      hydration: '3.0 L'
    }
  }[mode];

  var sport;
  if (rec >= 67) {
    sport = { duree: '1h', type: 'HIIT ou Musculation lourde', intensite: '75-85% FC max', pas: '12 000 pas', why: '💡 Score de ' + rec + '% + HRV de ' + hrv + 'ms = signal vert pour un effort intense. Ne gâche pas cette fenêtre.' };
  } else if (rec >= 50) {
    sport = { duree: '45 min', type: strain > 12 ? 'Yoga ou Mobilité' : 'Musculation légère ou Cardio Zone 2', intensite: '60-70% FC max', pas: '10 000 pas', why: '💡 Le HIIT aujourd\'hui augmenterait le cortisol et aggraverait ton HRV demain. La Zone 2 maintient l\'adaptation sans surcharger le système nerveux.' };
  } else if (rec >= 34) {
    sport = { duree: '30 min max', type: 'Marche ou Yoga doux', intensite: '50-60% FC max', pas: '7 000 pas', why: '💡 La marche active la circulation lymphatique sans stress supplémentaire. 30 minutes suffisent — plus serait contre-productif.' };
  } else {
    sport = { duree: 'Aucun entraînement', type: 'Repos actif — marche douce', intensite: '—', pas: '5 000 pas', why: '💡 Stop. À ' + rec + '%, tout entraînement retarderait ta récupération de 24-48h.' };
  }

  var sieste = (rec < 50 || parseFloat(m.sleepHours) < 6.5)
    ? 'Oui — 20 min entre 13h et 15h\n💡 20 min réduit le cortisol de 30%. Au-delà de 25 min tu rentres en sommeil profond — effet inverse.'
    : 'Non nécessaire aujourd\'hui';

  var bed = rec < 34 ? '21h30' : rec < 50 ? '22h00' : rec < 67 ? '22h30' : '23h00';
  var caff = rec < 34 ? '13h00' : rec < 50 ? '13h30' : '14h00';
  var recEmoji = rec >= 67 ? '🟢' : rec >= 34 ? '🟡' : '🔴';
  var sleepEmoji = m.sleepPerf >= 80 ? '🟢' : m.sleepPerf >= 60 ? '🟡' : '🔴';
  var hrvEmoji = hrv >= 70 ? '🟢' : hrv >= 50 ? '🟡' : '🔴';
  var alcool = rec < 50 ? '🚫 Éviter — aggrave le HRV de 8-12 points' : '⚠️ Avec modération si possible';

  return '*Iris ✦*\n\nBonjour ' + userName + ' ! Ton recap Vitae est prêt 👋\n\n━━━━━━━━━━━━━━━\n🌙 *TA NUIT*\n━━━━━━━━━━━━━━━\nRécupération : ' + rec + '% ' + recEmoji + '\nSommeil : ' + m.sleepPerf + '% (' + m.sleepHours + 'h) ' + sleepEmoji + '\nHRV : ' + hrv + 'ms ' + hrvEmoji + '\nFC repos : ' + m.rhr + ' bpm\nStrain hier : ' + m.strain + '\n\n━━━━━━━━━━━━━━━\n📊 *ÉTAT DU JOUR*\n━━━━━━━━━━━━━━━\nMode : ' + meals.modeLabel + '\n' + meals.modeContext + '\n\n━━━━━━━━━━━━━━━\n🍽️ *ALIMENTATION*\n━━━━━━━━━━━━━━━\n' + foodIntro + '\n\n🌅 *Petit-déjeuner*\n' + meals.breakfast.name + '\n' + meals.breakfast.detail + '\n→ ' + meals.breakfast.macros + '\n' + meals.breakfast.why + '\n\n☀️ *Déjeuner*\n' + meals.lunch.name + '\n' + meals.lunch.detail + '\n→ ' + meals.lunch.macros + '\n' + meals.lunch.why + '\n\n⚡ *Snack (16h)*\n' + meals.snack.name + '\n' + meals.snack.detail + '\n→ ' + meals.snack.macros + '\n' + meals.snack.why + '\n\n🌙 *Dîner*\n' + meals.dinner.name + '\n' + meals.dinner.detail + '\n→ ' + meals.dinner.macros + '\n' + meals.dinner.why + '\n\n💧 Hydratation : ' + meals.hydration + '\n\n━━━━━━━━━━━━━━━\n💪 *SPORT*\n━━━━━━━━━━━━━━━\n⏱ Durée : ' + sport.duree + '\n🏋️ Type : ' + sport.type + '\n❤️ Intensité : ' + sport.intensite + '\n🚶 Pas cible : ' + sport.pas + '\n' + sport.why + '\n\n━━━━━━━━━━━━━━━\n😴 *RÉCUPÉRATION*\n━━━━━━━━━━━━━━━\nSieste : ' + sieste + '\n☕ Caféine : Stop à ' + caff + '\n🌙 Coucher : ' + bed + '\n🍷 Alcool : ' + alcool + '\n\n━━━━━━━━━━━━━━━\n_Iris · Powered by Vitae & WHOOP_';
}

module.exports = async (req, res) => {
  var userName = process.env.USER_NAME || 'Arthur';
  try {
    var metrics = await getWhoopMetrics();
    var message = buildMessage(metrics, userName);
    var client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    var result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.YOUR_WHATSAPP_NUMBER,
      body: message,
    });
    console.log('[Iris] Sent — SID: ' + result.sid);
    return res.status(200).json({ success: true, recovery: metrics.recoveryScore, sid: result.sid });
  } catch (err) {
    console.error('[Iris] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

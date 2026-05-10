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
      try { t = JSON.parse(text); } catch(e) { throw new Error('Refresh failed: ' + text); }
      token = t.access_token;
      res = await fetch(base + endpoint, {
        headers: { Authorization: 'Bearer ' + token }
      });
    }
    const text = await res.text();
    try { return JSON.parse(text); } catch(e) { throw new Error('WHOOP error ' + endpoint + ': ' + text); }
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
  var recE = rec >= 67 ? '🟢' : rec >= 34 ? '🟡' : '🔴';
  var slE  = m.sleepPerf >= 80 ? '🟢' : m.sleepPerf >= 60 ? '🟡' : '🔴';
  var hE   = hrv >= 70 ? '🟢' : hrv >= 50 ? '🟡' : '🔴';
  var bed  = rec < 34 ? '21h30' : rec < 50 ? '22h00' : rec < 67 ? '22h30' : '23h00';
  var caff = rec < 34 ? '13h00' : rec < 50 ? '13h30' : '14h00';

  var modeLabel = mode === 'performance' ? '⚡ Performance' : mode === 'recovery' ? '🔄 Recovery' : '🧘 Repos';

  var breakfast, lunch, snack, dinner, hydration, sportType, sportDuree, sportPas, sportWhy, foodWhy;

  if (mode === 'performance') {
    breakfast = 'Power Oat Bowl — Avoine · Whey · Banane\n→ 38g P · 82g G · 558 kcal\n💡 Glucides complexes stables 3-4h. Whey déclenche la synthèse musculaire.';
    lunch     = 'Bowl Poulet & Riz — Poulet · Riz brun · Brocolis\n→ 45g P · 68g G · 580 kcal\n💡 Riz brun recharge glycogène sans pic insulinique.';
    snack     = 'Shake pré-séance — Banane · Whey · Dattes\n→ 28g P · 48g G · 340 kcal';
    dinner    = 'Steak & Patate douce — Steak · Patate douce · Asperges\n→ 42g P · 52g G · 538 kcal\n💡 Recharge glycogène optimale 4-6h post-effort.';
    hydration = '3.2 L';
    foodWhy   = 'Privilégie glucides complexes et proteines. Score ' + rec + '% = corps pret pour effort intense.';
    sportType = 'HIIT ou Musculation lourde'; sportDuree = '1h'; sportPas = '12 000 pas';
    sportWhy  = '💡 Score ' + rec + '% + HRV ' + hrv + 'ms = signal vert. Ne rate pas cette fenetre.';
  } else if (mode === 'recovery') {
    breakfast = 'Smoothie Bowl — Myrtilles · Curcuma · Yaourt · Poivre noir\n→ 22g P · 52g G · 390 kcal\n💡 Anthocyanines + curcumine ciblent inflammation. Poivre noir x20 absorption.';
    lunch     = 'Saumon & Quinoa — Saumon sauvage · Quinoa · Citron\n→ 42g P · 45g G · 510 kcal\n💡 EPA/DHA reduit cytokines liees a ton HRV bas. Effet visible 24-48h.';
    snack     = 'Amandes & Cerises — Amandes · Cerises · Chocolat 85%\n→ 8g P · 28g G · 280 kcal\n💡 Magnesium active GABA. Cerises = precurseurs melatonine.';
    dinner    = 'Bouillon Poulet Curcuma — Poulet · Bouillon os · Gingembre\n→ 35g P · 22g G · 340 kcal\n💡 Leger = plus d energie pour reparer. Anti-inflammatoire toute la nuit.';
    hydration = '2.6 L';
    foodWhy   = 'Privilegie aliments anti-inflammatoires. HRV ' + hrv + 'ms = stress nerveux actif.';
    sportType = strain > 12 ? 'Yoga ou Mobilite' : 'Muscu legere ou Zone 2'; sportDuree = '45 min'; sportPas = '10 000 pas';
    sportWhy  = '💡 HIIT augmenterait cortisol et aggraverait HRV demain. Zone 2 maintient adaptation sans surcharger.';
  } else {
    breakfast = 'Toast Banane & Beurre amande — Pain · Banane · Miel\n→ 10g P · 58g G · 380 kcal\n💡 Simple a digerer. Potassium reequilibre electrolytes.';
    lunch     = 'Sardines & Avocat — Sardines · Avocat · Salade\n→ 28g P · 18g G · 480 kcal\n💡 Duo le plus concentre EPA/DHA + acide oleique. Agit sur inflammation vasculaire.';
    snack     = 'Jus cerises & Amandes — 30ml concentre · Amandes · A 15h\n→ 6g P · 32g G · 240 kcal\n💡 Demarre preparation sommeil 6h a l avance.';
    dinner    = 'Riz blanc & Saumon vapeur — Riz blanc · Saumon · Legumes\n→ 38g P · 45g G · 460 kcal\n💡 Riz blanc digere en 1h. Diner avant 19h30, rien apres 20h.';
    hydration = '3.0 L';
    foodWhy   = 'Privilegie aliments faciles a digerer. Zone rouge ' + rec + '% — energie digestive = energie de recuperation.';
    sportType = 'Marche douce uniquement'; sportDuree = 'Repos'; sportPas = '5 000 pas';
    sportWhy  = '💡 Stop. ' + rec + '% = tout effort retarde recuperation de 24-48h.';
  }

  var sieste = (rec < 50 || parseFloat(m.sleepHours) < 6.5) ? 'Oui — 20 min (13h-15h)' : 'Non necessaire';
  var alcool = rec < 50 ? '🚫 Eviter — aggrave HRV 8-12pts' : '⚠️ Moderation';

  return '*Iris ✦*\n\nBonjour ' + userName + ' ! Ton recap est pret 👋\n\n━━━━━━━━━━━━━━━\n🌙 *NUIT*\n━━━━━━━━━━━━━━━\nRecup : ' + rec + '% ' + recE + '\nSommeil : ' + m.sleepPerf + '% (' + m.sleepHours + 'h) ' + slE + '\nHRV : ' + hrv + 'ms ' + hE + ' · FC repos : ' + m.rhr + 'bpm\n\n━━━━━━━━━━━━━━━\n📊 *MODE : ' + modeLabel + '*\n━━━━━━━━━━━━━━━\n' + foodWhy + '\n\n━━━━━━━━━━━━━━━\n🍽️ *REPAS*\n━━━━━━━━━━━━━━━\n🌅 ' + breakfast + '\n\n☀️ ' + lunch + '\n\n⚡ ' + snack + '\n\n🌙 ' + dinner + '\n\n💧 ' + hydration + '\n\n━━━━━━━━━━━━━━━\n💪 *SPORT*\n━━━━━━━━━━━━━━━\n' + sportDuree + ' · ' + sportType + '\n🚶 ' + sportPas + '\n' + sportWhy + '\n\n━━━━━━━━━━━━━━━\n😴 *RECUP*\n━━━━━━━━━━━━━━━\nSieste : ' + sieste + '\nCafeine : stop ' + caff + '\nCoucher : ' + bed + '\nAlcool : ' + alcool + '\n\n_Iris · Vitae & WHOOP_';
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

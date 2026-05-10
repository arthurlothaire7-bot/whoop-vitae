const twilio = require('twilio');

async function getWhoopMetrics() {
  const base = 'https://api.prod.whoop.com/developer/v2';
  let token = process.env.WHOOP_ACCESS_TOKEN;

  const whoopGet = async (endpoint) => {
    let res = await fetch(base + endpoint, { headers: { Authorization: 'Bearer ' + token } });
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
      const txt = await r.text();
      let t; try { t = JSON.parse(txt); } catch(e) { throw new Error('Refresh failed: ' + txt); }
      token = t.access_token;
      res = await fetch(base + endpoint, { headers: { Authorization: 'Bearer ' + token } });
    }
    const txt = await res.text();
    try { return JSON.parse(txt); } catch(e) { throw new Error('WHOOP error ' + endpoint + ': ' + txt); }
  };

  const rec   = await whoopGet('/recovery?limit=1');
  const cycle = await whoopGet('/cycle?limit=1');
  const sleep = await whoopGet('/activity/sleep?limit=1');
  const rv = rec.records && rec.records[0];
  const sl = sleep.records && sleep.records[0];
  const cy = cycle.records && cycle.records[0];

  return {
    recoveryScore: Math.round((rv && rv.score && rv.score.recovery_score) || 0),
    hrv:           Math.round((rv && rv.score && rv.score.hrv_rmssd_milli) || 0),
    rhr:           Math.round((rv && rv.score && rv.score.resting_heart_rate) || 0),
    sleepPerf:     Math.round((sl && sl.score && sl.score.sleep_performance_percentage) || 0),
    sleepHours:    (sl && sl.score && sl.score.stage_summary && sl.score.stage_summary.total_in_bed_time_milli)
                   ? (sl.score.stage_summary.total_in_bed_time_milli / 3600000).toFixed(1) : '?',
    strain:        (cy && cy.score && cy.score.strain) ? cy.score.strain.toFixed(1) : '0.0',
  };
}

function buildMessage(m, userName) {
  var rec  = m.recoveryScore;
  var hrv  = m.hrv;
  var str  = parseFloat(m.strain);
  var mode = rec >= 67 ? 'perf' : rec >= 34 ? 'rec' : 'repos';
  var rE   = rec >= 67 ? '🟢' : rec >= 34 ? '🟡' : '🔴';
  var sE   = m.sleepPerf >= 80 ? '🟢' : m.sleepPerf >= 60 ? '🟡' : '🔴';
  var hE   = hrv >= 70 ? '🟢' : hrv >= 50 ? '🟡' : '🔴';
  var bed  = rec < 34 ? '21h30' : rec < 50 ? '22h00' : rec < 67 ? '22h30' : '23h00';
  var caff = rec < 34 ? '13h00' : rec < 50 ? '13h30' : '14h00';
  var alc  = rec < 50 ? '🚫 Eviter' : '⚠️ Moderation';
  var nap  = (rec < 50 || parseFloat(m.sleepHours) < 6.5) ? 'Oui 20min (13h-15h)' : 'Non';

  var mL, fW, bf, lu, sn, di, hy, spT, spD, spP, spW;

  if (mode === 'perf') {
    mL  = '⚡ Performance';
    fW  = 'Score ' + rec + '% : corps pret pour effort intense. Priorite glucides + proteines.';
    bf  = '*Breakfast* — Power Oat Bowl\nAvoine · Whey · Banane · Miel\n→ 38g P · 82g G · 558 kcal\n💡 Glucides stables 3-4h. Whey active synthese musculaire.';
    lu  = '*Lunch* — Bowl Poulet & Riz\nPoulet · Riz brun · Brocolis\n→ 45g P · 68g G · 580 kcal\n💡 Riz brun recharge glycogene sans pic insulinique.';
    sn  = '*En-cas* — Shake pre-seance\nBanane · Whey · Dattes\n→ 28g P · 48g G · 340 kcal\n💡 30 min avant effort. Energie immediate.';
    di  = '*Diner* — Steak & Patate douce\nSteak · Patate douce · Asperges\n→ 42g P · 52g G · 538 kcal\n💡 Recharge glycogene optimale 4-6h post-effort.';
    hy  = '3.2 L';
    spT = 'HIIT ou Muscu lourde'; spD = '1h'; spP = '12 000 pas';
    spW = '💡 HRV ' + hrv + 'ms + score ' + rec + '% = signal vert. Ne rate pas cette fenetre.';
  } else if (mode === 'rec') {
    mL  = '🔄 Recovery';
    fW  = 'HRV ' + hrv + 'ms : inflammation active. Priorite anti-inflammatoire.';
    bf  = '*Breakfast* — Smoothie Myrtilles\nMyrtilles · Curcuma · Yaourt · Poivre noir\n→ 22g P · 52g G · 390 kcal\n💡 Curcumine cible inflammation. Poivre noir x20 absorption.';
    lu  = '*Lunch* — Bowl Saumon & Quinoa\nSaumon · Quinoa · Concombre · Citron\n→ 42g P · 45g G · 510 kcal\n💡 EPA/DHA reduit cytokines pro-inflammatoires. Effet 24-48h.';
    sn  = '*En-cas* — Amandes & Cerises\nAmandes · Cerises · Chocolat 85%\n→ 8g P · 28g G · 280 kcal\n💡 Magnesium active GABA. Cerises = melatonine.';
    di  = '*Diner* — Bouillon Poulet Curcuma\nPoulet · Bouillon os · Gingembre\n→ 35g P · 22g G · 340 kcal\n💡 Leger = plus energie pour reparer. Anti-inflam toute la nuit.';
    hy  = '2.6 L';
    spT = str > 12 ? 'Yoga ou Mobilite' : 'Muscu legere ou Zone 2'; spD = '45 min'; spP = '10 000 pas';
    spW = '💡 HIIT aujourd hui = cortisol + HRV pire demain. Zone 2 maintient adaptation.';
  } else {
    mL  = '🧘 Repos total';
    fW  = 'Zone rouge ' + rec + '% : energie digestive = energie de recuperation.';
    bf  = '*Breakfast* — Toast Banane\nPain · Banane · Beurre amande\n→ 10g P · 58g G · 380 kcal\n💡 Facile a digerer. Potassium reequilibre electrolytes.';
    lu  = '*Lunch* — Sardines & Avocat\nSardines · Avocat · Salade\n→ 28g P · 18g G · 480 kcal\n💡 Duo EPA/DHA + oleique = anti-inflammatoire vasculaire.';
    sn  = '*En-cas* — Jus cerises & Amandes\n30ml concentre · Amandes · A 15h\n→ 6g P · 32g G · 240 kcal\n💡 Prepare sommeil 6h a l avance.';
    di  = '*Diner* — Riz blanc & Saumon\nRiz blanc · Saumon vapeur · Legumes\n→ 38g P · 45g G · 460 kcal\n💡 Riz blanc digere en 1h. Diner avant 19h30.';
    hy  = '3.0 L';
    spT = 'Marche douce'; spD = 'Repos'; spP = '5 000 pas';
    spW = '💡 ' + rec + '% = tout effort retarde recuperation 24-48h. Repos complet.';
  }

  var msg = '*Iris ✦*\n\nBonjour ' + userName + ' ! 👋\n\n';
  msg += '━━━━━━━━━━━━━━━\n🌙 *NUIT*\n━━━━━━━━━━━━━━━\n';
  msg += 'Recup : ' + rec + '% ' + rE + '\n';
  msg += 'Sommeil : ' + m.sleepPerf + '% (' + m.sleepHours + 'h) ' + sE + '\n';
  msg += 'HRV : ' + hrv + 'ms ' + hE + ' · FC : ' + m.rhr + 'bpm\n\n';
  msg += '━━━━━━━━━━━━━━━\n📊 *' + mL + '*\n━━━━━━━━━━━━━━━\n' + fW + '\n\n';
  msg += '━━━━━━━━━━━━━━━\n🍽️ *REPAS*\n━━━━━━━━━━━━━━━\n';
  msg += bf + '\n\n' + lu + '\n\n' + sn + '\n\n' + di + '\n\n💧 ' + hy + '\n\n';
  msg += '━━━━━━━━━━━━━━━\n💪 *SPORT*\n━━━━━━━━━━━━━━━\n';
  msg += spD + ' · ' + spT + '\n🚶 ' + spP + '\n' + spW + '\n\n';
  msg += '━━━━━━━━━━━━━━━\n😴 *RECUP*\n━━━━━━━━━━━━━━━\n';
  msg += 'Sieste : ' + nap + '\nCafeine stop : ' + caff + '\nCoucher : ' + bed + '\nAlcool : ' + alc + '\n\n';
  msg += '_Iris · Vitae & WHOOP_';
  return msg;
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

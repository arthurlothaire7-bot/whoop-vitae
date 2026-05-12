const twilio = require('twilio');
const { getDayMeals } = require('./meals');

// ── WHOOP ─────────────────────────────────────────────────
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

// ── GUIDELINE ─────────────────────────────────────────────
function getGuideline(m) {
  const rec = m.recoveryScore;
  const sl  = parseFloat(m.sleepHours) || 0;
  const str = parseFloat(m.strain);

  if (rec >= 67 && m.sleepPerf >= 75)
    return 'Aujourd\'hui, basé sur ta data, je te recommande de *pousser fort* — système nerveux pleinement récupéré, c\'est le bon jour pour performer.';
  if (rec >= 50 && str > 12)
    return 'Aujourd\'hui, basé sur ta data, je te recommande de *laisser ton corps souffler* — charge d\'hier élevée, priorise la mobilité et les anti-inflammatoires.';
  if (rec >= 50)
    return 'Aujourd\'hui, basé sur ta data, je te recommande de *t\'entraîner modérément* — récupération en cours, évite le HIIT.';
  if (rec >= 34)
    return 'Aujourd\'hui, basé sur ta data, je te recommande de *réduire l\'effort* — marche et anti-inflammatoires uniquement.';
  if (sl < 5.5)
    return 'Aujourd\'hui, basé sur ta data, je te recommande de *tout miser sur le sommeil de ce soir* — nuit trop courte + zone rouge.';
  return 'Aujourd\'hui, basé sur ta data, je te recommande le *repos complet* — zone rouge, tout entraînement retarde la récupération de 24-48h.';
}

// ── SPORT ─────────────────────────────────────────────────
function getSport(m) {
  const rec = m.recoveryScore;
  const str = parseFloat(m.strain);

  if (rec >= 67) return {
    duree: '1h', type: 'HIIT ou Musculation lourde', intensite: '75-85% FC max', pas: '12 000 pas',
    why: 'HRV ' + m.hrv + 'ms + score ' + rec + '% = signal vert. Le HIIT génère un stress positif qui améliore ton HRV long terme. Ne rate pas cette fenêtre.'
  };
  if (rec >= 50) return {
    duree: '45 min', type: str > 12 ? 'Yoga ou Mobilité' : 'Muscu légère ou Zone 2', intensite: '60-70% FC max', pas: '10 000 pas',
    why: 'Le HIIT augmenterait le cortisol et aggraverait ton HRV demain. La Zone 2 maintient l\'adaptation sans surcharger le système nerveux.'
  };
  if (rec >= 34) return {
    duree: '30 min max', type: 'Marche ou Yoga doux', intensite: '50-60% FC max', pas: '7 000 pas',
    why: 'La marche active la circulation lymphatique sans stress. Tout effort structuré retarderait ta remontée.'
  };
  return {
    duree: 'Repos complet', type: 'Marche douce si besoin', intensite: '—', pas: '5 000 pas',
    why: 'Stop. À ' + rec + '%, tout entraînement retarde la récupération de 24-48h.'
  };
}

// ── RECO SCIENTIFIQUE ─────────────────────────────────────
function getScientificReco(m, meals) {
  const rec = m.recoveryScore;

  const foodReco = rec >= 67
    ? 'Fibres solubles (avoine) stabilisent ta glycémie sur 3-4h. EPA/DHA (saumon) maintient ton HRV élevé. Les fruits frais améliorent le HRV dans les 24h suivant la consommation.'
    : rec >= 34
    ? 'Anthocyanines (myrtilles) + curcumine ciblent les cytokines inflammatoires liées à ton HRV bas. Les oméga-3 (saumon, sardines) améliorent le RMSSD en 24-48h. Le magnésium (amandes) active le GABA — frein naturel du système sympathique.'
    : 'Repas légers = moins d\'énergie en digestion = plus pour récupérer. Sardines + avocat = duo EPA/DHA + acide oléique le plus concentré. Cerises acidulées à 15h = mélatonine naturelle pour préparer le sommeil de ce soir.';

  const sportReco = rec >= 67
    ? 'Système nerveux pleinement récupéré. Le HIIT crée un stress positif qui améliore le HRV long terme.'
    : rec >= 34
    ? 'HRV bas = système sympathique actif. Le HIIT aggraverait demain. La Zone 2 maintient l\'adaptation sans surcharger le système autonome.'
    : 'Zone rouge. Chaque effort détourne l\'énergie de la réparation. Le repos est le seul chemin vers la remontée.';

  const sleepReco = 'Les fibres solubles ce soir favorisent le sommeil profond. Stop caféine à ' +
    (rec < 34 ? '13h00' : rec < 50 ? '13h30' : '14h00') + ' pour ne pas fragmenter le REM. Coucher à ' +
    (rec < 34 ? '21h30' : rec < 50 ? '22h00' : rec < 67 ? '22h30' : '23h00') + '.';

  return { foodReco, sportReco, sleepReco };
}

// ── BUILD MESSAGES ─────────────────────────────────────────
function buildMessages(m, userName) {
  const rec  = m.recoveryScore;
  const rE   = rec >= 67 ? '🟢' : rec >= 34 ? '🟡' : '🔴';
  const sE   = m.sleepPerf >= 80 ? '🟢' : m.sleepPerf >= 60 ? '🟡' : '🔴';
  const hE   = m.hrv >= 70 ? '🟢' : m.hrv >= 50 ? '🟡' : '🔴';

  const guideline = getGuideline(m);
  const meals     = getDayMeals(rec);
  const sport     = getSport(m);
  const reco      = getScientificReco(m, meals);

  const modeLabel = meals.mode === 'performance' ? '⚡ Performance'
                  : meals.mode === 'recovery'    ? '🔄 Recovery'
                  :                               '🧘 Repos total';

  const foodIntro = meals.mode === 'performance'
    ? 'Privilégie glucides complexes + protéines. Score ' + rec + '% = corps prêt pour effort intense.'
    : meals.mode === 'recovery'
    ? 'Privilégie anti-inflammatoires. HRV ' + m.hrv + 'ms = inflammation active — chaque repas doit réduire le stress nerveux.'
    : 'Privilégie aliments faciles à digérer. Zone rouge ' + rec + '% — énergie digestive = énergie de récupération.';

  const sieste = (rec < 50 || parseFloat(m.sleepHours) < 6.5)
    ? 'Oui — 20 min (13h-15h)'
    : 'Non nécessaire';
  const bed  = rec < 34 ? '21h30' : rec < 50 ? '22h00' : rec < 67 ? '22h30' : '23h00';
  const caff = rec < 34 ? '13h00' : rec < 50 ? '13h30' : '14h00';
  const alc  = rec < 34 ? '🚫 Éviter absolument' : rec < 50 ? '⚠️ À éviter ce soir' : '✓ Avec modération';

  // ── MESSAGE 1 : Nuit + Mode + Guideline + 4 repas ─────────
  const fmtAlt = (alt) => alt.split(' · ').map(a => '• ' + a).join('\n');

  const msg1 =
`*Iris ✦*

Bonjour ${userName} ! 👋

━━━━━━━━━━━━━━━
🌙 *NUIT*
━━━━━━━━━━━━━━━
Récup : ${rec}% ${rE} · Sommeil : ${m.sleepPerf}% (${m.sleepHours}h) ${sE}
HRV : ${m.hrv}ms ${hE} · FC repos : ${m.rhr}bpm

━━━━━━━━━━━━━━━
📊 *${modeLabel}*
━━━━━━━━━━━━━━━
${guideline}

━━━━━━━━━━━━━━━
🍽️ *ALIMENTATION*
━━━━━━━━━━━━━━━
${foodIntro}

🌅 *Breakfast* — ${meals.breakfast.name}
${meals.breakfast.ingredients}
→ ${meals.breakfast.macros}
${fmtAlt(meals.breakfast.alt)}

☀️ *Lunch* — ${meals.lunch.name}
${meals.lunch.ingredients}
→ ${meals.lunch.macros}
${fmtAlt(meals.lunch.alt)}

⚡ *Snack* — ${meals.snack.name}
${meals.snack.ingredients}
→ ${meals.snack.macros}
${fmtAlt(meals.snack.alt)}

🌙 *Dîner* — ${meals.dinner.name}
${meals.dinner.ingredients}
→ ${meals.dinner.macros}
${fmtAlt(meals.dinner.alt)}`;

  // ── MESSAGE 2 : Sport + Récup + Pourquoi ──────────────────
  const msg2 =
`*Iris ✦* — Sport & Récupération 💪

━━━━━━━━━━━━━━━
💪 *SPORT*
━━━━━━━━━━━━━━━
⏱ Durée : ${sport.duree}
🏋️ Type : ${sport.type}
❤️ Intensité : ${sport.intensite}
🚶 Pas cible : ${sport.pas}

━━━━━━━━━━━━━━━
😴 *RÉCUPÉRATION*
━━━━━━━━━━━━━━━
Sieste : ${sieste}
☕ Caféine stop : ${caff}
🌙 Coucher : ${bed}
🍷 Alcool : ${alc}

━━━━━━━━━━━━━━━
💡 *POURQUOI CES CHOIX ?*
━━━━━━━━━━━━━━━
🍽️ Food : ${reco.foodReco}

💪 Sport : ${reco.sportReco}

🌙 Sommeil : ${reco.sleepReco}

━━━━━━━━━━━━━━━
_Iris · Powered by Vitae & WHOOP_`;

  return { msg1, msg2 };
}

// ── HANDLER ───────────────────────────────────────────────
module.exports = async (req, res) => {
  const userName = process.env.USER_NAME || 'Arthur';

  try {
    const metrics        = await getWhoopMetrics();
    const { msg1, msg2 } = buildMessages(metrics, userName);

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to:   process.env.YOUR_WHATSAPP_NUMBER,
      body: msg1,
    });

    await new Promise(r => setTimeout(r, 1500));

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to:   process.env.YOUR_WHATSAPP_NUMBER,
      body: msg2,
    });

    console.log('[Iris] ✓ 2 messages sent — SID: ' + result.sid);
    return res.status(200).json({
      success:  true,
      recovery: metrics.recoveryScore,
      mode:     metrics.recoveryScore >= 67 ? 'performance' : metrics.recoveryScore >= 34 ? 'recovery' : 'repos',
      messages: 2,
      sid:      result.sid,
    });

  } catch (err) {
    console.error('[Iris] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

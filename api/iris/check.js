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

// ── VOCAL SCRIPT ──────────────────────────────────────────
function buildVocalScript(m, userName, meals, defi) {
  const rec = m.recoveryScore;

  // Intro récup
  let recapNuit;
  if (rec >= 67) {
    recapNuit = `Super récupération, ${rec}%, HRV ${m.hrv} millisecondes, tout est au vert.`;
  } else if (rec >= 34) {
    recapNuit = `Récupération modérée, ${rec}%, HRV ${m.hrv} millisecondes. Ton corps est en train de récupérer.`;
  } else {
    recapNuit = `Récupération faible, ${rec}%, HRV ${m.hrv} millisecondes. Ton corps a besoin de repos aujourd'hui.`;
  }

  // Sport
  let sportText;
  if (rec >= 67) {
    sportText = `Pour le sport, aujourd'hui c'est HIIT ou musculation lourde, une heure, soixante-quinze à quatre-vingt-cinq pourcent de ta fréquence cardiaque max.`;
  } else if (rec >= 50) {
    sportText = `Pour le sport, aujourd'hui c'est musculation légère ou cardio Zone 2, quarante-cinq minutes, soixante à soixante-dix pourcent de ta fréquence cardiaque max.`;
  } else if (rec >= 34) {
    sportText = `Pour le sport, aujourd'hui c'est marche ou yoga doux, trente minutes maximum. Prends soin de ton corps.`;
  } else {
    sportText = `Pour le sport, repos complet aujourd'hui. Ton corps a besoin de toute son énergie pour récupérer.`;
  }

  // Défi — version orale (enlève les emojis)
  const defiOral = defi
    .replace(/🔥|🌿|🧘/g, '')
    .replace('Défi :', 'Petit défi du jour :')
    .trim();

  return `Hello ${userName}.

${recapNuit}

Basé sur ta data, tu peux prendre ${meals.breakfast.name} au petit déjeuner pour te donner de l'énergie, ${meals.lunch.name} au déjeuner, et ${meals.dinner.name} au dîner.

${sportText}

${defiOral}

Enjoy the journey, you're the best.`;
}

// ── OPENAI TTS ────────────────────────────────────────────
async function generateAudio(text) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
   model: 'tts-1-hd',
   input: text,
   voice: 'shimmer',
   speed: 0.9,
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI TTS error: ' + await response.text());
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ── VERCEL BLOB UPLOAD ────────────────────────────────────
async function uploadAudio(audioBuffer) {
  const { put } = require('@vercel/blob');

  const filename = 'iris-recap-' + Date.now() + '.mp3';
  const blob = await put(filename, audioBuffer, {
    access: 'public',
    contentType: 'audio/mpeg',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

// ── DÉFIS ─────────────────────────────────────────────────
const DEFIS_PERFORMANCE = [
  '🔥 Défi : 50 pompes — en 1 set ou fractionné comme tu veux',
  '🔥 Défi : 50 abdos — crunchs, relevés de jambes ou russian twist',
  '🔥 Défi : Gainage max — chrono, bats ton record',
  '🔥 Défi : 100 squats — 5 sets de 20, repos 60s entre chaque',
  '🔥 Défi : 50 dips — chaise, barres ou canapé',
  '🔥 Défi : 50 burpees — rythme libre, sans t\'arrêter',
  '🔥 Défi : 30 tractions — en autant de sets que nécessaire',
  '🔥 Défi : 50 fentes — 25 par jambe, alternées',
  '🔥 Défi : 100 mountain climbers — rythme explosif',
  '🔥 Défi : 3 séries pompes + squats + abdos — sans pause',
  '🔥 Défi : Gainage latéral 60s chaque côté + frontal 90s',
  '🔥 Défi : 50 jump squats — explosivité maximale',
  '🔥 Défi : 10 min yoga — sun salutation x10',
  '🔥 Défi : 5 min cohérence cardiaque — inspire 5s, expire 5s',
];

const DEFIS_RECOVERY = [
  '🌿 Défi : 10 min yoga doux — focus mobilité hanches et épaules',
  '🌿 Défi : 5 min respiration profonde — inspire 4s, retiens 4s, expire 4s',
  '🌿 Défi : 10 min méditation — ferme les yeux, focus sur ta respiration',
  '🌿 Défi : 50 abdos lents — tempo 3s montée, 3s descente',
  '🌿 Défi : Gainage 3x45s — pause 30s entre chaque',
  '🌿 Défi : 10 min étirements — ischios, quadriceps, pectoraux',
  '🌿 Défi : 50 pompes à rythme lent — qualité sur quantité',
  '🌿 Défi : 5 min cohérence cardiaque — réduit le cortisol de 30%',
  '🌿 Défi : 10 min yoga yin — postures tenues 2 min',
  '🌿 Défi : 50 fentes lentes et contrôlées — 25 par jambe',
  '🌿 Défi : 10 min méditation body scan',
  '🌿 Défi : 3x40 abdos — crunchs + obliques + relevés de jambes',
  '🌿 Défi : 5 min respiration box — inspire 4s, retiens 4s, expire 4s, retiens 4s',
  '🌿 Défi : 10 min étirements dynamiques — épaules, hanches, chevilles',
];

const DEFIS_REPOS = [
  '🧘 Défi : 10 min méditation — laisse les pensées passer',
  '🧘 Défi : 5 min cohérence cardiaque — levier direct sur ton HRV',
  '🧘 Défi : 10 min yoga nidra — allongé, scan corporel complet',
  '🧘 Défi : 5 min respiration 4-7-8 — inspire 4s, retiens 7s, expire 8s',
  '🧘 Défi : 10 min étirements doux — sans forcer',
  '🧘 Défi : 5 min méditation pleine conscience — focus sur les sons',
  '🧘 Défi : Respiration nasale alternée — 5 min',
  '🧘 Défi : 10 min yoga restauratif — postures passives',
  '🧘 Défi : 5 min cohérence cardiaque + visualisation positive',
  '🧘 Défi : 10 min méditation compassion',
  '🧘 Défi : 5 min respiration profonde allongé',
  '🧘 Défi : 10 min étirements — cervicales, trapèzes, lombaires',
  '🧘 Défi : 5 min cohérence cardiaque avant le déjeuner',
  '🧘 Défi : 10 min marche consciente — sans téléphone',
];

function getDefi(recoveryScore) {
  const today = new Date();
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
  if (recoveryScore >= 67) return DEFIS_PERFORMANCE[dayOfYear % DEFIS_PERFORMANCE.length];
  if (recoveryScore >= 34) return DEFIS_RECOVERY[dayOfYear % DEFIS_RECOVERY.length];
  return DEFIS_REPOS[dayOfYear % DEFIS_REPOS.length];
}

// ── GUIDELINE ─────────────────────────────────────────────
function getGuideline(m) {
  const rec = m.recoveryScore;
  const str = parseFloat(m.strain);
  if (rec >= 67 && m.sleepPerf >= 75)
    return 'Aujourd\'hui, basé sur ta data, je te recommande de *pousser fort* — système nerveux pleinement récupéré, c\'est le bon jour pour performer.';
  if (rec >= 50 && str > 12)
    return 'Aujourd\'hui, basé sur ta data, je te recommande de *laisser ton corps souffler* — charge d\'hier élevée, priorise la mobilité.';
  if (rec >= 50)
    return 'Aujourd\'hui, basé sur ta data, je te recommande de *t\'entraîner modérément* — récupération en cours, évite le HIIT.';
  if (rec >= 34)
    return 'Aujourd\'hui, basé sur ta data, je te recommande de *réduire l\'effort* — marche et anti-inflammatoires uniquement.';
  return 'Aujourd\'hui, basé sur ta data, je te recommande le *repos complet* — zone rouge, tout entraînement retarde ta récupération.';
}

// ── SPORT ─────────────────────────────────────────────────
function getSport(m) {
  const rec = m.recoveryScore;
  const str = parseFloat(m.strain);
  if (rec >= 67) return { duree: '1h', type: 'HIIT ou Musculation lourde', intensite: '75-85% FC max', pas: '12 000 pas', why: 'HRV ' + m.hrv + 'ms + score ' + rec + '% = signal vert. Ne rate pas cette fenêtre.' };
  if (rec >= 50) return { duree: '45 min', type: str > 12 ? 'Yoga ou Mobilité' : 'Muscu légère ou Zone 2', intensite: '60-70% FC max', pas: '10 000 pas', why: 'Le HIIT augmenterait le cortisol et aggraverait ton HRV demain.' };
  if (rec >= 34) return { duree: '30 min max', type: 'Marche ou Yoga doux', intensite: '50-60% FC max', pas: '7 000 pas', why: 'La marche active la circulation lymphatique sans stress.' };
  return { duree: 'Repos complet', type: 'Marche douce si besoin', intensite: '—', pas: '5 000 pas', why: 'À ' + rec + '%, tout entraînement retarde la récupération de 24-48h.' };
}

// ── RECO ──────────────────────────────────────────────────
function getReco(m) {
  const rec = m.recoveryScore;
  const foodReco = rec >= 67
    ? 'Fibres solubles (avoine) stabilisent ta glycémie sur 3-4h. Les oméga-3 (saumon) maintiennent ton HRV élevé. Les fruits frais améliorent le HRV dans les 24h.'
    : rec >= 34
    ? 'Les anthocyanines (myrtilles) + curcumine ciblent les cytokines inflammatoires. Les oméga-3 améliorent le RMSSD en 24-48h. Le magnésium (amandes) active le GABA.'
    : 'Repas légers = plus d\'énergie pour récupérer. Sardines + avocat = duo EPA/DHA optimal. Cerises acidulées à 15h = mélatonine naturelle.';
  const sportReco = rec >= 67
    ? 'Système nerveux pleinement récupéré. Le HIIT crée un stress positif qui améliore le HRV long terme.'
    : rec >= 34
    ? 'HRV bas = système sympathique actif. La Zone 2 maintient l\'adaptation sans surcharger le système autonome.'
    : 'Zone rouge. Le repos est le seul chemin vers la remontée.';
  const sleepReco = 'Les fibres solubles ce soir favorisent le sommeil profond. Stop caféine à ' +
    (rec < 34 ? '13h00' : rec < 50 ? '13h30' : '14h00') + '. Coucher à ' +
    (rec < 34 ? '21h30' : rec < 50 ? '22h00' : rec < 67 ? '22h30' : '23h00') + '.';
  return { foodReco, sportReco, sleepReco };
}

// ── BUILD TEXT MESSAGES ───────────────────────────────────
function buildMessages(m, userName) {
  const rec  = m.recoveryScore;
  const rE   = rec >= 67 ? '🟢' : rec >= 34 ? '🟡' : '🔴';
  const sE   = m.sleepPerf >= 80 ? '🟢' : m.sleepPerf >= 60 ? '🟡' : '🔴';
  const hE   = m.hrv >= 70 ? '🟢' : m.hrv >= 50 ? '🟡' : '🔴';

  const guideline = getGuideline(m);
  const meals     = getDayMeals(rec);
  const sport     = getSport(m);
  const reco      = getReco(m);
  const defi      = getDefi(rec);

  const modeLabel = meals.mode === 'performance' ? '⚡ Performance' : meals.mode === 'recovery' ? '🔄 Recovery' : '🧘 Repos total';
  const foodIntro = meals.mode === 'performance'
    ? 'Privilégie glucides complexes + protéines. Score ' + rec + '% = corps prêt pour effort intense.'
    : meals.mode === 'recovery'
    ? 'Privilégie les anti-inflammatoires. HRV ' + m.hrv + 'ms = inflammation active.'
    : 'Privilégie aliments faciles à digérer. Zone rouge ' + rec + '%.';

  const sieste = (rec < 50 || parseFloat(m.sleepHours) < 6.5) ? 'Oui — 20 min (13h-15h)' : 'Non nécessaire';
  const bed    = rec < 34 ? '21h30' : rec < 50 ? '22h00' : rec < 67 ? '22h30' : '23h00';
  const caff   = rec < 34 ? '13h00' : rec < 50 ? '13h30' : '14h00';
  const alc    = rec < 34 ? '🚫 Éviter absolument' : rec < 50 ? '⚠️ À éviter ce soir' : '✓ Avec modération';

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

  const msg2 =
`*Iris ✦* — Sport & Récupération 💪

━━━━━━━━━━━━━━━
💪 *SPORT*
━━━━━━━━━━━━━━━
⏱ Durée : ${sport.duree}
🏋️ Type : ${sport.type}
❤️ Intensité : ${sport.intensite}
🚶 Pas cible : ${sport.pas}
${sport.why}

${defi}

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

  return { msg1, msg2, meals, defi };
}

// ── HANDLER ───────────────────────────────────────────────
module.exports = async (req, res) => {
  const userName = process.env.USER_NAME || 'Arthur';

  try {
    const metrics = await getWhoopMetrics();
    const { msg1, msg2, meals, defi } = buildMessages(metrics, userName);

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // ── 1. Génère et envoie le vocal ──────────────────────
    const vocalScript = buildVocalScript(metrics, userName, meals, defi);
    const audioBuffer = await generateAudio(vocalScript);
    const audioUrl    = await uploadAudio(audioBuffer);

    await client.messages.create({
      from:     process.env.TWILIO_WHATSAPP_FROM,
      to:       process.env.YOUR_WHATSAPP_NUMBER,
      body:     '',
      mediaUrl: [audioUrl],
    });

    await new Promise(r => setTimeout(r, 2000));

    // ── 2. Message 1 : food ───────────────────────────────
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to:   process.env.YOUR_WHATSAPP_NUMBER,
      body: msg1,
    });

    await new Promise(r => setTimeout(r, 1500));

    // ── 3. Message 2 : sport & récup ──────────────────────
    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to:   process.env.YOUR_WHATSAPP_NUMBER,
      body: msg2,
    });

    console.log('[Iris] ✓ 3 messages sent (vocal + 2 textes) — SID: ' + result.sid);
    return res.status(200).json({
      success:   true,
      recovery:  metrics.recoveryScore,
      mode:      metrics.recoveryScore >= 67 ? 'performance' : metrics.recoveryScore >= 34 ? 'recovery' : 'repos',
      messages:  3,
      audio_url: audioUrl,
      sid:       result.sid,
    });

  } catch (err) {
    console.error('[Iris] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

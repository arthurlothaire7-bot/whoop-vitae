const twilio = require('twilio');

// ── WHOOP ─────────────────────────────────────────────────
async function getWhoopMetrics() {
  const token = process.env.WHOOP_ACCESS_TOKEN;
  const base  = 'https://api.prod.whoop.com/developer/v1';

  const whoopGet = async (endpoint) => {
    let res = await fetch(`${base}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 401) {
      const r = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'refresh_token',
          refresh_token: process.env.WHOOP_REFRESH_TOKEN,
          client_id:     process.env.WHOOP_CLIENT_ID,
          client_secret: process.env.WHOOP_CLIENT_SECRET,
        })
      });
      const t = await r.json();
      res = await fetch(`${base}${endpoint}`, {
        headers: { Authorization: `Bearer ${t.access_token}` }
      });
    }
    return res.json();
  };

  const [rec, cycle, sleep] = await Promise.all([
    whoopGet('/recovery?limit=1'),
    whoopGet('/cycle?limit=1'),
    whoopGet('/sleep?limit=1'),
  ]);

  const recovery = rec.records?.[0];
  const sl       = sleep.records?.[0];
  const cy       = cycle.records?.[0];

  return {
    recoveryScore: Math.round(recovery?.score?.recovery_score ?? 0),
    hrv:           Math.round(recovery?.score?.hrv_rmssd_milli ?? 0),
    rhr:           Math.round(recovery?.score?.resting_heart_rate ?? 0),
    sleepPerf:     Math.round(sl?.score?.sleep_performance_percentage ?? 0),
    sleepHours:    sl?.score?.stage_summary?.total_in_bed_time_milli
      ? (sl.score.stage_summary.total_in_bed_time_milli / 3600000).toFixed(1) : '?',
    strain:        cy?.score?.strain?.toFixed(1) ?? '0.0',
  };
}

// ── MESSAGE ────────────────────────────────────────────────
function buildMessage(m, userName) {
  const rec = m.recoveryScore;
  const hrv = m.hrv;
  const strain = parseFloat(m.strain);

  // ── MODE ──
  let mode;
  if (rec >= 67) mode = 'performance';
  else if (rec >= 34) mode = 'recovery';
  else mode = 'repos';

  // ── INTRO FOOD (privilégie...) ──
  const foodIntro = {
    performance:
      `Privilégie les glucides complexes et les protéines aujourd'hui. Ton score de ${rec}% indique que ton corps est prêt à absorber un effort intense — fuel en conséquence. Ce que tu manges maintenant détermine ta performance de ce soir et ta récupération de demain.`,
    recovery:
      `Privilégie les aliments anti-inflammatoires aujourd'hui. Ton HRV à ${hrv}ms signale un stress nerveux actif — la nutrition est ton levier principal ce matin. Chaque repas doit travailler à réduire l'inflammation et restaurer ton système parasympathique.`,
    repos:
      `Privilégie les aliments faciles à digérer aujourd'hui. Ton corps est en zone rouge à ${rec}% — toute énergie dépensée en digestion est volée à ta récupération. Repas légers, anti-inflammatoires, et dîner avant 19h30 impérativement.`,
  }[mode];

  // ── MEALS avec explications ──
  const meals = {
    performance: {
      modeLabel: '⚡ Performance',
      modeContext: 'Ton corps est prêt. Fuel maximum aujourd\'hui.',
      breakfast: {
        name: 'Power Oat Bowl',
        detail: 'Avoine · Whey protein · Banane · Miel · Lait d\'amande',
        macros: '38g P · 82g G · 558 kcal',
        why: `💡 Ton score de ${rec}% confirme des réserves de glycogène restaurées. L'avoine fournit des glucides complexes à index glycémique modéré — énergie stable sur 3-4h. La whey déclenche la synthèse protéique musculaire dès le matin. La banane ajoute du potassium pour prévenir les crampes à l'effort.`,
      },
      lunch: {
        name: 'Bowl Poulet & Riz complet',
        detail: 'Blanc de poulet · Riz brun · Brocolis · Huile d\'olive',
        macros: '45g P · 68g G · 580 kcal',
        why: `💡 45g de protéines maigres pour maintenir la synthèse musculaire entre les séances. Le riz brun recharge le glycogène sans pic insulinique. Le brocolis apporte du sulforaphane — un anti-inflammatoire naturel qui protège les tissus musculaires sollicités.`,
      },
      snack: {
        name: 'Shake pré-séance',
        detail: 'Banane · Whey · Dattes Medjool · Lait entier',
        macros: '28g P · 48g G · 340 kcal',
        why: `💡 À prendre 30 min avant l'effort. Le glucose rapide de la banane et des dattes crée un pic d'énergie disponible dès l'échauffement. La whey atteint les muscles avant même la fin du warm-up. Ce timing est la différence entre une bonne et une excellente séance.`,
      },
      dinner: {
        name: 'Steak & Patate douce',
        detail: 'Steak grass-fed · Patate douce · Asperges · Beurre',
        macros: '42g P · 52g G · 538 kcal',
        why: `💡 Le boeuf grass-fed contient de la créatine et du zinc naturels — essentiels pour la récupération musculaire post-séance intense. La patate douce recharge le glycogène de façon optimale 4-6h après l'effort, exactement au moment où les muscles sont les plus réceptifs.`,
      },
      hydration: '3.2 L',
    },
    recovery: {
      modeLabel: '🔄 Recovery',
      modeContext: 'Système nerveux en récupération. Anti-inflammatoire prioritaire.',
      breakfast: {
        name: 'Smoothie Bowl Anti-Inflammatoire',
        detail: 'Myrtilles · Curcuma · Yaourt grec · Graines de chia · Poivre noir',
        macros: '22g P · 52g G · 390 kcal',
        why: `💡 Ton HRV à ${hrv}ms est sous ta baseline — signe d'inflammation active. Les anthocyanines des myrtilles et la curcumine ciblent directement les cytokines inflammatoires responsables de cette baisse. Le poivre noir est obligatoire : il multiplie l'absorption de curcumine par 20. Le yaourt grec apporte des probiotiques qui soutiennent l'axe intestin-cerveau, directement lié à ton HRV.`,
      },
      lunch: {
        name: 'Bowl Saumon & Quinoa',
        detail: 'Saumon sauvage · Quinoa · Concombre · Citron · Aneth',
        macros: '42g P · 45g G · 510 kcal',
        why: `💡 C'est le repas le plus important de ta journée aujourd'hui. L'EPA et le DHA du saumon sauvage réduisent directement les cytokines pro-inflammatoires liées à ta baisse de HRV. Le quinoa fournit les 9 acides aminés essentiels pour réparer les tissus sans surcharger la digestion. Effet visible sur le HRV sous 24-48h de consommation régulière.`,
      },
      snack: {
        name: 'Amandes & Cerises acidulées',
        detail: 'Amandes · Cerises séchées · Chocolat noir 85% · Graines de courge',
        macros: '8g P · 28g G · 280 kcal',
        why: `💡 76mg de magnésium par 30g d'amandes — ce minéral active les récepteurs GABA, le frein naturel de ton système nerveux. Les cerises acidulées contiennent des précurseurs de mélatonine. Mange ce snack à 16h pour amorcer ta récupération nerveuse en vue de cette nuit. Effet direct sur la qualité du sommeil et ton HRV de demain.`,
      },
      dinner: {
        name: 'Bouillon Poulet Curcuma',
        detail: 'Blanc de poulet · Bouillon d\'os · Gingembre · Curcuma · Kale',
        macros: '35g P · 22g G · 340 kcal',
        why: `💡 Repas léger intentionnellement — moins ton corps dépense d'énergie à digérer, plus il en a pour réparer. Le collagène du bouillon d'os reconstruit les tissus conjonctifs sollicités. Le gingembre et le curcuma agissent en anti-inflammatoires pendant toute la nuit, au moment où ton corps effectue son travail de récupération profonde.`,
      },
      hydration: '2.6 L',
    },
    repos: {
      modeLabel: '🧘 Repos total',
      modeContext: 'Ton corps est en zone rouge. Zéro effort, récupération maximum.',
      breakfast: {
        name: 'Toast Banane & Beurre d\'amande',
        detail: 'Pain complet · Banane · Beurre d\'amande · Miel',
        macros: '10g P · 58g G · 380 kcal',
        why: `💡 Avec ${rec}% de récupération, ton système digestif est aussi sous stress. Commence par quelque chose de simple et rassurant. La banane apporte du potassium pour rééquilibrer les électrolytes. Le beurre d'amande fournit des graisses lentes pour éviter la chute de glycémie. Rien de lourd — ton corps n'a pas l'énergie pour digérer.`,
      },
      lunch: {
        name: 'Sardines & Avocat',
        detail: 'Sardines à l\'huile · Avocat · Salade verte · Câpres · Citron',
        macros: '28g P · 18g G · 480 kcal',
        why: `💡 Ton RHR élevé signale un stress cardiovasculaire. La combinaison sardines + avocat est le duo le plus concentré en EPA/DHA + acide oléique disponible. Ces deux acides gras agissent directement sur l'inflammation vasculaire responsable de ton RHR élevé. C'est le repas le plus important de ta journée aujourd'hui.`,
      },
      snack: {
        name: 'Jus de cerises acidulées & Amandes',
        detail: '30ml de concentré · Amandes · À prendre impérativement à 15h',
        macros: '6g P · 32g G · 240 kcal',
        why: `💡 Avec seulement ${m.sleepHours}h de sommeil, cette nuit est critique. Le jus de cerises acidulées contient de la mélatonine naturelle et des précurseurs de sérotonine. Pris à 15h, il démarre la préparation au sommeil 6h à l'avance. Les amandes ajoutent du magnésium pour activer le GABA ce soir. Ce snack est un investissement direct pour demain matin.`,
      },
      dinner: {
        name: 'Riz blanc, Saumon vapeur & Légumes',
        detail: 'Riz blanc · Saumon · Courgettes · Carottes vapeur',
        macros: '38g P · 45g G · 460 kcal',
        why: `💡 Riz blanc et non complet ce soir — il se digère en 1h contre 3h pour le riz brun. Ton corps économise ainsi de l'énergie pour la récupération nocturne. Le saumon vapeur préserve les oméga-3 contrairement à la cuisson à la poêle. Dîner impérativement avant 19h30 et rien après 20h — chaque heure de digestion pendant le sommeil réduit la qualité du REM.`,
      },
      hydration: '3.0 L',
    },
  }[mode];

  // ── SPORT avec explication ──
  let sport;
  if (rec >= 67) {
    sport = {
      duree: '1h',
      type: 'HIIT ou Musculation lourde',
      intensite: '75-85% FC max',
      pas: '12 000 pas',
      why: `💡 Ton score de ${rec}% et ton HRV de ${hrv}ms indiquent que ton système nerveux autonome est pleinement récupéré. C'est le signal vert pour un effort intense. Le HIIT à cette intensité génère un stress positif (hormèse) qui forcera une adaptation et améliorera ton HRV à long terme. Ne gâche pas cette fenêtre — les jours à ${rec}%+ sont rares.`,
    };
  } else if (rec >= 50) {
    sport = {
      duree: '45 min',
      type: strain > 12 ? 'Yoga ou Mobilité' : 'Musculation légère ou Cardio Zone 2',
      intensite: '60-70% FC max',
      pas: '10 000 pas',
      why: `💡 Ton HRV à ${hrv}ms est sous pression — le HIIT aujourd'hui augmenterait le cortisol et aggraverait ce chiffre demain. La musculation légère ou la Zone 2 maintient le signal d'adaptation musculaire sans solliciter le système nerveux sympathique. Tu construis sans détruire. L'intensité modérée à 60-70% FC max est précisément la zone où l'on brûle des graisses sans générer d'inflammation supplémentaire.`,
    };
  } else if (rec >= 34) {
    sport = {
      duree: '30 min max',
      type: 'Marche ou Yoga doux',
      intensite: '50-60% FC max',
      pas: '7 000 pas',
      why: `💡 À ${rec}% de récupération, tout effort structuré retarde ta remontée. La marche active la circulation lymphatique et élimine les déchets métaboliques accumulés sans générer de nouveau stress. Le yoga doux active le nerf vague — connexion directe avec ton HRV. 30 minutes suffisent. Plus serait contre-productif.`,
    };
  } else {
    sport = {
      duree: 'Aucun entraînement',
      type: 'Repos actif — marche douce uniquement',
      intensite: 'Fréquence cardiaque libre',
      pas: '5 000 pas',
      why: `💡 Stop. À ${rec}% avec un RHR élevé, tout entraînement aujourd'hui retarderait ta récupération de 24 à 48h. Ton corps est en mode réparation d'urgence — il a besoin de toute son énergie pour ça, pas pour performer. Une marche courte suffit pour maintenir la circulation. La seule chose qui te fera remonter : sommeil, nutrition, et zéro stress physique.`,
    };
  }

  // ── SIESTE ──
  const sieste = rec < 50 || parseFloat(m.sleepHours) < 6.5
    ? 'Oui — 20 min entre 13h et 15h\n💡 Une sieste courte de 20 min réduit le cortisol de 30% et améliore la vigilance sans créer d\'inertie de sommeil. Au-delà de 25 min, tu rentres en sommeil profond et te réveilles dans un état pire.'
    : 'Non nécessaire aujourd\'hui';

  // ── BEDTIME ──
  const bed = rec < 34 ? '21h30' : rec < 50 ? '22h00' : rec < 67 ? '22h30' : '23h00';

  // ── CAFÉINE ──
  const caff = rec < 34 ? '13h00' : rec < 50 ? '13h30' : '14h00';

  // ── LABELS ──
  const recEmoji   = rec >= 67 ? '🟢' : rec >= 34 ? '🟡' : '🔴';
  const sleepEmoji = m.sleepPerf >= 80 ? '🟢' : m.sleepPerf >= 60 ? '🟡' : '🔴';
  const hrvEmoji   = hrv >= 70 ? '🟢' : hrv >= 50 ? '🟡' : '🔴';

  return `*Iris ✦*

Bonjour ${userName} ! Ton recap Vitae est prêt 👋

━━━━━━━━━━━━━━━
🌙 *TA NUIT*
━━━━━━━━━━━━━━━
Récupération : ${rec}% ${recEmoji}
Sommeil : ${m.sleepPerf}% (${m.sleepHours}h) ${sleepEmoji}
HRV : ${hrv}ms ${hrvEmoji}
FC repos : ${m.rhr} bpm
Strain hier : ${m.strain}

━━━━━━━━━━━━━━━
📊 *ÉTAT DU JOUR*
━━━━━━━━━━━━━━━
Mode : ${meals.modeLabel}
${meals.modeContext}

━━━━━━━━━━━━━━━
🍽️ *ALIMENTATION*
━━━━━━━━━━━━━━━
${foodIntro}

🌅 *Petit-déjeuner*
${meals.breakfast.name}
${meals.breakfast.detail}
→ ${meals.breakfast.macros}
${meals.breakfast.why}

☀️ *Déjeuner*
${meals.lunch.name}
${meals.lunch.detail}
→ ${meals.lunch.macros}
${meals.lunch.why}

⚡ *Snack (16h)*
${meals.snack.name}
${meals.snack.detail}
→ ${meals.snack.macros}
${meals.snack.why}

🌙 *Dîner*
${meals.dinner.name}
${meals.dinner.detail}
→ ${meals.dinner.macros}
${meals.dinner.why}

💧 Hydratation : ${meals.hydration}

━━━━━━━━━━━━━━━
💪 *SPORT*
━━━━━━━━━━━━━━━
⏱ Durée : ${sport.duree}
🏋️ Type : ${sport.type}
❤️ Intensité : ${sport.intensite}
🚶 Pas cible : ${sport.pas}
${sport.why}

━━━━━━━━━━━━━━━
😴 *RÉCUPÉRATION*
━━━━━━━━━━━━━━━
Sieste : ${sieste}
☕ Caféine : Stop à ${caff}
🌙 Coucher recommandé : ${bed}
🍷 Alcool : ${rec < 50 ? '🚫 Éviter absolument — aggrave le HRV de 8-12 points' : '⚠️ Avec modération si possible'}

━━━━━━━━━━━━━━━
_Iris · Powered by Vitae & WHOOP_`;
}

// ── HANDLER ───────────────────────────────────────────────
module.exports = async (req, res) => {
  const auth   = req.headers.authorization;
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userName = process.env.USER_NAME || 'Arthur';

  try {
    const metrics = await getWhoopMetrics();
    const message = buildMessage(metrics, userName);

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to:   process.env.YOUR_WHATSAPP_NUMBER,
      body: message,
    });

    console.log(`[Iris] ✓ Sent — SID: ${result.sid}`);
    return res.status(200).json({
      success:  true,
      recovery: metrics.recoveryScore,
      mode:     metrics.recoveryScore >= 67 ? 'performance' : metrics.recoveryScore >= 34 ? 'recovery' : 'repos',
      sid:      result.sid,
    });

  } catch (err) {
    console.error('[Iris] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

  async function whoopGet(endpoint) {
    let res = await fetch(`${base}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 401) {
      // Refresh token
      const r = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'refresh_token',
          refresh_token: process.env.WHOOP_REFRESH_TOKEN,
          client_id:     process.env.WHOOP_CLIENT_ID,
          client_secret: process.env.WHOOP_CLIENT_SECRET,
        })
      });
      const t = await r.json();
      res = await fetch(`${base}${endpoint}`, {
        headers: { Authorization: `Bearer ${t.access_token}` }
      });
    }
    return res.json();
  }

  const [rec, cycle, sleep] = await Promise.all([
    whoopGet('/recovery?limit=1'),
    whoopGet('/cycle?limit=1'),
    whoopGet('/sleep?limit=1'),
  ]);

  const recovery = rec.records?.[0];
  const sl       = sleep.records?.[0];
  const cy       = cycle.records?.[0];

  return {
    recoveryScore: Math.round(recovery?.score?.recovery_score ?? 0),
    hrv:           Math.round(recovery?.score?.hrv_rmssd_milli ?? 0),
    rhr:           Math.round(recovery?.score?.resting_heart_rate ?? 0),
    sleepPerf:     Math.round(sl?.score?.sleep_performance_percentage ?? 0),
    sleepHours:    sl?.score?.stage_summary?.total_in_bed_time_milli
      ? (sl.score.stage_summary.total_in_bed_time_milli / 3600000).toFixed(1) : '?',
    strain:        cy?.score?.strain?.toFixed(1) ?? '0.0',
  };
}

// ── RECOMMENDATIONS ────────────────────────────────────────
function buildMessage(m, userName) {
  const rec = m.recoveryScore;

  // Mode
  let mode, modeLabel, modeContext;
  if (rec >= 67) {
    mode = 'performance'; modeLabel = '⚡ Performance';
    modeContext = 'Ton corps est prêt. Fuel maximum aujourd\'hui.';
  } else if (rec >= 34) {
    mode = 'recovery'; modeLabel = '🔄 Recovery';
    modeContext = 'Système nerveux en récupération. Anti-inflammatoire prioritaire.';
  } else {
    mode = 'repos'; modeLabel = '🧘 Repos total';
    modeContext = 'Ton corps est en zone rouge. Zéro effort aujourd\'hui.';
  }

  // Meals
  const meals = {
    performance: {
      breakfast: { name: 'Power Oat Bowl',              detail: 'Avoine · Whey · Banane · Miel',              macros: '38g P · 82g G · 558 kcal' },
      lunch:     { name: 'Bowl Poulet & Riz complet',   detail: 'Poulet · Riz brun · Brocolis',               macros: '45g P · 68g G · 580 kcal' },
      snack:     { name: 'Shake pré-séance',             detail: 'Banane · Whey · Dattes · Lait',             macros: '28g P · 48g G · 340 kcal' },
      dinner:    { name: 'Steak & Patate douce',         detail: 'Steak · Patate douce · Asperges',           macros: '42g P · 52g G · 538 kcal' },
      hydration: '3.2 L',
    },
    recovery: {
      breakfast: { name: 'Smoothie Bowl Anti-Inflammatoire', detail: 'Myrtilles · Curcuma · Yaourt grec',     macros: '22g P · 52g G · 390 kcal' },
      lunch:     { name: 'Bowl Saumon & Quinoa',             detail: 'Saumon · Quinoa · Concombre · Citron',  macros: '42g P · 45g G · 510 kcal' },
      snack:     { name: 'Amandes & Cerises acidulées',      detail: 'Amandes · Cerises · Chocolat 85%',      macros: '8g P · 28g G · 280 kcal' },
      dinner:    { name: 'Bouillon Poulet Curcuma',          detail: 'Poulet · Bouillon d\'os · Gingembre',   macros: '35g P · 22g G · 340 kcal' },
      hydration: '2.6 L',
    },
    repos: {
      breakfast: { name: 'Toast Banane & Beurre d\'amande', detail: 'Pain · Banane · Beurre d\'amande',       macros: '10g P · 58g G · 380 kcal' },
      lunch:     { name: 'Sardines & Avocat',               detail: 'Sardines · Avocat · Salade · Citron',    macros: '28g P · 18g G · 480 kcal' },
      snack:     { name: 'Jus de cerises & Amandes',        detail: 'À prendre à 15h',                        macros: '6g P · 32g G · 240 kcal' },
      dinner:    { name: 'Riz blanc, Saumon & Légumes',     detail: 'Dîner avant 19h30',                      macros: '38g P · 45g G · 460 kcal' },
      hydration: '3.0 L',
    },
  }[mode];

  // Sport
  let sport;
  if (rec >= 67)      sport = { duree: '1h',       type: 'HIIT ou Musculation',          intensite: '75-85% FC max', pas: '12 000 pas' };
  else if (rec >= 50) sport = { duree: '45 min',   type: 'Musculation légère ou Zone 2', intensite: '60-70% FC max', pas: '10 000 pas' };
  else if (rec >= 34) sport = { duree: '30 min',   type: 'Marche ou Yoga doux',          intensite: '50-60% FC max', pas: '7 000 pas'  };
  else                sport = { duree: 'Repos',    type: 'Marche douce uniquement',      intensite: '—',             pas: '5 000 pas'  };

  // Sieste
  const sieste = rec < 50 ? 'Oui — 20 min entre 13h et 15h' : 'Non nécessaire';

  // Bedtime
  const bed = rec < 34 ? '21h30' : rec < 50 ? '22h00' : rec < 67 ? '22h30' : '23h00';

  // Caféine
  const caff = rec < 34 ? '13h00' : rec < 50 ? '13h30' : '14h00';

  // Labels
  const recEmoji  = rec >= 67 ? '🟢' : rec >= 34 ? '🟡' : '🔴';
  const sleepEmoji = m.sleepPerf >= 80 ? '🟢' : m.sleepPerf >= 60 ? '🟡' : '🔴';
  const hrvEmoji  = m.hrv >= 70 ? '🟢' : m.hrv >= 50 ? '🟡' : '🔴';

  return `*Iris ✦*

Bonjour ${userName} ! Ton recap Vitae est prêt 👋

━━━━━━━━━━━━━━━
🌙 *TA NUIT*
━━━━━━━━━━━━━━━
Récupération : ${rec}% ${recEmoji}
Sommeil : ${m.sleepPerf}% (${m.sleepHours}h) ${sleepEmoji}
HRV : ${m.hrv}ms ${hrvEmoji}
FC repos : ${m.rhr} bpm
Strain hier : ${m.strain}

━━━━━━━━━━━━━━━
📊 *ÉTAT DU JOUR*
━━━━━━━━━━━━━━━
Mode : ${modeLabel}
${modeContext}

━━━━━━━━━━━━━━━
🍽️ *ALIMENTATION*
━━━━━━━━━━━━━━━
🌅 *Petit-déjeuner*
${meals.breakfast.name}
${meals.breakfast.detail}
→ ${meals.breakfast.macros}

☀️ *Déjeuner*
${meals.lunch.name}
${meals.lunch.detail}
→ ${meals.lunch.macros}

⚡ *Snack (16h)*
${meals.snack.name}
${meals.snack.detail}
→ ${meals.snack.macros}

🌙 *Dîner*
${meals.dinner.name}
${meals.dinner.detail}
→ ${meals.dinner.macros}

💧 Hydratation : ${meals.hydration}

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
☕ Caféine : Stop à ${caff}
🌙 Coucher : ${bed}

━━━━━━━━━━━━━━━
_Iris · Powered by Vitae & WHOOP_`;
}

// ── HANDLER ───────────────────────────────────────────────
module.exports = async (req, res) => {
  // Security check
  const auth   = req.headers.authorization;
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userName = process.env.USER_NAME || 'Arthur';

  try {
    const metrics = await getWhoopMetrics();
    const message = buildMessage(metrics, userName);

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to:   process.env.YOUR_WHATSAPP_NUMBER,
      body: message,
    });

    console.log(`[Iris] ✓ Sent — SID: ${result.sid}`);
    return res.status(200).json({ success: true, recovery: metrics.recoveryScore, sid: result.sid });

  } catch (err) {
    console.error('[Iris] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

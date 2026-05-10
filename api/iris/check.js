const twilio = require('twilio');

async function getWhoopMetrics() {
  const token = process.env.WHOOP_ACCESS_TOKEN;
  const base = 'https://api.prod.whoop.com/developer/v1';

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
      const t = await r.json();
      res = await fetch(base + endpoint, {
        headers: { Authorization: 'Bearer ' + t.access_token }
      });
    }
    return res.json();
  };

  const rec = await whoopGet('/recovery?limit=1');
  const cycle = await whoopGet('/cycle?limit=1');
  const sleep = await whoopGet('/sleep?limit=1');

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
    performance: 'Privilégie les glucides complexes et les protéines aujourd\'hui. Ton score de ' + rec + '% indique que ton corps est prêt à absorber un effort intense — fuel en conséquence. Ce que tu manges maintenant détermine ta performance et ta récupération de demain.',
    recovery: 'Privilégie les aliments anti-inflammatoires aujourd\'hui. Ton HRV à ' + hrv + 'ms signale un stress nerveux actif — la nutrition est ton levier principal ce matin. Chaque repas doit travailler à réduire l\'inflammation et restaurer ton système parasympathique.',
    repos: 'Privilégie les aliments faciles à digérer aujourd\'hui. Ton corps est en zone rouge à ' + rec + '% — toute énergie dépensée en digestion est volée à ta récupération. Repas légers, anti-inflammatoires, dîner avant 19h30.'
  }[mode];

  var meals = {
    performance: {
      modeLabel: '⚡ Performance',
      modeContext: 'Ton corps est prêt. Fuel maximum aujourd\'hui.',
      breakfast: { name: 'Power Oat Bowl', detail: 'Avoine · Whey protein · Banane · Miel · Lait d\'amande', macros: '38g P · 82g G · 558 kcal', why: '💡 Ton score de ' + rec + '% confirme des réserves de glycogène restaurées. L\'avoine fournit des glucides complexes à index modéré — énergie stable sur 3-4h. La whey déclenche la synthèse protéique musculaire dès le matin. La banane ajoute du potassium pour prévenir les crampes.' },
      lunch: { name: 'Bowl Poulet & Riz complet', detail: 'Blanc de poulet · Riz brun · Brocolis · Huile d\'olive', macros: '45g P · 68g G · 580 kcal', why: '💡 45g de protéines maigres pour maintenir la synthèse musculaire. Le riz brun recharge le glycogène sans pic insulinique. Le brocolis apporte du sulforaphane — anti-inflammatoire naturel qui protège les tissus sollicités.' },
      snack: { name: 'Shake pré-séance', detail: 'Banane · Whey · Dattes Medjool · Lait entier', macros: '28g P · 48g G · 340 kcal', why: '💡 À prendre 30 min avant l\'effort. Le glucose rapide crée un pic d\'énergie disponible dès l\'échauffement. La whey atteint les muscles avant même la fin du warm-up.' },
      dinner: { name: 'Steak & Patate douce', detail: 'Steak grass-fed · Patate douce · Asperges · Beurre', macros: '42g P · 52g G · 538 kcal', why: '💡 Le boeuf grass-fed contient de la créatine et du zinc naturels. La patate douce recharge le glycogène de façon optimale 4-6h après l\'effort.' },
      hydration: '3.2 L'
    },
    recovery: {
      modeLabel: '🔄 Recovery',
      modeContext: 'Système nerveux en récupération. Anti-inflammatoire prioritaire.',
      breakfast: { name: 'Smoothie Bowl Anti-Inflammatoire', detail: 'Myrtilles · Curcuma · Yaourt grec · Graines de chia · Poivre noir', macros: '22g P · 52g G · 390 kcal', why: '💡 Ton HRV à ' + hrv + 'ms signale une inflammation active. Les anthocyanines des myrtilles + curcumine ciblent les cytokines inflammatoires. Le poivre noir est obligatoire : il multiplie l\'absorption de curcumine par 20.' },
      lunch: { name: 'Bowl Saumon & Quinoa', detail: 'Saumon sauvage · Quinoa · Concombre · Citron · Aneth', macros: '42g P · 45g G · 510 kcal', why: '💡 C\'est le repas le plus important de ta journée. L\'EPA et DHA du saumon sauvage réduisent directement les cytokines pro-inflammatoires liées à ta baisse de HRV. Effet visible sous 24-48h.' },
      snack: { name: 'Amandes & Cerises acidulées', detail: 'Amandes · Cerises séchées · Chocolat noir 85% · Graines de courge', macros: '8g P · 28g G · 280 kcal', why: '💡 76mg de magnésium par 30g d\'amandes active les récepteurs GABA — le frein naturel du système nerveux. Les cerises acidulées contiennent des précurseurs de mélatonine. Mange à 16h pour préparer la récupération nocturne.' },
      dinner: { name: 'Bouillon Poulet Curcuma', detail: 'Blanc de poulet · Bouillon d\'os · Gingembre · Curcuma · Kale', macros: '35g P · 22g G · 340 kcal', why: '💡 Repas léger intentionnellement — moins ton corps dépense d\'énergie à digérer, plus il en a pour réparer. Le collagène du bouillon d\'os reconstruit les tissus. Gingembre + curcuma agissent en anti-inflammatoires toute la nuit.' },
      hydration: '2.6 L'
    },
    repos: {
      modeLabel: '🧘 Repos total',
      modeContext: 'Ton corps est en zone rouge. Zéro effort, récupération maximum.',
      breakfast: { name: 'Toast Banane & Beurre d\'amande', detail: 'Pain complet · Banane · Beurre d\'amande · Miel', macros: '10g P · 58g G · 380 kcal', why: '💡 Après une nuit difficile, ton système digestif est aussi sous stress. Simple et rassurant. La banane apporte du potassium pour rééquilibrer les électrolytes.' },
      lunch: { name: 'Sardines & Avocat', detail: 'Sardines à l\'huile · Avocat · Salade verte · Câpres · Citron', macros: '28g P · 18g G · 480 kcal', why: '💡 La combinaison sardines + avocat est le duo le plus concentré en EPA/DHA + acide oléique. Ces acides gras agissent directement sur l\'inflammation vasculaire responsable de ton RHR élevé.' },
      snack: { name: 'Jus de cerises acidulées & Amandes', detail: '30ml de concentré · Amandes · À prendre à 15h impérativement', macros: '6g P · 32g G · 240 kcal', why: '💡 Le jus de cerises contient de la mélatonine naturelle. Pris à 15h, il démarre la préparation au sommeil 6h à l\'avance. Les amandes ajoutent du magnésium pour activer le GABA ce soir.' },
      dinner: { name: 'Riz blanc, Saumon vapeur & Légumes', detail: 'Riz blanc · Saumon · Légumes vapeur · Dîner avant 19h30', macros: '38g P · 45g G · 460 kcal', why: '💡 Riz blanc ce soir — se digère en 1h contre 3h pour le riz brun. Ton corps économise cette énergie pour la récupération nocturne. Dîner avant 19h30 et rien après 20h.' },
      hydration: '3.0 L'
    }
  }[mode];

  var sport;
  if (rec >= 67) {
    sport = { duree: '1h', type: 'HIIT ou Musculation lourde', intensite: '75-85% FC max', pas: '12 000 pas', why: '💡 Ton score de ' + rec + '% et HRV de ' + hrv + 'ms indiquent que ton système nerveux est pleinement récupéré. C\'est le signal vert pour un effort intense. Ne gâche pas cette fenêtre — les jours à ' + rec + '%+ sont rares.' };
  } else if (rec >= 50) {
    sport = { duree: '45 min', type: strain > 12 ? 'Yoga ou Mobilité' : 'Musculation légère ou Cardio Zone 2', intensite: '60-70% FC max', pas: '10 000 pas', why: '💡 Ton HRV à ' + hrv + 'ms est sous pression — le HIIT augmenterait le cortisol et aggraverait ce chiffre demain. La Zone 2 maintient l\'adaptation musculaire sans solliciter le système nerveux sympathique.' };
  } else if (rec >= 34) {
    sport = { duree: '30 min max', type: 'Marche ou Yoga doux', intensite: '50-60% FC max', pas: '7 000 pas', why: '💡 À ' + rec + '% de récupération, tout effort structuré retarde ta remontée. La marche active la circulation lymphatique sans générer de nouveau stress. 30 minutes suffisent — plus serait contre-productif.' };
  } else {
    sport = { duree: 'Aucun entraînement', type: 'Repos actif — marche douce uniquement', intensite: '—', pas: '5 000 pas', why: '💡 Stop. À ' + rec + '%, tout entraînement retarderait ta récupération de 24-48h. Ton corps est en mode réparation d\'urgence — il a besoin de toute son énergie pour ça, pas pour performer.' };
  }

  var sieste = rec < 50 || parseFloat(m.sleepHours) < 6.5
    ? 'Oui — 20 min entre 13h et 15h\n💡 Une sieste de 20 min réduit le cortisol de 30% et améliore la vigilance. Au-delà de 25 min, tu rentres en sommeil profond et te réveilles dans un état pire.'
    : 'Non nécessaire aujourd\'hui';

  var bed = rec < 34 ? '21h30' : rec < 50 ? '22h00' : rec < 67 ? '22h30' : '23h00';
  var caff = rec < 34 ? '13h00' : rec < 50 ? '13h30' : '14h00';
  var recEmoji = rec >= 67 ? '🟢' : rec >= 34 ? '🟡' : '🔴';
  var sleepEmoji = m.sleepPerf >= 80 ? '🟢' : m.sleepPerf >= 60 ? '🟡' : '🔴';
  var hrvEmoji = hrv >= 70 ? '🟢' : hrv >= 50 ? '🟡' : '🔴';
  var alcool = rec < 50 ? '🚫 Éviter absolument — aggrave le HRV de 8-12 points' : '⚠️ Avec modération si possible';

  return '*Iris ✦*\n\nBonjour ' + userName + ' ! Ton recap Vitae est prêt 👋\n\n━━━━━━━━━━━━━━━\n🌙 *TA NUIT*\n━━━━━━━━━━━━━━━\nRécupération : ' + rec + '% ' + recEmoji + '\nSommeil : ' + m.sleepPerf + '% (' + m.sleepHours + 'h) ' + sleepEmoji + '\nHRV : ' + hrv + 'ms ' + hrvEmoji + '\nFC repos : ' + m.rhr + ' bpm\nStrain hier : ' + m.strain + '\n\n━━━━━━━━━━━━━━━\n📊 *ÉTAT DU JOUR*\n━━━━━━━━━━━━━━━\nMode : ' + meals.modeLabel + '\n' + meals.modeContext + '\n\n━━━━━━━━━━━━━━━\n🍽️ *ALIMENTATION*\n━━━━━━━━━━━━━━━\n' + foodIntro + '\n\n🌅 *Petit-déjeuner*\n' + meals.breakfast.name + '\n' + meals.breakfast.detail + '\n→ ' + meals.breakfast.macros + '\n' + meals.breakfast.why + '\n\n☀️ *Déjeuner*\n' + meals.lunch.name + '\n' + meals.lunch.detail + '\n→ ' + meals.lunch.macros + '\n' + meals.lunch.why + '\n\n⚡ *Snack (16h)*\n' + meals.snack.name + '\n' + meals.snack.detail + '\n→ ' + meals.snack.macros + '\n' + meals.snack.why + '\n\n🌙 *Dîner*\n' + meals.dinner.name + '\n' + meals.dinner.detail + '\n→ ' + meals.dinner.macros + '\n' + meals.dinner.why + '\n\n💧 Hydratation : ' + meals.hydration + '\n\n━━━━━━━━━━━━━━━\n💪 *SPORT*\n━━━━━━━━━━━━━━━\n⏱ Durée : ' + sport.duree + '\n🏋️ Type : ' + sport.type + '\n❤️ Intensité : ' + sport.intensite + '\n🚶 Pas cible : ' + sport.pas + '\n' + sport.why + '\n\n━━━━━━━━━━━━━━━\n😴 *RÉCUPÉRATION*\n━━━━━━━━━━━━━━━\nSieste : ' + sieste + '\n☕ Caféine : Stop à ' + caff + '\n🌙 Coucher recommandé : ' + bed + '\n🍷 Alcool : ' + alcool + '\n\n━━━━━━━━━━━━━━━\n_Iris · Powered by Vitae & WHOOP_';
}

  // Security disabled for testing

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

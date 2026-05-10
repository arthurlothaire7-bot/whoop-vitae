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

function meal(label, name, ingredients, macros, why, alternatives) {
  return '*' + label + '* — ' + name + '\n' + ingredients + '\n→ ' + macros + '\nPourquoi : ' + why + '\nAlternatives : ' + alternatives;
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
    mL = '⚡ Performance';
    fW = 'Ton score de ' + rec + '% indique que ton corps est pleinement recupere. C\'est le bon jour pour pousser fort. Priorite aux glucides et aux proteines pour alimenter l\'effort.';
    bf = meal('Breakfast', 'Power Oat Bowl',
      'Avoine · Whey · Banane · Miel',
      '38g P · 82g G · 558 kcal',
      'Ton corps est pret a encaisser un effort intense. L\'avoine te donne de l\'energie stable sur 3-4h sans crash. La whey active la construction musculaire des le reveil.',
      'Granola + yaourt grec · Pain complet + oeufs · Smoothie banane + amandes');
    lu = meal('Lunch', 'Bowl Poulet & Riz complet',
      'Poulet · Riz brun · Brocolis · Huile olive',
      '45g P · 68g G · 580 kcal',
      'Apres l\'effort, tes muscles ont besoin de proteines pour se reconstruire et de glucides pour recharger. Le riz brun evite le pic de glycemie qui provoquerait une fatigue apres-midi.',
      'Saumon + riz · Thon + pates · Oeufs + patate douce');
    sn = meal('En-cas', 'Shake pre-seance',
      'Banane · Whey · Dattes · Lait',
      '28g P · 48g G · 340 kcal',
      'A prendre 30 min avant ton entrainement. Le sucre rapide de la banane te donne de l\'energie immediatement disponible. La whey prepare tes muscles avant meme que tu commences.',
      'Banane + beurre amande · Pain + miel · Dattes + noix de cajou');
    di = meal('Diner', 'Steak & Patate douce',
      'Steak grass-fed · Patate douce · Asperges',
      '42g P · 52g G · 538 kcal',
      'Le soir apres un gros effort, ton corps a besoin de proteines de qualite pour reparer les fibres musculaires. La patate douce recharge les reserves d\'energie pour demain.',
      'Poulet + riz blanc · Saumon + quinoa · Oeufs + legumes rotis');
    hy = '3.2 L'; spT = 'HIIT ou Muscu lourde'; spD = '1h'; spP = '12 000 pas';
    spW = 'HRV ' + hrv + 'ms + score ' + rec + '% = ton systeme nerveux est pleinement recupere. C\'est exactement le signal pour pousser fort. Ces jours a ' + rec + '%+ sont rares, ne les gache pas.';

  } else if (mode === 'rec') {
    mL = '🔄 Recovery';
    fW = 'Ton HRV de ' + hrv + 'ms indique que ton corps est encore en train de recuperer. L\'inflammation est active. Chaque repas aujourd\'hui doit aider ton corps a reduire cette inflammation et restaurer ton systeme nerveux.';
    bf = meal('Breakfast', 'Smoothie Myrtilles & Curcuma',
      'Myrtilles · Curcuma · Yaourt grec · Poivre noir',
      '22g P · 52g G · 390 kcal',
      'Les myrtilles et le curcuma sont parmi les anti-inflammatoires les plus puissants. Ensemble ils reduisent directement les marqueurs d\'inflammation qui font baisser ton HRV. Le poivre noir est obligatoire : il multiplie l\'effet du curcuma par 20.',
      'Porridge + fruits rouges · Yaourt + granola · Oeufs + epinards');
    lu = meal('Lunch', 'Bowl Saumon & Quinoa',
      'Saumon sauvage · Quinoa · Concombre · Citron',
      '42g P · 45g G · 510 kcal',
      'Le saumon sauvage est riche en omega-3, des acides gras qui agissent directement sur l\'inflammation responsable de ton HRV bas. C\'est le repas le plus important de ta journee. Effet visible en 24-48h.',
      'Sardines + riz · Maquereau + patate douce · Thon + salade');
    sn = meal('En-cas', 'Amandes & Cerises acidulees',
      'Amandes · Cerises sechees · Chocolat 85%',
      '8g P · 28g G · 280 kcal',
      'Les amandes apportent du magnesium qui aide ton systeme nerveux a se calmer. Les cerises acidulees contiennent des precurseurs de melatonine pour preparer un bon sommeil ce soir. A prendre vers 16h.',
      'Noix + fruits secs · Yaourt + miel · Banane + beurre amande');
    di = meal('Diner', 'Bouillon Poulet Curcuma',
      'Poulet · Bouillon d\'os · Gingembre · Kale',
      '35g P · 22g G · 340 kcal',
      'Un repas leger le soir permet a ton corps de consacrer toute son energie a la recuperation pendant la nuit plutot qu\'a la digestion. Le gingembre et le curcuma continuent leur action anti-inflammatoire pendant ton sommeil.',
      'Poisson blanc vapeur · Soupe legumes + poulet · Omelette + salade');
    hy = '2.6 L'; spT = str > 12 ? 'Yoga ou Mobilite' : 'Muscu legere ou Zone 2'; spD = '45 min'; spP = '10 000 pas';
    spW = 'Avec un HRV de ' + hrv + 'ms, un entrainement intense aujourd\'hui augmenterait le cortisol et aggraverait ton score demain. Une seance moderee maintient ta progression sans surcharger ton systeme nerveux.';

  } else {
    mL = '🧘 Repos total';
    fW = 'Ton score de ' + rec + '% est en zone rouge. Ton corps est en mode urgence recuperation. Chaque calorie que tu lui donnes doit aller a la reparation, pas a la digestion. Repas legers et faciles a digerer toute la journee.';
    bf = meal('Breakfast', 'Toast Banane & Beurre amande',
      'Pain complet · Banane · Beurre amande · Miel',
      '10g P · 58g G · 380 kcal',
      'Quand le corps est epuise, meme digerer demande de l\'energie. Ce petit-dejeuner simple se digere facilement et apporte du potassium pour reequilibrer tes electrolytes sans stresser ton systeme digestif.',
      'Bol de cereales + lait · Yaourt + fruits · Banane + fruits secs');
    lu = meal('Lunch', 'Sardines & Avocat',
      'Sardines · Avocat · Salade verte · Citron',
      '28g P · 18g G · 480 kcal',
      'Les sardines et l\'avocat forment le duo le plus riche en omega-3 et en acides gras anti-inflammatoires. Ils agissent directement sur l\'inflammation qui maintient ton score bas.',
      'Saumon + salade · Maquereau + avocat · Oeufs + legumes');
    sn = meal('En-cas', 'Jus cerises & Amandes',
      '30ml concentre cerises · Amandes · A 15h',
      '6g P · 32g G · 240 kcal',
      'Pris a 15h, ce snack demarre la preparation de ton sommeil 6-7h a l\'avance. La melatonine naturelle des cerises et le magnesium des amandes preparent ton corps a une nuit profonde et reparatrice.',
      'Fruits rouges + yaourt · Banane + noix · Dattes + amandes');
    di = meal('Diner', 'Riz blanc & Saumon vapeur',
      'Riz blanc · Saumon · Legumes vapeur',
      '38g P · 45g G · 460 kcal',
      'Le riz blanc se digere en 1h contre 3h pour le riz complet. Ton corps peut ainsi consacrer toute son energie a la recuperation pendant la nuit. Diner avant 19h30 et rien apres 20h.',
      'Poulet + riz blanc · Poisson blanc + legumes · Soupe + pain');
    hy = '3.0 L'; spT = 'Marche douce'; spD = 'Repos complet'; spP = '5 000 pas';
    spW = 'A ' + rec + '% de recuperation, tout entrainement today retarderait ta remontee de 24 a 48h. Ton seul objectif : recupurer. Une courte marche suffit pour maintenir la circulation sanguine.';
  }

  // Build final message — split into 2 parts to stay under 1600 chars each
  var part1 = '*Iris ✦*\n\nBonjour ' + userName + ' ! 👋\n\n';
  part1 += '━━━━━━━━━━━━━━━\n🌙 *NUIT*\n━━━━━━━━━━━━━━━\n';
  part1 += 'Recup : ' + rec + '% ' + rE + '\n';
  part1 += 'Sommeil : ' + m.sleepPerf + '% (' + m.sleepHours + 'h) ' + sE + '\n';
  part1 += 'HRV : ' + hrv + 'ms ' + hE + ' · FC : ' + m.rhr + 'bpm\n\n';
  part1 += '━━━━━━━━━━━━━━━\n📊 *' + mL + '*\n━━━━━━━━━━━━━━━\n' + fW + '\n\n';
  part1 += '━━━━━━━━━━━━━━━\n🍽️ *REPAS*\n━━━━━━━━━━━━━━━\n';
  part1 += bf + '\n\n' + lu;

  var part2 = sn + '\n\n' + di + '\n\n💧 ' + hy + '\n\n';
  part2 += '━━━━━━━━━━━━━━━\n💪 *SPORT*\n━━━━━━━━━━━━━━━\n';
  part2 += spD + ' · ' + spT + '\n🚶 ' + spP + '\n' + spW + '\n\n';
  part2 += '━━━━━━━━━━━━━━━\n😴 *RECUP*\n━━━━━━━━━━━━━━━\n';
  part2 += 'Sieste : ' + nap + '\nCafeine stop : ' + caff + '\nCoucher : ' + bed + '\nAlcool : ' + alc + '\n\n';
  part2 += '_Iris · Vitae & WHOOP_';

  return { part1, part2 };
}

module.exports = async (req, res) => {
  var userName = process.env.USER_NAME || 'Arthur';
  try {
    var metrics = await getWhoopMetrics();
    var messages = buildMessage(metrics, userName);
    var client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Send part 1
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.YOUR_WHATSAPP_NUMBER,
      body: messages.part1,
    });

    // Small delay then send part 2
    await new Promise(resolve => setTimeout(resolve, 1000));

    var result = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.YOUR_WHATSAPP_NUMBER,
      body: messages.part2,
    });

    console.log('[Iris] Sent 2 messages — SID: ' + result.sid);
    return res.status(200).json({ success: true, recovery: metrics.recoveryScore, messages: 2 });
  } catch (err) {
    console.error('[Iris] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

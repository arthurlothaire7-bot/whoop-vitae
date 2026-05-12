// ── IRIS MEAL BANK ─────────────────────────────────────────
// 84 repas basés sur les études scientifiques :
// - Dai et al. (régime méditerranéen → HRV +10-58%)
// - Wilson et al. (fibres → sommeil profond, sucres → arousals)
// - Reginato et al. (fruits → HRV direct)
// - Christensen / Mozaffarian (oméga-3 → RMSSD)
// - Lozano et al. (sucres raffinés → dégradation HRV)
//
// Chaque repas contient :
// - name, ingredients, macros (P/G/F/kcal)
// - why : explication cause-effet basée sur l'étude
// - alt : 3 alternatives rapides

const MEALS = {

  // ════════════════════════════════════════════════════════
  // ⚡ PERFORMANCE (recovery ≥ 67%)
  // Priorité : maintenir terrain anti-inflammatoire + fuel effort
  // ════════════════════════════════════════════════════════
  performance: {
    breakfast: [
      {
        name: 'Power Oat Bowl',
        ingredients: 'Avoine · Whey protein · Banane · Miel · Lait d\'amande',
        macros: '38g P · 82g G · 12g F · 558 kcal',
        why: 'Ton score de récupération élevé indique des réserves de glycogène restaurées. L\'avoine fournit des fibres solubles (bêta-glucane) qui stabilisent la glycémie sur 3-4h sans crash — clé pour maintenir le HRV stable en journée selon Wilson et al. La whey active la synthèse musculaire dès le réveil.',
        alt: 'Granola maison + yaourt grec · Pain complet + oeufs brouillés + avocat · Bol acai + fruits rouges'
      },
      {
        name: 'Greek Yogurt Parfait',
        ingredients: 'Yaourt grec 0% · Myrtilles · Granola avoine · Graines de chia · Miel',
        macros: '28g P · 68g G · 8g F · 460 kcal',
        why: 'Les myrtilles apportent des anthocyanines — Reginato et al. montrent une association directe entre consommation de fruits et amélioration du HRV. Le yaourt grec fournit des probiotiques qui soutiennent le microbiote intestinal, lié à la qualité du sommeil profond (Wilson et al.).',
        alt: 'Kéfir + fruits rouges · Fromage blanc + framboises + graines · Smoothie banane + protéine'
      },
      {
        name: 'Eggs Benedict revisité',
        ingredients: 'Oeufs pochés · Pain de seigle · Saumon fumé · Avocat · Câpres',
        macros: '35g P · 42g G · 22g F · 510 kcal',
        why: 'Le saumon fumé apporte EPA/DHA dès le matin — Mozaffarian et al. montrent que les oméga-3 améliorent le tonus vagal et le RMSSD. Le pain de seigle est riche en fibres solubles qui favorisent le sommeil profond selon Wilson et al.',
        alt: 'Omelette saumon + pain complet · Toast avocat + oeufs · Wrap oeufs + légumes'
      },
      {
        name: 'Overnight Oats Proteines',
        ingredients: 'Avoine · Lait entier · Protéine vanille · Pomme · Cannelle · Noix',
        macros: '32g P · 74g G · 14g F · 540 kcal',
        why: 'La préparation nocturne rend l\'amidon partiellement résistant, baissant l\'index glycémique. Moins de pics glycémiques = moins d\'activation sympathique nocturne = HRV plus stable le matin selon Lozano et al. Les noix apportent du magnésium qui active les récepteurs GABA.',
        alt: 'Muesli + lait + fruits · Porridge quinoa + lait végétal · Bowl sarrasin + fruits secs'
      },
      {
        name: 'Smoothie Bowl Performance',
        ingredients: 'Banane congelée · Protéine chocolat · Beurre amande · Graines chanvre · Fruits rouges',
        macros: '35g P · 78g G · 16g F · 590 kcal',
        why: 'La banane + protéine immédiatement après le réveil reconstitue les réserves de glycogène hépatique qui chutent pendant le jeûne nocturne. Les fruits rouges apportent des polyphénols anti-inflammatoires — Dai et al. associent cette combinaison à un HRV plus élevé sur 24h.',
        alt: 'Shake banane + whey + beurre amande · Acai bowl + protéine · Smoothie mangue + vanille'
      },
      {
        name: 'Toast Avocat & Oeufs',
        ingredients: 'Pain de seigle · Avocat · 3 oeufs brouillés · Tomates cerises · Graines de courge',
        macros: '30g P · 48g G · 24g F · 520 kcal',
        why: 'L\'avocat est riche en acide oléique (graisses monoinsaturées) — composante centrale du régime méditerranéen que Dai et al. associent à +10-58% de HRV. Les graines de courge apportent 76mg de magnésium pour soutenir le système nerveux parasympathique.',
        alt: 'Pain complet + ricotta + saumon · Toast beurre amande + banane · Wraps oeufs + légumes'
      },
      {
        name: 'Pancakes Protéinés',
        ingredients: 'Flocons avoine · Oeufs · Banane · Protéine · Myrtilles · Yaourt grec',
        macros: '36g P · 72g G · 10g F · 520 kcal',
        why: 'Les flocons d\'avoine apportent des bêta-glucanes — fibres solubles associées à plus de sommeil profond (Wilson et al.). La banane augmente le ratio tryptophane/LNAA, favorisant la synthèse de sérotonine et mélatonine pour la nuit suivante.',
        alt: 'Crêpes sarrasin + protéine · Gaufres avoine + fruits · French toast pain complet + oeufs'
      }
    ],
    lunch: [
      {
        name: 'Bowl Poulet & Riz Complet',
        ingredients: 'Blanc de poulet grillé · Riz brun · Brocolis · Edamame · Huile olive · Sésame',
        macros: '48g P · 68g G · 14g F · 590 kcal',
        why: 'Le riz brun fournit des fibres qui rechargent le glycogène sans pic insulinique. Le brocolis apporte du sulforaphane — un puissant anti-inflammatoire naturel qui réduit les cytokines pro-inflammatoires impliquées dans la baisse du HRV selon Dai et al.',
        alt: 'Poulet + quinoa + légumes verts · Dinde + patate douce + haricots · Tofu + riz + brocolis'
      },
      {
        name: 'Buddha Bowl Méditerranéen',
        ingredients: 'Thon en boîte · Quinoa · Pois chiches · Concombre · Tomates · Olives · Huile olive',
        macros: '44g P · 62g G · 18g F · 570 kcal',
        why: 'Cette combinaison reproduit les piliers du régime méditerranéen étudié par Dai et al. — légumineuses, poisson, huile olive, légumes colorés. Ces composants agissent en synergie pour augmenter le tonus parasympathique mesuré par le SDNN et le rMSSD.',
        alt: 'Bowl saumon + riz + avocat · Salade grecque + poulet · Wrap thon + légumes + houmous'
      },
      {
        name: 'Pasta Saumon & Épinards',
        ingredients: 'Pâtes complètes · Saumon · Épinards · Ail · Huile olive · Citron · Parmesan',
        macros: '42g P · 72g G · 16g F · 600 kcal',
        why: 'Les épinards sont riches en nitrates naturels qui améliorent la fonction vasculaire et le débit sanguin — Dai et al. montrent que les légumes verts feuillus sont associés à un HRV plus élevé. L\'EPA/DHA du saumon réduit l\'inflammation systémique liée à ton effort d\'aujourd\'hui.',
        alt: 'Pâtes poulet + courgettes · Riz complet + thon + légumes · Quinoa + légumes verts + oeuf'
      },
      {
        name: 'Wrap Poulet & Légumes',
        ingredients: 'Tortilla blé complet · Blanc de poulet · Avocat · Salade · Tomates · Yaourt grec',
        macros: '40g P · 58g G · 18g F · 550 kcal',
        why: 'Les protéines maigres à chaque repas maintiennent la satiété et la synthèse musculaire entre les séances. L\'avocat fournit des acides gras monoinsaturés qui soutiennent la balance sympathovagale selon le modèle de Dai et al.',
        alt: 'Wrap thon + légumes · Pita houmous + poulet · Sandwich seigle + saumon + avocat'
      },
      {
        name: 'Stir Fry Boeuf & Légumes',
        ingredients: 'Boeuf maigre · Riz brun · Brocolis · Poivrons · Sauce soja légère · Gingembre · Ail',
        macros: '46g P · 64g G · 12g F · 548 kcal',
        why: 'Le boeuf maigre apporte de la créatine naturelle et du zinc — deux cofacteurs de la récupération musculaire. Le gingembre est un anti-inflammatoire direct sur les cytokines IL-6 impliquées dans la baisse du HRV selon Lozano et al.',
        alt: 'Poulet sauté + légumes + riz · Crevettes + quinoa + légumes · Tofu + légumes + nouilles'
      },
      {
        name: 'Salade Nicoise Revisitée',
        ingredients: 'Thon frais · Oeuf · Haricots verts · Pommes de terre · Olives · Huile olive · Citron',
        macros: '38g P · 52g G · 20g F · 540 kcal',
        why: 'La pomme de terre cuite et refroidie forme de l\'amidon résistant — meilleur pour le microbiote que l\'amidon classique. Un microbiote diversifié est associé à une meilleure efficacité du sommeil selon Wilson et al., et indirectement à un HRV plus élevé.',
        alt: 'Salade César + poulet · Bowl quinoa + légumes rôtis · Salade lentilles + feta + légumes'
      },
      {
        name: 'Burger Maison Healthy',
        ingredients: 'Pain complet · Steak haché 5% · Avocat · Tomate · Salade · Moutarde · Patate douce rôtie',
        macros: '45g P · 70g G · 18g F · 610 kcal',
        why: 'La patate douce est riche en bêta-carotène et en fibres — son index glycémique modéré recharge le glycogène sans activer la voie sympathique. O\'Connor et al. montrent que la viande maigre dans un contexte méditerranéen améliore le WASO (moins de réveils nocturnes).',
        alt: 'Sandwich poulet + légumes · Wrap boeuf + salade · Bowl steak + légumes + riz'
      }
    ],
    snack: [
      {
        name: 'Shake Pré-Séance',
        ingredients: 'Banane · Whey vanille · Dattes Medjool · Lait entier · Flocons avoine',
        macros: '30g P · 52g G · 6g F · 380 kcal',
        why: 'À prendre 30 min avant l\'effort. Les dattes + banane créent un pic glycémique contrôlé qui maximise l\'énergie disponible pendant l\'échauffement. La whey atteint les muscles avant la fin du warm-up pour protéger les fibres musculaires.',
        alt: 'Banane + beurre amande · Pain de seigle + miel + fromage blanc · Dattes + noix de cajou'
      },
      {
        name: 'Bowl Fruits Rouges & Noix',
        ingredients: 'Fraises · Myrtilles · Framboises · Amandes · Noix · Miel',
        macros: '8g P · 48g G · 18g F · 380 kcal',
        why: 'Reginato et al. — étude sur 121 patients avec monitoring Holter 24h — montrent que la consommation de fruits dans les 24h est directement associée à un HRV plus élevé (p=0.044). Les noix apportent des oméga-3 végétaux (ALA) qui soutiennent la fonction autonome cardiaque.',
        alt: 'Smoothie fruits rouges + graines · Yaourt + fruits frais · Compote sans sucre + amandes'
      },
      {
        name: 'Rice Cake & Beurre Amande',
        ingredients: 'Galettes de riz complet · Beurre amande · Banane · Miel',
        macros: '10g P · 58g G · 12g F · 370 kcal',
        why: 'Snack léger à index glycémique modéré, idéal 1h avant une séance cardio. Les galettes de riz fournissent des glucides rapides, le beurre amande ralentit l\'absorption pour une énergie stable. Le magnésium des amandes soutient la contraction musculaire.',
        alt: 'Crackers seigle + fromage blanc · Pain d\'épices + beurre · Barres avoine maison'
      },
      {
        name: 'Mix Énergétique Trail',
        ingredients: 'Amandes · Noix de cajou · Raisins secs · Pépites chocolat noir 70% · Graines de courge',
        macros: '12g P · 42g G · 22g F · 400 kcal',
        why: 'La combinaison noix + fruits secs fournit de l\'énergie prolongée. Le chocolat noir 70% apporte des flavonoïdes qui améliorent la fonction endothéliale et la vasodilatation — mécanisme lié à la baisse de la FC repos selon Dai et al.',
        alt: 'Barres de céréales maison · Dattes + noix · Fruits secs + amandes'
      },
      {
        name: 'Fromage Blanc & Fruits',
        ingredients: 'Fromage blanc 0% · Mangue · Kiwi · Graines chia · Granola',
        macros: '22g P · 54g G · 6g F · 350 kcal',
        why: 'Le kiwi est riche en vitamine C et en sérotonine naturelle — une étude montre que 2 kiwis avant le coucher améliorent la qualité du sommeil de 13%. Le fromage blanc apporte du tryptophane, précurseur de la mélatonine.',
        alt: 'Yaourt + kiwi · Cottage cheese + fruits · Skyr + mangue + chia'
      },
      {
        name: 'Houmous & Légumes Croquants',
        ingredients: 'Houmous maison · Carottes · Concombre · Poivrons · Pain pita complet',
        macros: '14g P · 46g G · 14g F · 360 kcal',
        why: 'Les pois chiches de l\'houmous sont riches en fibres et en protéines végétales — Dai et al. incluent les légumineuses comme composante essentielle du régime méditerranéen associé à +58% de HRV dans le quartile le plus élevé.',
        alt: 'Tzatziki + pain pita · Baba ganoush + légumes · Lentilles + crackers'
      },
      {
        name: 'Barres Protéinées Maison',
        ingredients: 'Avoine · Beurre amande · Miel · Protéine chocolat · Cranberries · Graines lin',
        macros: '24g P · 50g G · 14g F · 420 kcal',
        why: 'Les graines de lin sont parmi les sources les plus concentrées d\'ALA (oméga-3 végétal). Christensen et al. montrent que les oméga-3 végétaux améliorent le SDNN — marqueur de la variabilité globale du système nerveux autonome.',
        alt: 'Barre avoine + fruits secs · Energy balls avoine + miel · Muffins protéinés maison'
      }
    ],
    dinner: [
      {
        name: 'Steak & Patate Douce',
        ingredients: 'Steak grass-fed 180g · Patate douce · Asperges · Beurre · Ail · Romarin',
        macros: '45g P · 52g G · 16g F · 540 kcal',
        why: 'Le boeuf grass-fed contient plus d\'oméga-3 et de CLA que le boeuf nourri aux céréales. La patate douce recharge le glycogène de façon optimale 4-6h après l\'effort — exactement au moment où les muscles sont les plus réceptifs à la resynthèse.',
        alt: 'Poulet + patate douce + légumes · Saumon + riz + asperges · Dinde + légumes rôtis'
      },
      {
        name: 'Saumon Grillé & Riz Basmati',
        ingredients: 'Saumon sauvage · Riz basmati · Épinards · Citron · Aneth · Huile olive',
        macros: '44g P · 58g G · 18g F · 570 kcal',
        why: 'Mozaffarian et al. — étude sur 2033 adultes américains — montrent que la consommation régulière de poisson gras est inversement associée à la FC de repos et améliore le SDNN. Le dîner est le meilleur moment pour les oméga-3 car ils agissent sur la récupération nocturne.',
        alt: 'Cabillaud + légumes + riz · Bar + quinoa · Thon frais + patate douce'
      },
      {
        name: 'Poulet Rôti & Légumes Méditerranéens',
        ingredients: 'Cuisse de poulet · Courgettes · Aubergines · Tomates · Olives · Herbes de Provence · Huile olive',
        macros: '42g P · 28g G · 22g F · 470 kcal',
        why: 'Ce repas reproduit fidèlement le profil du régime méditerranéen de l\'étude Dai et al. — légumes colorés, huile olive, protéine maigre. La faible teneur en glucides le soir favorise le sommeil profond selon Wilson et al.',
        alt: 'Poulet + ratatouille · Dinde + légumes rôtis · Lapin + légumes méditerranéens'
      },
      {
        name: 'Pâtes Complètes Bolognese Maison',
        ingredients: 'Pâtes blé complet · Boeuf haché 5% · Tomates concassées · Carotte · Céleri · Ail · Basilic',
        macros: '46g P · 74g G · 12g F · 590 kcal',
        why: 'Les pâtes complètes ont un index glycémique 40% plus bas que les pâtes blanches. Une glycémie stable le soir réduit les réveils nocturnes (Wilson et al.) et favorise le sommeil profond, directement lié à un HRV plus élevé le lendemain.',
        alt: 'Riz complet + sauce tomate + protéine · Quinoa + bolognese · Lentilles + tomates'
      },
      {
        name: 'Curry de Pois Chiches & Poulet',
        ingredients: 'Blanc de poulet · Pois chiches · Lait de coco léger · Épinards · Curcuma · Gingembre · Riz brun',
        macros: '44g P · 66g G · 14g F · 570 kcal',
        why: 'Le curcuma + poivre noir réduit les marqueurs d\'inflammation systémique (IL-6, CRP) — Dai et al. montrent que la réduction de l\'inflammation améliore directement le HRV. Le gingembre amplifie cet effet anti-inflammatoire.',
        alt: 'Curry lentilles · Dal + riz · Poulet tikka masala léger + riz'
      },
      {
        name: 'Filet de Cabillaud & Légumes Rôtis',
        ingredients: 'Cabillaud · Pommes de terre · Courgettes · Poivrons · Tomates · Herbes · Huile olive',
        macros: '38g P · 56g G · 12g F · 480 kcal',
        why: 'Le cabillaud est une protéine maigre riche en tryptophane — précurseur de la sérotonine et de la mélatonine. Wilson et al. montrent qu\'une alimentation riche en tryptophane améliore le ratio tryptophane/LNAA, favorisant l\'endormissement.',
        alt: 'Lieu noir + légumes · Merlu + pommes de terre · Dorade + légumes du soleil'
      },
      {
        name: 'Bowl Thaï Crevettes & Quinoa',
        ingredients: 'Crevettes · Quinoa · Concombre · Carotte · Mangue · Coriandre · Citron vert · Sauce poisson légère',
        macros: '36g P · 62g G · 8g F · 464 kcal',
        why: 'Les crevettes sont riches en taurine et en zinc — deux nutriments qui soutiennent la fonction du système nerveux autonome. La mangue apporte de la vitamine C qui favorise la synthèse de collagène et la récupération musculaire.',
        alt: 'Saumon + riz + mangue · Thon + quinoa + légumes · Poulet + noix cajou + riz'
      }
    ]
  },

  // ════════════════════════════════════════════════════════
  // 🔄 RECOVERY (recovery 34-66%)
  // Priorité : réduire inflammation → remonter HRV
  // ════════════════════════════════════════════════════════
  recovery: {
    breakfast: [
      {
        name: 'Smoothie Bowl Anti-Inflammatoire',
        ingredients: 'Myrtilles · Curcuma · Yaourt grec · Graines de chia · Poivre noir · Lait amande',
        macros: '22g P · 52g G · 10g F · 390 kcal',
        why: 'Ton HRV est sous ta baseline — signe d\'inflammation active. Les anthocyanines des myrtilles + curcumine ciblent directement les cytokines pro-inflammatoires (IL-6, TNF-α). Le poivre noir est obligatoire : la pipérine multiplie l\'absorption de curcumine par 20 (biodisponibilité x20).',
        alt: 'Bowl açaï + fruits rouges · Smoothie cerises + gingembre · Porridge myrtilles + lin'
      },
      {
        name: 'Porridge Cannelle & Pomme',
        ingredients: 'Flocons avoine · Pomme · Cannelle · Noix · Lait entier · Miel de manuka · Graines lin',
        macros: '18g P · 68g G · 14g F · 460 kcal',
        why: 'La cannelle réduit la glycémie post-prandiale de 10-29% — moins de pics glycémiques = moins d\'activation sympathique = HRV plus stable. Les graines de lin apportent de l\'ALA (oméga-3 végétal) associé à une amélioration du SDNN selon Christensen et al.',
        alt: 'Granola maison + yaourt · Muesli + kéfir · Avoine + fruits + noix'
      },
      {
        name: 'Oeufs Brouillés au Saumon',
        ingredients: 'Oeufs · Saumon fumé · Pain de seigle · Aneth · Épinards · Citron',
        macros: '30g P · 36g G · 18g F · 428 kcal',
        why: 'Le saumon fumé dès le matin fournit de l\'EPA/DHA qui réduit les cytokines inflammatoires responsables de ton HRV bas. Les épinards apportent des nitrates naturels qui améliorent la circulation sanguine et le tonus vagal selon Dai et al.',
        alt: 'Omelette légumes + toast · Oeufs pochés + avocat · Scrambled eggs + champignons'
      },
      {
        name: 'Tartines Avocat & Graines',
        ingredients: 'Pain complet · Avocat · Graines de courge · Tomates cerises · Citron · Sel marin · Flocons de piment',
        macros: '16g P · 48g G · 22g F · 450 kcal',
        why: 'L\'avocat est la source alimentaire la plus dense en acide oléique après l\'huile d\'olive — composante centrale du régime méditerranéen de Dai et al. Les graines de courge apportent 76mg de magnésium par 30g, activant les récepteurs GABA pour calmer le système nerveux sympathique.',
        alt: 'Toast houmous + légumes · Tartines tahini + banane · Pain complet + ricotta + tomates'
      },
      {
        name: 'Bol Quinoa & Fruits Rouges',
        ingredients: 'Quinoa cuit froid · Framboises · Myrtilles · Amandes · Miel · Lait de coco · Menthe',
        macros: '20g P · 62g G · 12g F · 428 kcal',
        why: 'Le quinoa est l\'une des rares sources végétales contenant les 9 acides aminés essentiels — important pour la synthèse de neurotransmetteurs liés au HRV. Les fruits rouges (Reginato et al., p=0.044) sont directement associés à une amélioration du HRV dans les 24h suivant la consommation.',
        alt: 'Bol sarrasin + fruits · Granola quinoa + baies · Porridge amarante + myrtilles'
      },
      {
        name: 'Kéfir Bowl & Noix',
        ingredients: 'Kéfir · Banane · Noix · Dattes · Graines de lin · Cannelle',
        macros: '18g P · 58g G · 16g F · 440 kcal',
        why: 'Le kéfir contient des probiotiques (Lactobacillus, Bifidobacterium) qui améliorent la diversité du microbiote. Wilson et al. montrent qu\'une haute diversité du microbiote est corrélée à une meilleure efficacité du sommeil — et un meilleur sommeil = HRV plus élevé le lendemain.',
        alt: 'Yaourt probiotique + fruits · Labneh + miel + noix · Fromage blanc + banane + lin'
      },
      {
        name: 'Pancakes Sarrasin & Baies',
        ingredients: 'Farine sarrasin · Oeufs · Lait · Myrtilles · Sirop d\'érable · Yaourt grec',
        macros: '24g P · 64g G · 10g F · 430 kcal',
        why: 'Le sarrasin est riche en rutine — un flavonoïde qui renforce les parois vasculaires et améliore la fonction cardiaque autonome. Associé aux myrtilles (anthocyanines), ce déjeuner cible simultanément l\'inflammation vasculaire et le système nerveux parasympathique.',
        alt: 'Galettes avoine + myrtilles · Omelette sucrée + baies · Waffles quinoa + fruits rouges'
      }
    ],
    lunch: [
      {
        name: 'Bowl Saumon & Quinoa',
        ingredients: 'Saumon sauvage · Quinoa · Concombre · Tomates cerises · Citron · Aneth · Huile olive',
        macros: '42g P · 46g G · 18g F · 510 kcal',
        why: 'C\'est le repas le plus important de ta journée. L\'EPA et DHA du saumon sauvage réduisent directement les cytokines pro-inflammatoires liées à ton HRV bas. Mozaffarian et al. montrent une amélioration du RMSSD et du SDNN en 2-4 semaines de consommation régulière. Effet visible sous 24-48h.',
        alt: 'Maquereau + riz · Sardines + salade · Thon frais + légumes + huile olive'
      },
      {
        name: 'Soupe Lentilles & Légumes',
        ingredients: 'Lentilles vertes · Carottes · Poireaux · Cumin · Curcuma · Bouillon légumes · Pain complet',
        macros: '28g P · 72g G · 6g F · 454 kcal',
        why: 'Les lentilles combinent fibres solubles et protéines végétales complètes. Les fibres nourrissent les bactéries productrices de butyrate — un acide gras à chaîne courte qui réduit l\'inflammation intestinale et soutient l\'axe intestin-cerveau, lié au HRV selon Wilson et al.',
        alt: 'Soupe pois cassés · Minestrone légumes · Velouté courgettes + pois chiches'
      },
      {
        name: 'Salade Sardines & Avocat',
        ingredients: 'Sardines à l\'huile d\'olive · Avocat · Salade mesclun · Câpres · Tomates · Citron · Moutarde',
        macros: '30g P · 20g G · 32g F · 488 kcal',
        why: 'Sardines + avocat = duo le plus concentré en EPA/DHA + acide oléique alimentaire. Christensen et al. — étude sur patients coronariens — montrent que cette combinaison améliore le tonus vagal et réduit la FC repos en 3 semaines. Agit directement sur l\'inflammation vasculaire.',
        alt: 'Maquereau + salade verte · Anchois + légumes + huile olive · Hareng + pommes de terre'
      },
      {
        name: 'Wrap Thon & Légumes',
        ingredients: 'Tortilla blé complet · Thon en boîte · Avocat · Tomates · Salade · Yaourt grec · Citron',
        macros: '36g P · 52g G · 16g F · 488 kcal',
        why: 'Le thon est riche en sélénium — un antioxydant puissant qui réduit le stress oxydatif cardiaque. La combinaison thon + avocat fournit EPA/DHA + acides gras monoinsaturés, synergie documentée par Dai et al. pour améliorer la fonction autonome cardiaque.',
        alt: 'Wrap saumon + avocat · Pita thon + légumes · Sandwich sardines + moutarde'
      },
      {
        name: 'Risotto Champignons & Épinards',
        ingredients: 'Riz arborio · Champignons · Épinards · Parmesan · Huile olive · Bouillon légumes · Ail',
        macros: '24g P · 68g G · 14g F · 490 kcal',
        why: 'Les champignons sont riches en vitamine D et en bêta-glucanes — des fibres immuno-modulatrices qui réduisent l\'inflammation chronique. La vitamine D est associée à un HRV plus élevé dans plusieurs études épidémiologiques, mécanisme impliquant le système nerveux parasympathique.',
        alt: 'Risotto petits pois + menthe · Riz crémeux poireaux · Polenta + champignons'
      },
      {
        name: 'Buddha Bowl Anti-Inflammatoire',
        ingredients: 'Patate douce rôtie · Pois chiches épicés · Quinoa · Chou kale · Tahini · Curcuma · Citron',
        macros: '26g P · 74g G · 16g F · 540 kcal',
        why: 'Le chou kale est l\'une des légumes les plus riches en vitamine K, C et en sulforaphane. Ces composés réduisent les marqueurs inflammatoires (CRP, IL-6) impliqués dans la baisse du HRV selon Lozano et al. Le tahini apporte du sésamine, un lignane aux propriétés anti-oxydantes.',
        alt: 'Bowl légumes rôtis + légumineuses · Salade kale + patate douce · Bowl betterave + pois chiches'
      },
      {
        name: 'Poulet Gingembre & Riz Jasmin',
        ingredients: 'Blanc de poulet · Riz jasmin · Brocolis · Bok choy · Gingembre frais · Sauce tamari · Sésame',
        macros: '44g P · 62g G · 10g F · 508 kcal',
        why: 'Le gingembre contient des gingérols — des molécules anti-inflammatoires qui inhibent les mêmes voies que les AINS mais sans effets secondaires. Associé au brocolis (sulforaphane), ce repas réduit l\'inflammation systémique qui maintient le HRV bas.',
        alt: 'Poulet citronnelle + riz · Dinde gingembre + légumes · Tofu gingembre + riz brun'
      }
    ],
    snack: [
      {
        name: 'Amandes & Cerises Acidulées',
        ingredients: 'Amandes · Cerises séchées acidulées · Chocolat noir 85% · Graines de courge',
        macros: '10g P · 28g G · 18g F · 308 kcal',
        why: 'Les amandes apportent 76mg de magnésium par 30g — ce minéral active les récepteurs GABA, le frein naturel de ton système nerveux sympathique. Les cerises acidulées contiennent de la mélatonine naturelle et des précurseurs de sérotonine. À prendre à 16h pour préparer la récupération nocturne.',
        alt: 'Noix + raisins secs + chocolat · Cajou + abricots secs · Mix graines + myrtilles séchées'
      },
      {
        name: 'Yaourt Grec & Fruits Rouges',
        ingredients: 'Yaourt grec entier · Framboises · Miel · Graines de lin moulues',
        macros: '18g P · 32g G · 8g F · 272 kcal',
        why: 'Le yaourt grec entier contient plus de tryptophane que le yaourt allégé — ce précurseur de la mélatonine est plus biodisponible avec les graisses. Les graines de lin moulues fournissent de l\'ALA et des lignanes qui réduisent l\'inflammation vasculaire selon Dai et al.',
        alt: 'Skyr + baies · Fromage blanc + fruits rouges · Kéfir + fraises + chia'
      },
      {
        name: 'Tartines Houmous & Légumes',
        ingredients: 'Pain seigle · Houmous maison · Concombre · Poivron rouge · Graines de sésame',
        macros: '14g P · 42g G · 12g F · 328 kcal',
        why: 'Les pois chiches de l\'houmous sont riches en tryptophane et en magnésium — deux nutriments clés pour la synthèse de sérotonine et mélatonine. Le tahini du houmous apporte des stérols végétaux qui réduisent les marqueurs inflammatoires impliqués dans le HRV bas.',
        alt: 'Crackers + tzatziki · Pain pita + baba ganoush · Toast + labneh + tomates'
      },
      {
        name: 'Shake Récupération',
        ingredients: 'Lait entier · Banane · Cacao naturel · Miel · Graines chia',
        macros: '22g P · 54g G · 8g F · 370 kcal',
        why: 'Le cacao naturel est riche en flavanols qui améliorent la fonction endothéliale et réduisent la pression artérielle — deux facteurs directement liés au HRV selon Lozano et al. Le lait entier apporte du tryptophane et du calcium pour la fonction nerveuse.',
        alt: 'Lait + cacao + banane · Shake chocolat + amande · Lait chaud + miel + cannelle'
      },
      {
        name: 'Pomme & Beurre Amande',
        ingredients: 'Pomme · Beurre amande naturel · Cannelle · Noix',
        macros: '8g P · 38g G · 16g F · 320 kcal',
        why: 'La pomme contient de la quercétine — un flavonoïde anti-inflammatoire et antioxydant. Reginato et al. montrent que la consommation de fruits est l\'un des seuls facteurs alimentaires indépendamment associés au HRV après ajustement pour tous les confondeurs. Simple et efficace.',
        alt: 'Poire + tahini · Banane + beurre cajou · Nectarine + amandes'
      },
      {
        name: 'Jus Cerises & Noix',
        ingredients: 'Jus cerises acidulées 30ml concentré · Noix · Figues séchées',
        macros: '6g P · 44g G · 14g F · 318 kcal',
        why: 'Le concentré de cerises acidulées contient jusqu\'à 17µg de mélatonine par 100ml. Des études RCT montrent une réduction du temps d\'endormissement de 7 min et +25min de sommeil total. À prendre à 16h pour maximiser l\'effet — le sommeil profond ce soir influence directement le HRV demain matin.',
        alt: 'Jus grenade + amandes · Smoothie cerises + gingembre · Tisane camomille + miel + noix'
      },
      {
        name: 'Edamame & Graines',
        ingredients: 'Edamame · Graines de tournesol · Graines de courge · Sel marin',
        macros: '16g P · 20g G · 14g F · 266 kcal',
        why: 'L\'edamame est l\'une des sources végétales les plus riches en protéines complètes et en isoflavones. Les isoflavones ont des effets anti-inflammatoires documentés sur la fonction vasculaire. La combinaison courge + tournesol fournit 120mg de magnésium — levier direct sur le système nerveux parasympathique.',
        alt: 'Pois chiches rôtis · Fèves + huile olive · Soja toasté + graines'
      }
    ],
    dinner: [
      {
        name: 'Bouillon Poulet Curcuma',
        ingredients: 'Blanc de poulet · Bouillon d\'os · Gingembre frais · Curcuma · Poivre noir · Kale · Nouilles riz',
        macros: '36g P · 26g G · 10g F · 338 kcal',
        why: 'Repas léger intentionnellement — ton corps dépense moins d\'énergie à digérer et plus à récupérer. Le collagène du bouillon d\'os reconstruit les tissus conjonctifs pendant le sommeil. Gingembre + curcuma agissent en anti-inflammatoires pendant toute la nuit au moment où le corps effectue sa récupération profonde.',
        alt: 'Soupe miso + tofu · Bouillon légumes + poulet · Velouté légumes léger + protéine'
      },
      {
        name: 'Saumon en Papillote & Légumes',
        ingredients: 'Saumon · Courgettes · Tomates cerises · Citron · Aneth · Huile olive · Pommes de terre',
        macros: '40g P · 38g G · 18g F · 478 kcal',
        why: 'La cuisson en papillote préserve 100% des oméga-3 contrairement à la poêle (perte de 20-30%). Le saumon agit pendant le sommeil — ses oméga-3 réduisent l\'inflammation nocturne et améliorent le RMSSD mesuré le lendemain matin selon Mozaffarian et al.',
        alt: 'Maquereau vapeur + légumes · Cabillaud papillote · Truite + légumes cuits'
      },
      {
        name: 'Poulet Citron & Herbes',
        ingredients: 'Blanc de poulet · Citron · Thym · Romarin · Légumes rôtis · Riz sauvage',
        macros: '42g P · 48g G · 12g F · 468 kcal',
        why: 'Le riz sauvage a un index glycémique de 45 — bien plus bas que le riz blanc (72). Une glycémie stable le soir réduit les arousals nocturnes de 15% selon Wilson et al. Moins de réveils = plus de sommeil profond = HRV plus élevé le lendemain.',
        alt: 'Dinde + herbes + légumes · Lapin + moutarde + légumes · Poulet provençal + légumes'
      },
      {
        name: 'Morue à la Provençale',
        ingredients: 'Morue · Tomates · Olives noires · Câpres · Ail · Huile olive · Pommes de terre · Basilic',
        macros: '38g P · 44g G · 14g F · 458 kcal',
        why: 'Les olives noires sont une source concentrée en hydroxytyrosol — un polyphénol avec une des plus fortes activités anti-inflammatoires connues. Dai et al. montrent que les composés phénoliques de l\'olive sont un mécanisme clé par lequel le régime méditerranéen améliore le HRV.',
        alt: 'Cabillaud + tapenade · Merlan + légumes provençaux · Dorade + tomates + olives'
      },
      {
        name: 'Omelette Aux Légumes & Fromage',
        ingredients: 'Oeufs · Épinards · Champignons · Poivrons · Feta · Pain complet · Salade verte',
        macros: '30g P · 36g G · 22g F · 462 kcal',
        why: 'Les oeufs sont l\'une des meilleures sources de choline — précurseur de l\'acétylcholine, le principal neurotransmetteur parasympathique. Une activité parasympathique plus élevée = HRV plus élevé. La feta apporte du calcium qui régule la contraction cardiaque.',
        alt: 'Frittata légumes · Omelette japonaise + légumes · Tortilla espagnole légère'
      },
      {
        name: 'Soupe Miso & Saumon',
        ingredients: 'Saumon · Soupe miso · Tofu soyeux · Wakamé · Riz · Oignons verts',
        macros: '36g P · 42g G · 12g F · 420 kcal',
        why: 'Le miso est un aliment fermenté riche en probiotiques — qui améliorent la diversité du microbiote intestinal, lié à la qualité du sommeil selon Wilson et al. Le wakamé apporte des fucoxanthines anti-inflammatoires. Repas léger = digestion rapide = meilleure qualité de sommeil.',
        alt: 'Soupe miso + tofu + légumes · Ramen léger + oeuf · Soupe asiatique + protéine'
      },
      {
        name: 'Tajine Poulet & Légumes',
        ingredients: 'Poulet · Courgettes · Carottes · Pois chiches · Cumin · Cannelle · Coriandre · Semoule complète',
        macros: '40g P · 56g G · 14g F · 506 kcal',
        why: 'La cannelle + cumin + coriandre forment un combo d\'épices anti-inflammatoires synergiques. Les pois chiches apportent fibres et tryptophane. La semoule complète fournit des glucides complexes qui favorisent le sommeil profond selon Wilson et al. — repas de récupération complet.',
        alt: 'Tajine agneau + légumes · Couscous poulet léger · Tajine poisson + légumes'
      }
    ]
  },

  // ════════════════════════════════════════════════════════
  // 🧘 REPOS (recovery ≤ 33%)
  // Priorité : urgence récupération + zéro stress digestif
  // ════════════════════════════════════════════════════════
  repos: {
    breakfast: [
      {
        name: 'Toast Banane & Beurre Amande',
        ingredients: 'Pain complet · Banane · Beurre amande naturel · Miel',
        macros: '12g P · 58g G · 14g F · 406 kcal',
        why: 'Quand le corps est en zone rouge, même digérer demande de l\'énergie. Ce déjeuner est volontairement simple — digestion rapide pour ne pas voler d\'énergie à la récupération. La banane apporte du potassium pour rééquilibrer les électrolytes perturbés par le stress physiologique.',
        alt: 'Bol de céréales complètes + lait · Yaourt + fruits + miel · Bouillie avoine + banane'
      },
      {
        name: 'Porridge Doux & Apaisant',
        ingredients: 'Flocons avoine fins · Lait entier · Banane écrasée · Miel · Cannelle · Vanille',
        macros: '16g P · 72g G · 10g F · 438 kcal',
        why: 'Les flocons fins sont plus faciles à digérer que les flocons épais — important quand le système digestif est sous stress. La banane + lait entier augmente le ratio tryptophane/LNAA, favorisant la sérotonine. Lozano et al. montrent que réduire le stress systémique accélère la remontée du HRV.',
        alt: 'Semoule de lait · Tapioca au lait · Crème de riz + fruits'
      },
      {
        name: 'Yaourt & Fruits Simples',
        ingredients: 'Yaourt grec entier · Banane · Miel · Graines de lin moulues',
        macros: '18g P · 52g G · 8g F · 354 kcal',
        why: 'Ultra-simple et facile à digérer. Le yaourt entier apporte du tryptophane biodisponible grâce à la matière grasse. Les graines de lin moulues fournissent de l\'ALA et des lignanes — Christensen et al. montrent que les oméga-3 végétaux améliorent les paramètres HRV même à court terme.',
        alt: 'Kéfir + banane · Fromage blanc + miel · Skyr + fruits mûrs'
      },
      {
        name: 'Pain d\'Épeautre & Miel',
        ingredients: 'Pain d\'épeautre · Miel de manuka · Beurre doux · Banane',
        macros: '10g P · 66g G · 10g F · 390 kcal',
        why: 'Le miel de manuka a des propriétés anti-inflammatoires et antibactériennes documentées. L\'épeautre est plus digeste que le blé moderne car ses gluten sont différemment structurés. Repas doux qui ne sollicite pas le système digestif, libérant plus d\'énergie pour la récupération autonome.',
        alt: 'Biscottes + miel · Brioche complète + confiture · Pain de mie complet + beurre'
      },
      {
        name: 'Compote Chaude & Amandes',
        ingredients: 'Pommes cuites · Cannelle · Amandes · Yaourt grec · Miel',
        macros: '14g P · 60g G · 12g F · 398 kcal',
        why: 'La pomme cuite est plus digestible que la pomme crue — la cuisson pré-digère les fibres. La pectine de pomme nourrit les bactéries intestinales bénéfiques qui produisent du butyrate anti-inflammatoire. Wilson et al. montrent le lien direct entre santé du microbiote et qualité du sommeil profond.',
        alt: 'Compote poires + fromage blanc · Fruits cuits + yaourt · Banane poêlée + miel'
      },
      {
        name: 'Smoothie Doux & Récupération',
        ingredients: 'Banane · Lait entier · Beurre amande · Datte · Cannelle · Glaçons',
        macros: '16g P · 62g G · 14g F · 430 kcal',
        why: 'Aucune mastication requise — le système digestif au minimum. La datte est riche en magnésium, potassium et B6 — ces trois nutriments sont essentiels au système nerveux parasympathique. Le lait entier apporte du tryptophane et du calcium pour la fonction nerveuse cardiaque.',
        alt: 'Smoothie mangue + lait · Shake banane + vanille · Lait + miel + banane mixée'
      },
      {
        name: 'Bol Riz au Lait',
        ingredients: 'Riz rond · Lait entier · Miel · Vanille · Cannelle · Raisins secs',
        macros: '12g P · 74g G · 8g F · 418 kcal',
        why: 'Le riz au lait est parmi les aliments les plus doux pour le système digestif. Afaghi et al. montrent que les glucides à index glycémique modéré à élevé le matin réduisent le temps d\'endormissement le soir via le mécanisme tryptophane → sérotonine → mélatonine. Le lait entier amplifie cet effet.',
        alt: 'Semoule au lait · Tapioca + lait + vanille · Gruau de maïs + lait'
      }
    ],
    lunch: [
      {
        name: 'Sardines & Avocat',
        ingredients: 'Sardines à l\'huile d\'olive · Avocat · Salade verte · Câpres · Citron · Pain seigle',
        macros: '30g P · 22g G · 32g F · 492 kcal',
        why: 'Sardines + avocat = duo le plus concentré en EPA/DHA + acide oléique disponible dans l\'alimentation courante. Christensen et al. montrent que cette combinaison agit directement sur l\'inflammation vasculaire responsable du RHR élevé et du HRV bas. C\'est le repas le plus important de ta journée.',
        alt: 'Maquereau + avocat · Saumon + salade verte · Harengs + pommes de terre cuites'
      },
      {
        name: 'Soupe de Légumes & Poulet',
        ingredients: 'Blanc de poulet · Carottes · Poireaux · Céleri · Bouillon maison · Vermicelles riz · Persil',
        macros: '32g P · 38g G · 6g F · 334 kcal',
        why: 'La soupe de poulet maison contient de la carnosine — un dipeptide qui réduit l\'inflammation des voies aériennes et améliore la récupération. Le liquide chaud améliore la circulation sanguine et réduit la viscosité sanguine, aidant le système cardiovasculaire à récupérer.',
        alt: 'Soupe légumes maison · Bouillon poulet + légumes · Velouté carottes + protéine'
      },
      {
        name: 'Riz Blanc & Saumon Vapeur',
        ingredients: 'Saumon · Riz blanc · Épinards vapeur · Sauce soja légère · Citron · Gingembre',
        macros: '40g P · 56g G · 14g F · 506 kcal',
        why: 'Riz blanc ce midi — il se digère en 1h contre 3h pour le riz brun. Ton corps économise cette énergie pour la récupération. Le saumon vapeur préserve tous ses oméga-3. Les épinards vapeur sont mieux tolérés que crus quand le système digestif est stressé.',
        alt: 'Cabillaud vapeur + riz blanc · Lieu noir + riz · Truite vapeur + légumes doux'
      },
      {
        name: 'Pâtes Blanches & Thon',
        ingredients: 'Pâtes blanches · Thon en boîte · Tomates cerises · Huile olive · Basilic · Câpres',
        macros: '36g P · 68g G · 12g F · 520 kcal',
        why: 'Pâtes blanches intentionnellement — digestion plus rapide et moins d\'énergie mobilisée. Le thon apporte de l\'EPA/DHA essentiel à la récupération. Ce repas recharge les réserves de glycogène musculaire pour demain sans surcharger le système digestif.',
        alt: 'Pâtes + saumon + citron · Riz + thon + légumes doux · Semoule + thon + tomates'
      },
      {
        name: 'Oeufs Brouillés & Légumes Doux',
        ingredients: 'Oeufs · Courgettes · Carottes cuites · Pain de mie complet · Beurre · Herbes fraîches',
        macros: '24g P · 42g G · 18g F · 422 kcal',
        why: 'Les légumes cuits sont plus faciles à digérer que les légumes crus — important en zone rouge. Les oeufs apportent de la choline, précurseur de l\'acétylcholine qui active directement le système parasympathique. Mécanisme direct sur la remontée du HRV.',
        alt: 'Omelette légumes cuits · Oeufs pochés + légumes vapeur · Scrambled eggs + patate douce'
      },
      {
        name: 'Houmous & Pain Pita Complet',
        ingredients: 'Houmous maison · Pain pita complet · Concombre · Carottes · Poivron rouge · Menthe',
        macros: '20g P · 62g G · 16g F · 470 kcal',
        why: 'Repas sans cuisson, digestion simple. Les pois chiches apportent du magnésium et du tryptophane. Les légumes crus coupés sont faciles à digérer. Le tahini de l\'houmous apporte des stérols végétaux anti-inflammatoires selon Dai et al.',
        alt: 'Houmous + crackers + légumes · Pita + tzatziki + légumes · Wrap légumes + houmous'
      },
      {
        name: 'Risotto Léger & Parmesan',
        ingredients: 'Riz arborio · Bouillon légumes · Parmesan · Courgettes · Pois · Huile olive · Basilic',
        macros: '22g P · 72g G · 14g F · 502 kcal',
        why: 'La texture crémeuse du risotto est particulièrement facile à digérer — quasi aucun effort masticatoire requis. Le parmesan apporte du calcium et du phosphore pour la conduction nerveuse cardiaque. L\'amidon du riz arborio cuit fournit une énergie stable sur 2-3h.',
        alt: 'Polenta crémeuse + légumes · Orzo + bouillon + légumes · Semoule légère + légumes'
      }
    ],
    snack: [
      {
        name: 'Jus Cerises Acidulées & Amandes',
        ingredients: '30ml concentré cerises acidulées · Amandes · À prendre à 15h impérativement',
        macros: '6g P · 32g G · 10g F · 238 kcal',
        why: 'Pris à 15h, ce snack démarre la préparation du sommeil 6-7h à l\'avance. Le concentré de cerises acidulées contient jusqu\'à 17µg de mélatonine par 100ml — l\'une des concentrations naturelles les plus élevées connues. Les amandes ajoutent 40mg de magnésium pour activer le GABA ce soir. Investissement direct pour demain.',
        alt: 'Tisane cerise + amandes · Smoothie cerises + lait · Jus grenade + noix'
      },
      {
        name: 'Banane & Beurre Amande',
        ingredients: 'Banane mûre · Beurre amande naturel · Cannelle',
        macros: '8g P · 46g G · 12g F · 316 kcal',
        why: 'La banane mûre a un index glycémique plus élevé que la verte — elle élève rapidement la glycémie, augmentant le ratio tryptophane/LNAA. Ce mécanisme direct (Afaghi et al.) favorise la synthèse de sérotonine et mélatonine. Simple, facile à digérer, efficace.',
        alt: 'Banane + tahini · Pomme + beurre amande · Datte + beurre cajou'
      },
      {
        name: 'Tisane & Miel',
        ingredients: 'Tisane camomille ou tilleul · Miel · Biscuit avoine complet · Quelques amandes',
        macros: '4g P · 38g G · 8g F · 238 kcal',
        why: 'La camomille contient de l\'apigénine qui se lie aux récepteurs GABA-A — mécanisme anxiolytique et sédatif naturel. Le miel pris avant le coucher maintient le glycogène hépatique pendant la nuit, évitant les microréveils liés à l\'hypoglycémie nocturne selon Wilson et al.',
        alt: 'Tisane valériane + miel · Lait chaud + miel · Tisane passiflore + biscuit'
      },
      {
        name: 'Compote & Graines',
        ingredients: 'Compote pomme sans sucre ajouté · Graines de courge · Cannelle · Noix',
        macros: '6g P · 34g G · 12g F · 264 kcal',
        why: 'La compote pomme sans sucre est facile à digérer et fournit de la pectine. Les graines de courge sont parmi les sources les plus concentrées en magnésium (78mg/30g) — activation directe du système nerveux parasympathique. Les noix apportent de la mélatonine naturelle.',
        alt: 'Compote poire + amandes · Purée de fruits + graines lin · Fruits cuits + noix'
      },
      {
        name: 'Kéfir & Miel',
        ingredients: 'Kéfir · Miel · Cannelle · Quelques noix',
        macros: '12g P · 28g G · 8g F · 228 kcal',
        why: 'Le kéfir est un des aliments fermentés les plus riches en probiotiques. Wilson et al. montrent qu\'une haute diversité du microbiote est associée à moins de réveils nocturnes et plus de sommeil profond. À ton stade de récupération, tout ce qui améliore la qualité du sommeil est prioritaire.',
        alt: 'Yaourt nature + miel · Lait fermenté + fruits · Skyr nature + miel'
      },
      {
        name: 'Dattes & Noix',
        ingredients: 'Dattes Medjool · Noix · Eau minérale',
        macros: '4g P · 42g G · 10g F · 266 kcal',
        why: 'Les dattes sont riches en tryptophane, magnésium et sérotonine naturelle. Une étude RCT montre que consommer des dattes avant le coucher améliore l\'endormissement de 15 minutes. En snack à 15-16h, elles préparent la voie de synthèse mélatonine pour ce soir. Les noix ajoutent de la mélatonine naturelle.',
        alt: 'Figues séchées + amandes · Abricots secs + noix · Pruneaux + graines'
      },
      {
        name: 'Pomme Cuite & Cannelle',
        ingredients: 'Pomme cuite au four · Cannelle · Miel · Fromage blanc',
        macros: '8g P · 48g G · 4g F · 258 kcal',
        why: 'La cuisson de la pomme rend ses fibres pectiques plus solubles et plus facilement fermentables par le microbiote. Le fromage blanc apporte du tryptophane biodisponible. La cannelle réduit la glycémie post-prandiale, évitant le pic insulinique qui perturbe le sommeil selon Lozano et al.',
        alt: 'Poire cuite + yaourt · Banane poêlée + miel · Pêche cuite + fromage blanc'
      }
    ],
    dinner: [
      {
        name: 'Riz Blanc, Saumon & Légumes Vapeur',
        ingredients: 'Riz blanc · Saumon vapeur · Courgettes vapeur · Carottes vapeur · Citron · Aneth',
        macros: '40g P · 52g G · 14g F · 490 kcal',
        why: 'Riz blanc ce soir — se digère en 1h contre 3h pour le riz brun. Ton corps économise cette énergie pour la récupération nocturne. Le saumon vapeur préserve tous ses oméga-3. Dîner avant 19h30 et rien après 20h — chaque heure de digestion pendant le sommeil réduit le REM selon Wilson et al.',
        alt: 'Cabillaud vapeur + riz blanc · Poulet vapeur + riz · Lieu vapeur + légumes doux'
      },
      {
        name: 'Soupe Poulet & Légumes Racines',
        ingredients: 'Blanc de poulet · Carottes · Panais · Pommes de terre · Bouillon maison · Persil · Pain complet',
        macros: '34g P · 54g G · 8g F · 422 kcal',
        why: 'La soupe chaude améliore la circulation sanguine périphérique et réduit la tension artérielle en soirée — favorable au HRV nocturne selon Lozano et al. Les légumes racines cuits sont parmi les aliments les plus faciles à digérer. Le bouillon maison apporte du collagène.',
        alt: 'Soupe légumes + poulet · Velouté potiron + tofu · Minestrone léger'
      },
      {
        name: 'Pâtes Blanches & Sauce Tomate Légère',
        ingredients: 'Pâtes blanches · Sauce tomate maison · Basilic · Huile olive · Parmesan léger',
        macros: '22g P · 74g G · 10g F · 470 kcal',
        why: 'Les tomates cuites contiennent plus de lycopène que les tomates crues — ce caroténoïde puissant réduit le stress oxydatif cardiaque. Les pâtes blanches rechargent le glycogène rapidement. À manger avant 19h30 pour laisser la digestion se terminer avant le sommeil profond.',
        alt: 'Riz + sauce tomate + protéine · Semoule + légumes sauce tomate · Polenta + tomates'
      },
      {
        name: 'Omelette Douce & Salade',
        ingredients: 'Oeufs · Courgettes cuites · Fromage de chèvre · Salade verte · Huile olive · Pain complet',
        macros: '26g P · 32g G · 22g F · 434 kcal',
        why: 'Repas léger en glucides le soir — favorise le sommeil profond selon Wilson et al. (plus de slow wave sleep avec moins de glucides le soir). Les oeufs apportent de la choline pour le système nerveux parasympathique. Le fromage de chèvre est plus digeste que le fromage de vache.',
        alt: 'Omelette légumes + salade · Frittata légère · Quiche légère + salade'
      },
      {
        name: 'Semoule & Poisson Blanc',
        ingredients: 'Semoule complète · Cabillaud · Carottes · Courgettes · Bouillon · Coriandre · Citron',
        macros: '36g P · 62g G · 6g F · 450 kcal',
        why: 'Le cabillaud est un poisson blanc très maigre, extrêmement facile à digérer — absorption en 2h maximum. La semoule complète fournit des glucides complexes qui maintiennent une glycémie stable toute la nuit, évitant les microréveils hypoglycémiques selon Wilson et al.',
        alt: 'Quinoa + poisson blanc · Riz + morue · Boulgour + légumes + protéine'
      },
      {
        name: 'Tofu Soyeux & Riz',
        ingredients: 'Tofu soyeux · Riz blanc · Édamame · Sauce tamari légère · Gingembre · Oignons verts',
        macros: '28g P · 58g G · 10g F · 434 kcal',
        why: 'Le tofu soyeux est digéré encore plus facilement que le tofu ferme. Les isoflavones du soja ont des effets légèrement oestrogéniques qui peuvent favoriser la qualité du sommeil. L\'édamame apporte du tryptophane et du magnésium pour la voie mélatonine.',
        alt: 'Tofu + légumes doux + riz · Tempeh léger + riz · Tofu vapeur + légumes'
      },
      {
        name: 'Velouté Butternut & Poulet',
        ingredients: 'Butternut · Blanc de poulet effiloché · Bouillon légumes · Noix de muscade · Pain de seigle · Crème légère',
        macros: '32g P · 58g G · 12g F · 474 kcal',
        why: 'Le butternut est riche en bêta-carotène et en potassium — ce dernier améliore la balance électrolytique et l\'activité parasympathique. La muscade contient du myristicine aux légers effets sédatifs naturels. Repas chaud et réconfortant qui active le système nerveux parasympathique.',
        alt: 'Velouté courgettes + poulet · Soupe potiron + tofu · Crème céleri + protéine'
      }
    ]
  }
}

// ── SÉLECTION DU REPAS DU JOUR ────────────────────────────
// Utilise la date comme seed pour varier chaque jour
// et éviter la même recommandation 2 jours consécutifs

function getDayMeals(recoveryScore) {
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)

  let mode
  if (recoveryScore >= 67) mode = 'performance'
  else if (recoveryScore >= 34) mode = 'recovery'
  else mode = 'repos'

  const bank = MEALS[mode]

  // Sélection différente pour chaque type de repas (décalage +0/+1/+2/+3)
  const breakfast = bank.breakfast[dayOfYear % bank.breakfast.length]
  const lunch     = bank.lunch[(dayOfYear + 1) % bank.lunch.length]
  const snack     = bank.snack[(dayOfYear + 2) % bank.snack.length]
  const dinner    = bank.dinner[(dayOfYear + 3) % bank.dinner.length]

  return { mode, breakfast, lunch, snack, dinner }
}

module.exports = { MEALS, getDayMeals }

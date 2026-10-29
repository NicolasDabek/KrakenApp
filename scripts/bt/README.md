# Backtests et réglage des stratégies (`scripts/bt`)

Outils hors appli pour comparer chaque stratégie de bot avant/après un changement de réglages.
Node 22 requis (`--experimental-strip-types`).

## 1. Récupérer les données

```bash
node scripts/bt/fetch-data.mjs
```

Télécharge des bougies publiques (API publique Binance, sans clé) : 8 paires, 1 h sur 365 jours
et 15 min sur 90 jours, date de fin fixe pour que les résultats soient reproductibles.
Les fichiers vont dans `scripts/bt/.data/` (ignoré par git, ne pas commiter).

## 2. Lancer le réglage

```bash
node --experimental-strip-types scripts/bt/tune.ts [--kinds=ema,rsi] [--rounds=2] [--check] [--force]
```

- Point de départ : `defaultParams(kind)` actuel (`src/lib/trading/bots/catalog.ts`).
- `--check` : rejoue seulement l'état actuel, sans chercher de candidats.
- Résultats locaux dans `scripts/bt/results/<kind>.json` (`before`, `after`, `kept`, `rejected`, `diff`, `perDataset`) : dossier ignoré par git, ne pas le commiter. Les réglages retenus vivent dans `TUNED_DEFAULTS` (`catalog.ts`).
- grid et dca sont exclus.

## 3. Règles d'acceptation

Les données sont séparées en une partie d'apprentissage (IS) et une partie de validation (OOS).

1. Les candidats sont classés sur le PnL IS, net de 0,4 % de frais.
2. Un candidat n'est gardé que si, en OOS, il bat la base sur la somme **et** sur la majorité des jeux de données.
3. La perte maximale (drawdown) OOS ne doit pas se dégrader sensiblement.
4. Le `diff` retenu est reporté à la main dans `TUNED_DEFAULTS` (catalog.ts). Il ne s'applique
   qu'aux **nouveaux** bots : les bots existants gardent leurs propres paramètres.

## Limites

L'échantillon est surtout baissier : les filtres réduisent les pertes en faisant moins de trades,
mais aucune stratégie ne devient rentable. Ce n'est pas un gain de performance garanti.

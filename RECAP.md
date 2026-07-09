# Récapitulatif de la session

Projet : **licenciementeco** — aider des collègues à comprendre le licenciement
économique et le CSP, puis estimer leurs droits.

## Demande initiale
Créer un support pour expliquer aux salariés le **licenciement économique** et surtout
le **CSP (Contrat de sécurisation professionnelle)**.

**Choix retenus :**
- Format : **page web visuelle** (Artifact).
- Public : **salariés** (comprendre leurs droits).
- Langue : **français**.

## Livrable 1 — Guide visuel
Page autonome `index.html` (responsive, thèmes clair/sombre), couvrant :
- Définition du licenciement économique (art. L1233-3) et protections (reclassement,
  ordre des licenciements, priorité de réembauche 1 an).
- Déroulé du CSP étape par étape (info employeur → **21 jours** de réflexion → décision
  → accompagnement → **12 mois**).
- Comparatif **accepter vs refuser** le CSP.
- Allocation **ASP** (75 % du salaire brut de référence) et traitement du préavis.
- Aides au reclassement : prime, IDR, périodes d'activité, formation.
- FAQ, sources officielles, avertissement.

Faits vérifiés sur service-public.gouv.fr, travail-emploi.gouv.fr et unedic.org
(à jour juillet 2026 ; convention CSP prolongée jusqu'au 31/12/2026).

## Livrable 2 — Simulateur ARE / ARCE
Section « Simulateur » ajoutée à `index.html` (JavaScript, sans dépendance).

**Entrées :** date d'entrée, salaire net (mensuel/annuel), statut (cadre/non-cadre),
âge, et (optionnel) salaire brut d'un nouvel emploi.

**Sorties :**
- **ARE** : montant journalier, mensuel, durée d'indemnisation.
- **ARCE** : capital (60 % des droits) pour création/reprise d'entreprise.
- **Reprise d'emploi** : cumul salaire + ARE et prolongation des droits.

Inclut un **exemple 50 000 €/an** (bouton de pré-remplissage + exemple pas à pas).

**Paramètres France Travail 2025-2026 utilisés :**
- Partie fixe **13,18 €/j**, allocation minimale **32,13 €/j**.
- ARE/jour = `max(40,4 % × SJR + partie fixe ; 57 % × SJR)`, plafond **75 % du SJR**.
- Durée max : **548 j** (< 55 ans) / **685 j** (55-56) / **822 j** (≥ 57), plancher 182 j ;
  fenêtre 24 mois (< 55) / 36 mois (≥ 55).
- Dégressivité **−30 %** au 7ᵉ mois si SJR > **159,68 €** et < 55 ans (plancher **92,57 €/j**).
- ARCE = 60 % du reliquat − 3 %.
- Cumul reprise d'emploi : jours indemnisés = `(ARE mensuelle − 0,70 × salaire brut) / ARE journalière`,
  total plafonné à l'ancien salaire.

Logique validée sur le cas exemple et des cas limites (hauts salaires → dégressivité,
seniors → 822/685 j, ancienneté insuffisante → non éligible).

> Estimation indicative : conversion net→brut approximative, hypothèse d'emploi continu ;
> seuls les calculs de France Travail font foi.

## État
- **Artifact :** https://claude.ai/code/artifact/aa8f9f20-4652-4e6f-a9da-a33931e01e72
- **Branche :** `claude/licensing-economics-csp-wx1f22` (guide + simulateur poussés).
- Fichiers : `index.html`, `README.md`, `RECAP.md`.

## Pistes non réalisées (au choix)
- Version anglaise / bilingue.
- Export imprimable / PDF.
- Guide côté employeur (RH).
- Ouverture d'une Pull Request.

_Note sur la conversion net→brut : c'est la principale approximation. « Ancienneté » est
déduite de la date d'entrée ; un champ « âge » distinct a été ajouté (nécessaire aux durées)._


**ProjectPilot — Cahier des charges MVP**

Version 1.0 · Application personnelle

## Objectif

Permettre à un utilisateur de gérer ses projets personnels, de planifier leurs tâches et de suivre sa progression depuis un seul tableau de bord.

Utilisateur cible

Une personne qui souhaite mieux organiser son travail, limiter les projets commencés simultanément et terminer ce qu'elle entreprend.

## Parcours principal

L'utilisateur crée son compte et se connecte.
Il crée un projet et définit son objectif.
Il ajoute des tâches avec une priorité et une échéance facultative.
Il fait évoluer les tâches jusqu'à leur achèvement.
Il consulte le tableau de bord pour mesurer sa progression.

***Critère de réussite***

L'application est considérée comme livrée lorsque l'utilisateur peut créer un compte, se connecter, gérer ses projets et leurs tâches, retrouver ses données après une nouvelle connexion et ne jamais accéder aux données d'un autre utilisateur.

***Les fonctionnalites essentielles :*** 

### 1. Authentification

* Créer un compte.
* Se connecter et se déconnecter.
* Protéger les pages privées.
* Garantir que chaque utilisateur accède uniquement à ses propres données.

### 2. Gestion des projets

* Créer, consulter, modifier et supprimer un projet.
* Définir un nom, une description, un objectif et une date limite facultative.
* Consulter la progression de chaque projet.

### 3. Gestion des tâches

* Créer, consulter, modifier et supprimer une tâche.
* Définir une priorité : faible, moyenne ou élevée.
* Définir un statut : à faire, en cours ou terminée.
* Ajouter une échéance facultative.

### 4. Tableau de bord

* Afficher les projets actifs.
* Afficher les tâches à faire et terminées.
* Visualiser la progression des projets.
* Repérer les tâches en retard.

### 5. Mon focus

* Choisir un projet principal.
* Identifier jusqu'à trois tâches prioritaires pour la journée.

## Critères de réussite

Le MVP est terminé lorsque :

* Un utilisateur peut créer son compte et se connecter.
* Il peut gérer ses projets et leurs tâches.
* Les données persistent après une nouvelle connexion.
* Les données sont protégées contre l'accès d'autres utilisateurs.
* Les principales fonctionnalités ont été testées.
* L'application est déployée et utilisable.


*** Stack Technique ***

Partie            Technologie retenue

Frontend            Next.js + React + TypeScript

Style               Tailwind CSS

Backend API         NestJS

ORM                 Prisma

Base de données     Neon PostgreSQL

Authentification    NestJS, bcrypt et JWT

Tests               Vitest ou Jest selon le module

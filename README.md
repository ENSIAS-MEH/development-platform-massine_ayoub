# YouthConnect

## Description

YouthConnect est une plateforme sociale permettant aux jeunes de découvrir, créer, rejoindre et partager des activités et des événements dans leur communauté.

## Architecture

### Vue d’ensemble

L’application suit une architecture classique à 3 couches :

### Architecture Backend

Le backend suit un modèle d’architecture en couches :

* **Couche Contrôleur (Controller Layer)** — gère les requêtes et les réponses HTTP
* **Couche Service (Service Layer)** — contient la logique métier
* **Couche Repository (Repository Layer)** — gère les requêtes vers la base de données à l’aide de Spring Data JPA
* **Couche Entité (Entity Layer)** — classes Java associées aux tables de la base de données

### Schéma de la Base de Données

* **users** — stocke les comptes utilisateurs (id, username, email, password, role, created_at)
* **categories** — catégories d’activités (id, name)
* **activities** — activités créées par les utilisateurs (id, title, description, location, activity_date, max_participants, created_by, category_id)
* **participations** — suit les utilisateurs ayant rejoint des activités (id, user_id, activity_id, joined_at)

### Endpoints de l’API REST

| Méthode | Endpoint                   | Description                                         |
| ------- | -------------------------- | --------------------------------------------------- |
| POST    | /api/auth/register         | Inscrire un nouvel utilisateur                      |
| POST    | /api/auth/login            | Se connecter                                        |
| GET     | /api/activities            | Récupérer toutes les activités                      |
| POST    | /api/activities            | Créer une activité                                  |
| POST    | /api/activities/{id}/join  | Rejoindre une activité                              |
| DELETE  | /api/activities/{id}/leave | Quitter une activité                                |
| DELETE  | /api/activities/{id}       | Supprimer une activité                              |
| GET     | /api/activities/created    | Récupérer les activités créées par l’utilisateur    |
| GET     | /api/activities/joined     | Récupérer les activités rejointes par l’utilisateur |
| GET     | /api/activities/{id}/count | Obtenir le nombre de participants                   |
| GET     | /api/categories            | Récupérer toutes les catégories                     |

## Technologies

* **Frontend :** HTML, CSS, JavaScript
* **Backend :** Spring Boot (Java)
* **Base de données :** MySQL
* **Sécurité :** chiffrement des mots de passe avec BCrypt
* **DevOps :** Docker

## DevOps

### Conteneurisation

Le backend est conteneurisé à l’aide de Docker. Le fichier `Dockerfile` permet de packager l’application Spring Boot dans une image Docker.

### Orchestration

Docker Compose orchestre deux services :

* `mysql` — conteneur de base de données MySQL 8.0
* `backend` — conteneur de l’application Spring Boot

### Infrastructure as Code

Le fichier `docker-compose.yml` définit l’ensemble de l’infrastructure, y compris les services, les ports, les variables d’environnement et les volumes.

### Exécution avec Docker

```bash
docker-compose up --build
```

### Exécution en local

1. Lancer l’application Spring Boot dans Eclipse
2. Servir le frontend avec `python -m http.server 5500`

## Équipe

* **Massine SEKKAKI** — Backend (Spring Boot, MySQL, Docker)
* **Ayoub JNIEH** — Frontend (HTML, CSS, JavaScript)

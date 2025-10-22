# Cómo Contribuir al Proyecto
Seguiremos un flujo de Git simple basado en *feature-branches*.

## Flujo de Trabajo Básico (Paso a Paso)
Nunca trabajes directamente en la rama `main`.

### 1. Iniciar una Nueva Tarea HU

1.  **Sincroniza tu rama `main`:** Asegúrate de tener lo último del repositorio.
    ```bash
    git checkout main
    git pull origin main
    ```

2.  **Crea tu rama personal:** Crea una nueva rama *desde* `main`. Usa un nombre claro que haga referencia a tu HU de Jira (ej. `feat/HU11-homepage`).
    ```bash
    git checkout -b feat/HU11-homepage
    ```

### 2. Trabajar en tu Tarea

1.  **Haz tu trabajo:** Programa, crea tus componentes, haz tus *commits*.
2.  **Haz commits pequeños y claros:**
    ```bash
    git add .
    git commit -m "feat(HU11): Creación del componente Navbar"
    ```
3.  **Sube tu rama** a GitHub para tener un respaldo:
    ```bash
    git push -u origin feat/HU11-homepage
    ```

### 3. Terminar y Entregar tu Tarea

1.  **Revisa si `main` se actualizó:** Antes de entregar, es posible que se hayan subido cambios a `main`.
    ```bash
    git checkout main
    git pull origin main
    git checkout feat/HU11-homepage
    git merge main
    ```
    *(Si hay conflictos aquí, resuélvelos en tu máquina).*

2.  **Sube tus cambios finales:**
    ```bash
    git push
    ```

3.  **Crea un "Pull Request" (PR):**
    * Ve a la página de GitHub del repositorio.
    * Verás un botón amarillo para crear un "Pull Request" desde tu rama `feat/HU11-homepage` hacia `main`.
    * Asígnale un título claro (ej. "Completa HU-11: Homepage y Navegación").
    * En la descripción, pon un link a la HU de Jira.
    * **Asigna a 1 o 2 compañeros** como "Reviewers" (revisores).

### 4. Revisión y Merge

* **NO** apruebes tu propio Pull Request.
* Espera a que un compañero revise tu código y lo apruebe.
* Una vez aprobado, el revisor (o tú) puede hacer clic en el botón "Merge Pull Request".
* ¡Listo! Tu código ahora está en `main`.
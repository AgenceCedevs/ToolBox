# 02_Structure frontend
Ce module configure le frontend React avec un Router, un Layout partagé (Header + Footer), une HomePage et une page 404. Il s'appuie sur la structure créée dans le module précédent : les dépendances react-router@7, react-toastify et @emailjs/browser sont déjà déclarées dans web/package.json. Il ajoute également un composant SEO réutilisable avec react-helmet-async.

Les constantes stables (comme ROUTE_HOME) sont importées depuis le workspace `@appstarter/shared`. Le nom de l'application est une configuration variable : le frontend le lit depuis `import.meta.env.VITE_APP_NAME` défini dans web/.env.

À la fin de ce module :

- Le frontend démarre sur http://localhost:5173 avec une page d'accueil fonctionnelle.
- Le routing est configuré via createBrowserRouter, avec un Layout commun (Header + Footer) et une page 404.
- Les métadonnées SEO sont gérées par un composant réutilisable, défini par page ; la page 404 est marquée noindex.
- Les fichiers générés par le template Vite non nécessaires (App.css, index.css, les images par défaut de assets/ et les icônes inutilisées de public/) sont supprimés.
- Un favicon propre au projet remplace celui du template Vite.
- Un logo propre au projet s'affiche dans le Header.
- Biome valide le code sans erreur.

<!-- ------------------------------------ -->
# 01 - web > Vérifier les dépendances
Depuis la racine du monorepo.

▷ Vérifier que react-router@7 est bien présent dans web/package.json.

```bash
npm list react-router -w web --depth=0
```
🔵 Sortie attendue
```text
web@0.0.0
└── react-router@7.x
```
🟡 Attention
Si la version est inférieure à 7, mettre à jour :

```bash

npm install react-router@7 -w web
```

<!-- ------------------------------------ -->
# 02 - web > Créer la structure de dossiers
Créer l'arborescence du projet web en deux catégories :

- components/ : avec les sous-dossiers header, footer, layout et seo pour les éléments réutilisables.
- pages/ : avec homePage, notFoundPage pour les pages principales.

▷ Créer tous les dossiers nécessaires en une seule commande depuis la racine.

```bash
mkdir -p web/src/components/header web/src/components/footer web/src/components/layout web/src/components/seo web/src/pages/homePage web/src/pages/notFoundPage
```

<!-- ------------------------------------ -->
# 03 - web > Créer les fichiers avec touch
Les fichiers .ts et .tsx ne doivent jamais être créés via node -e, les emojis et les regex sont corrompus en terminal.

▷ Créer tous les fichiers .tsx et .css avec touch. Le contenu sera rempli dans l'éditeur aux étapes suivantes.

```bash
touch web/src/components/header/Header.tsx
touch web/src/components/footer/Footer.tsx
touch web/src/components/layout/Layout.tsx
touch web/src/components/seo/Seo.tsx
touch web/src/pages/homePage/HomePage.tsx
touch web/src/pages/homePage/HomePage.css
touch web/src/pages/notFoundPage/NotFoundPage.tsx
touch web/src/pages/notFoundPage/NotFoundPage.css
touch web/src/router.tsx
touch web/src/global.css
touch web/src/assets/logo_app.svg
touch web/public/favicon_app.svg
```

<!-- ------------------------------------ -->
# 04 - web > src > components > footer > Remplir le composant Footer.tsx
▷ Ouvrir le fichier web/src/components/footer/Footer.tsx et coller le contenu suivant.

```typescript
import logo from "../../assets/logo_app.svg";

function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="footer">
			<strong className="footer-brand">
				<img src={logo} alt="logo_app" className="footer-logo-img" />
				{import.meta.env.VITE_APP_NAME}
			</strong>
			<p>
				Tous droits réservés | site internet développé par{" "}
				<a className="footer-link" href="https://cedevs.fr" target="_blank" rel="noopener noreferrer">
					cedevs.fr
				</a>{" "}
				- Hébergé en France
			</p>
			<p>© {year}</p>
		</footer>
	);
}

export default Footer;
```

<!-- ------------------------------------ -->
# 05 - web > src > components > header > Remplir le composant Header.tsx
▷ Ouvrir le fichier web/src/components/header/Header.tsx et coller le contenu suivant.

```typescript
import { constants } from "@shared";
import { Link } from "react-router";
import logo from "../../assets/logo_app.svg";

function Header() {
	return (
		<header className="header">
			<Link to={constants.ROUTE_HOME} className="header-logo">
			<img src={logo} alt="logo_app" className="header-logo-img" />
				{import.meta.env.VITE_APP_NAME}
			</Link>
			<nav className="header-nav" aria-label="Navigation principale">
				<Link to={constants.ROUTE_HOME} className="header-nav-link">
					Accueil
				</Link>
				<a href="#about" className="header-nav-link">
					Le projet
				</a>
				<a href="#stack" className="header-nav-link">
					Stack technique
				</a>
			</nav>
		</header>
	);
}

export default Header;
```

🔵 Info
Le logo est importé depuis web/src/assets/logo_app.svg, créé à l'étape 03. L'attribut `alt` est vide car le nom de l'application est déjà affiché à côté : le logo est décoratif. Tant que le fichier est vide, le navigateur n'affiche aucune image : y coller le SVG du projet.

<!-- ------------------------------------ -->
# 06 - web > src > components > layout > Remplir le composant Layout.tsx

Le Layout est le composant parent commun à toutes les pages. Il contient le Header, le Footer et un <Outlet /> qui rend la page active selon la route.

▷ Ouvrir le fichier web/src/components/layout/Layout.tsx et coller le contenu suivant.

```typescript
import { Outlet } from "react-router";
import Footer from "../footer/Footer";
import Header from "../header/Header";

function Layout() {
	return (
		<div className="app-wrapper">
			<a className="skip-link" href="#main-content">
				Aller au contenu principal
			</a>
			<Header />
			<div className="main-content">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
}

export default Layout;
```

<!-- ------------------------------------ -->
# 07 - web > src > components > seo > Créer le composant réutilisable Seo

🔵 Info
Chaque page fournit ses propres métadonnées au composant. Le nom du site et son URL viennent des variables web/.env ; le titre, la description et le chemin sont définis près de la page concernée.

▷ Depuis la racine du monorepo, installer react-helmet-async.

```bash
npm install react-helmet-async -w web
```

▷ Ouvrir web/src/components/seo/Seo.tsx et coller le contenu suivant.

```tsx
import { Helmet } from "react-helmet-async";

interface SeoProps {
	title?: string;
	description: string;
	path?: string;
	image?: string;
	ogTitle?: string;
	ogDescription?: string;
	noIndex?: boolean;
}

function Seo({
	title,
	description,
	path,
	image = "/og-image.webp",
	ogTitle,
	ogDescription,
	noIndex = false,
}: SeoProps) {
	const siteUrl = new URL(import.meta.env.VITE_APP_URL);
	const fullTitle = title
	? `${title} | ${import.meta.env.VITE_APP_NAME}`
	: import.meta.env.VITE_APP_NAME;
	const socialTitle = ogTitle ?? fullTitle;
	const socialDescription = ogDescription ?? description;
	const canonicalUrl = path ? new URL(path, siteUrl).toString() : undefined;
	const imageUrl = new URL(image, siteUrl).toString();

	return (
		<Helmet>
			<title>{fullTitle}</title>
			<meta name="description" content={description} />
			<meta
				name="robots"
				content={noIndex ? "noindex, nofollow" : "index, follow"}
			/>
			{canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
			<meta property="og:type" content="website" />
			{canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
			<meta property="og:title" content={socialTitle} />
			<meta property="og:description" content={socialDescription} />
			<meta property="og:image" content={imageUrl} />
		</Helmet>
	);
}

export default Seo;
```

🔵 Info
`image` peut être un chemin depuis `web/public/` ou une URL absolue. Le composant utilise `/og-image.webp` par défaut : ajouter le fichier correspondant dans `web/public/`, ou modifier cette valeur par défaut pour pointer vers une image existante. Une page peut fournir une image différente avec la propriété `image`. `ogTitle` et `ogDescription` sont facultatifs ; lorsqu'ils ne sont pas fournis, ils reprennent le titre et la description de la page.

<!-- ------------------------------------ -->
# 08 - web > src > pages > homePage > Remplir le style HomePage.css

▷ Ouvrir le fichier web/src/pages/homePage/HomePage.css et coller le contenu suivant.

```css
/* ── UTILS ── */
.hp-section-inner {
	max-width: 1100px;
	margin: 0 auto;
	padding: 0 2rem;
}

.hp-section-inner--narrow {
	max-width: 720px;
}

.hp-eyebrow {
	font-family: var(--font-mono);
	font-size: 0.68rem;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	color: var(--accent);
	margin: 0 0 0.9rem;
}

h2 {
	font-size: clamp(1.8rem, 4vw, 2.6rem);
	font-weight: 800;
	line-height: 1.15;
	margin: 0 0 1.2rem;
	letter-spacing: -0.03em;
	color: var(--text);
}

/* ── BUTTONS ── */
.hp-btn {
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	padding: 0.8rem 1.6rem;
	border-radius: var(--radius);
	font-size: 0.95rem;
	font-weight: 700;
	text-decoration: none;
	transition: all 0.18s ease;
	cursor: pointer;
	font-family: var(--font-sans);
}

.hp-btn--primary {
	background: linear-gradient(
		135deg,
		var(--accent) 0%,
		var(--accent-dark) 100%
	);
	color: var(--white);
	box-shadow: 0 4px 14px var(--accent-glow);
}

.hp-btn--primary:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 28px rgba(0, 102, 102, 0.25);
}

.hp-btn--ghost {
	border: 2px solid var(--border);
	color: var(--accent);
	background: var(--bg2);
}

.hp-btn--ghost:hover {
	border-color: var(--accent);
	background: var(--accent-light);
}

.hp-btn--lg {
	padding: 1rem 2.4rem;
	font-size: 1.05rem;
}

/* ── HERO ── */
.hp-hero {
	position: relative;
	padding: 7rem 2rem 6rem;
	text-align: center;
	overflow: hidden;
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(
		135deg,
		var(--accent) 0%,
		var(--accent-dark) 100%
	);
}

.hp-hero__grid {
	position: absolute;
	inset: 0;
	background-image:
		linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
		linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
	background-size: 56px 56px;
	pointer-events: none;
	mask-image: radial-gradient(
		ellipse 90% 80% at 50% 0%,
		black 30%,
		transparent 100%
	);
}

.hp-hero__noise {
	position: absolute;
	inset: 0;
	background: radial-gradient(
		ellipse 60% 50% at 50% 100%,
		rgba(0, 0, 0, 0.15) 0%,
		transparent 70%
	);
	pointer-events: none;
}

.hp-hero__inner {
	position: relative;
	max-width: 820px;
	margin: 0 auto;
}

.hp-badge {
	display: inline-block;
	padding: 0.35rem 1rem;
	border: 1px solid rgba(255, 255, 255, 0.25);
	border-radius: 100px;
	font-family: var(--font-mono);
	font-size: 0.68rem;
	letter-spacing: 0.12em;
	color: rgba(255, 255, 255, 0.85);
	background: rgba(255, 255, 255, 0.1);
	margin-bottom: 2rem;
	animation: fadeDown 0.6s ease both;
}

.hp-hero__title {
	font-size: clamp(2.8rem, 7vw, 5rem);
	font-weight: 800;
	line-height: 1.05;
	letter-spacing: -0.04em;
	margin: 0 0 1.5rem;
	color: var(--white);
	animation: fadeDown 0.6s 0.1s ease both;
}

.hp-hero__title-accent {
	color: #4dd9ff;
}

.hp-hero__sub {
	font-size: 1.1rem;
	line-height: 1.75;
	color: rgba(255, 255, 255, 0.75);
	max-width: 580px;
	margin: 0 auto 2.5rem;
	font-weight: 400;
	animation: fadeDown 0.6s 0.2s ease both;
}

.hp-hero__cta {
	display: flex;
	gap: 1rem;
	justify-content: center;
	flex-wrap: wrap;
	margin-bottom: 3.5rem;
	animation: fadeDown 0.6s 0.3s ease both;
}

.hp-hero .hp-btn--primary {
	background: var(--white);
	color: var(--accent);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.hp-hero .hp-btn--primary:hover {
	background: var(--bg);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.hp-hero .hp-btn--ghost {
	border-color: rgba(255, 255, 255, 0.3);
	color: var(--white);
	background: rgba(255, 255, 255, 0.08);
}

.hp-hero .hp-btn--ghost:hover {
	background: rgba(255, 255, 255, 0.15);
	border-color: rgba(255, 255, 255, 0.5);
}

.hp-hero__stats {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 2.5rem;
	animation: fadeDown 0.6s 0.4s ease both;
}

.hp-stat {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.hp-stat__num {
	font-size: 2rem;
	font-weight: 800;
	letter-spacing: -0.04em;
	color: var(--white);
}

.hp-stat__lbl {
	font-size: 0.72rem;
	color: rgba(255, 255, 255, 0.6);
	text-transform: uppercase;
	letter-spacing: 0.1em;
}

.hp-stat__sep {
	width: 1px;
	height: 36px;
	background: rgba(255, 255, 255, 0.2);
}

@keyframes fadeDown {
	from {
		opacity: 0;
		transform: translateY(-14px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* ── ABOUT ── */
.hp-about {
	padding: 6rem 0;
	background: var(--bg2);
	border-bottom: 1px solid var(--border);
}

.hp-about header.hp-section-inner {
	display: block;
	margin-bottom: 3rem;
}

.hp-about .hp-section-inner {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 5rem;
	align-items: start;
}

.hp-about__text p {
	color: var(--muted);
	line-height: 1.8;
	margin-bottom: 1rem;
	font-size: 1rem;
}

.hp-about__cards {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
}

.hp-feature-card {
	background: var(--bg);
	border: 1.5px solid var(--border);
	border-radius: var(--radius);
	padding: 1.25rem;
	transition:
		border-color 0.2s,
		box-shadow 0.2s,
		transform 0.2s;
}

.hp-feature-card:hover {
	border-color: var(--accent);
	box-shadow: 0 6px 24px var(--accent-glow);
	transform: translateY(-2px);
}

.hp-feature-card__icon {
	font-size: 1.5rem;
	display: block;
	margin-bottom: 0.6rem;
}

.hp-feature-card h3 {
	display: block;
	font-size: 0.88rem;
	font-weight: 700;
	margin: 0 0 0.35rem;
	color: var(--text);
}

.hp-feature-card p {
	font-size: 0.8rem;
	color: var(--muted);
	line-height: 1.55;
	margin: 0;
}

/* ── STEPS / CHAPITRES ── */
.hp-steps {
	padding: 6rem 0;
	background: var(--bg);
	border-bottom: 1px solid var(--border);
}

.hp-steps__sub {
	color: var(--muted);
	max-width: 520px;
	line-height: 1.7;
	margin-bottom: 2.5rem;
	font-size: 0.97rem;
}

.hp-chapter {
	display: flex;
	flex-direction: column;
	border: 1.5px solid var(--border);
	border-radius: var(--radius);
	overflow: hidden;
	background: var(--bg2);
	box-shadow: 0 2px 16px rgba(0, 102, 102, 0.05);
	border-bottom: 1px solid var(--border);
}

.hp-chapter:last-child {
	border-bottom: none;
}

.hp-chapter__trigger {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1.5rem;
	padding: 1.2rem 1.5rem;
	background: var(--bg2);
	border: none;
	cursor: pointer;
	text-align: left;
	transition: background 0.15s;
	color: var(--text);
	font-family: var(--font-sans);
}

.hp-chapter__trigger:hover {
	background: var(--bg3);
}

.hp-chapter--open .hp-chapter__trigger {
	background: var(--accent-light);
}

.hp-chapter__num {
	font-family: var(--font-mono);
	font-size: 0.68rem;
	font-weight: 700;
	color: var(--accent);
	padding: 0.2rem 0.5rem;
	border: 1.5px solid var(--accent);
	border-radius: 6px;
	white-space: nowrap;
	flex-shrink: 0;
	background: var(--accent-light);
	align-self: center;
}

.hp-chapter__header-info {
	display: flex;
	flex-direction: column;
	gap: 0.15rem;
	align-items: flex-start;
	justify-content: center;
	flex: 1;
}

.hp-chapter__header-info h3 {
	font-size: 0.93rem;
	font-weight: 700;
	color: var(--text);
	margin: 0;
}

.hp-chapter__header-info p {
	font-size: 0.78rem;
	color: var(--muted);
	margin: 0;
	line-height: 1.4;
}

.hp-chapter__header-actions {
	display: flex;
	align-items: center;
	gap: 1rem;
	flex-shrink: 0;
}

.hp-chapter__count {
	font-family: var(--font-mono);
	font-size: 0.68rem;
	color: var(--muted);
	background: var(--bg3);
	padding: 0.2rem 0.5rem;
	border-radius: 4px;
	border: 1px solid var(--border);
}

.hp-chapter__chevron {
	font-size: 0.6rem;
	color: var(--muted);
}

.hp-chapter--open .hp-chapter__chevron {
	color: var(--accent);
}

.hp-chapter__content {
	background: var(--bg);
	border-top: 1px solid var(--border);
	display: flex;
	flex-direction: column;
}

.hp-module {
	display: flex;
	align-items: flex-start;
	gap: 1rem;
	padding: 0.85rem 1.5rem 0.85rem 3.5rem;
	border-bottom: 1px solid var(--border);
	transition: background 0.15s;
}

.hp-module:last-child {
	border-bottom: none;
}

.hp-module:hover {
	background: var(--accent-light);
}

.hp-module__id {
	font-family: var(--font-mono);
	font-size: 0.62rem;
	color: var(--accent);
	flex-shrink: 0;
	padding-top: 0.15rem;
	min-width: 40px;
	font-weight: 700;
}
.hp-module__info {
	display: flex;
	flex-direction: column;
}

.hp-module h4 {
	display: block;
	font-size: 0.84rem;
	font-weight: 700;
	margin: 0 0 0.15rem;
	color: var(--text);
}

.hp-module p {
	font-size: 0.77rem;
	color: var(--muted);
	margin: 0;
	line-height: 1.45;
}

/* ── PRÉREQUIS ── */
.hp-prereq {
	padding: 6rem 0;
	background: var(--bg2);
	border-bottom: 1px solid var(--border);
}

.hp-prereq__grid {
	display: flex;
	flex-direction: column;
	border: 1.5px solid var(--border);
	border-radius: var(--radius);
	overflow: hidden;
	margin-bottom: 1rem;
	box-shadow: 0 2px 16px rgba(0, 102, 102, 0.04);
}

.hp-prereq__item {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 0.9rem 1.25rem;
	background: var(--bg2);
	border-bottom: 1px solid var(--border);
	transition: background 0.15s;
}

.hp-prereq__item:last-child {
	border-bottom: none;
}

.hp-prereq__item:hover {
	background: var(--bg3);
}

.hp-prereq__icon {
	font-size: 1.2rem;
	flex-shrink: 0;
	width: 28px;
	text-align: center;
}

.hp-prereq__label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}

.hp-prereq__name {
	font-size: 0.88rem;
	font-weight: 700;
	color: var(--text);
}

.hp-prereq__description {
	font-size: 0.76rem;
	color: var(--muted);
	flex: 1;
}

.hp-prereq__tag {
	font-family: var(--font-mono);
	font-size: 0.6rem;
	padding: 0.2rem 0.55rem;
	border-radius: 4px;
	flex-shrink: 0;
	font-weight: 700;
	letter-spacing: 0.05em;
}

.hp-prereq__tag--app {
	background: #e8f4ff;
	color: #1d6fa5;
	border: 1px solid #b8d9f5;
}

.hp-prereq__tag--cmd {
	background: var(--accent-light);
	color: var(--accent);
	border: 1px solid #b2d8d8;
}

.hp-prereq__tag--ext {
	background: #fff4e8;
	color: #c2620a;
	border: 1px solid #f5d4b0;
}

.hp-prereq__note {
	font-size: 0.82rem;
	color: var(--muted);
	padding: 0.85rem 1.1rem;
	background: var(--bg3);
	border: 1px solid var(--border);
	border-radius: var(--radius);
	margin: 0;
}

.hp-prereq__note p {
	margin: 0;
}

/* ── STACK ── */
.hp-stack {
	padding: 6rem 0;
	background: var(--bg);
	border-bottom: 1px solid var(--border);
}

.hp-stack h2 {
	margin-bottom: 2.5rem;
}

.hp-stack__grid {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	list-style: none;
	padding: 0;
	margin: 0;
}

.hp-stack__pill {
	display: flex;
	flex-direction: column;
	gap: 0.15rem;
	padding: 0.7rem 1.1rem;
	background: var(--bg2);
	border: 1px solid var(--border);
	border-left: 3px solid var(--accent);
	border-radius: 100px;
	transition:
		border-color 0.2s,
		box-shadow 0.2s,
		transform 0.2s;
}

.hp-stack__pill:hover {
	border-color: var(--accent);
	box-shadow: 0 4px 16px var(--accent-glow);
	transform: translateY(-1px);
}

.hp-stack__pill-cat {
	font-size: 0.58rem;
	text-transform: uppercase;
	letter-spacing: 0.12em;
	color: var(--muted);
}

.hp-stack__pill-name {
	font-size: 0.86rem;
	font-weight: 700;
	color: var(--text);
}

/* ── CTA FINAL ── */
.hp-cta {
	position: relative;
	padding: 8rem 2rem;
	text-align: center;
	background: linear-gradient(
		135deg,
		var(--accent) 0%,
		var(--accent-dark) 100%
	);
	overflow: hidden;
}

.hp-cta__noise {
	position: absolute;
	inset: 0;
	background-image:
		linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
		linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
	background-size: 56px 56px;
	pointer-events: none;
}

.hp-cta__inner {
	position: relative;
}

.hp-cta h2 {
	font-size: clamp(2rem, 5vw, 3.2rem);
	margin-bottom: 1rem;
	color: var(--white);
}

.hp-cta p {
	color: rgba(255, 255, 255, 0.72);
	font-size: 1.05rem;
	line-height: 1.7;
	margin-bottom: 2.5rem;
}

.hp-cta .hp-btn--primary {
	background: var(--white);
	color: var(--accent);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.hp-cta .hp-btn--primary:hover {
	background: var(--bg);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.hp-cta__fine {
	font-size: 0.8rem;
	margin-top: 1.25rem;
	margin-bottom: 0;
	color: rgba(255, 255, 255, 0.45);
}

/* =============================================================================
   MEDIA QUERIES - TABLETTE : De 768px jusqu'à 1023px
============================================================================= */
@media (min-width: 768px) and (max-width: 1023px) {
	.hp-section-inner {
		padding-right: 1.5rem;
		padding-left: 1.5rem;
	}

	.hp-about .hp-section-inner {
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.hp-about__cards {
		grid-template-columns: 1fr 1fr;
	}

	.hp-hero {
		padding: 6rem 1.5rem 5rem;
	}

	.hp-hero__stats {
		gap: 1.75rem;
	}

	.hp-chapter__trigger {
		gap: 1rem;
		padding: 1rem 1.25rem;
	}

	.hp-module {
		padding-left: 2.5rem;
	}

	.hp-cta {
		padding: 6rem 1.5rem;
	}
}

/* =============================================================================
   MEDIA QUERIES - MOBILE : Inférieur à 767px
============================================================================= */
@media (max-width: 767px) {
	.hp-section-inner {
		padding-right: 1rem;
		padding-left: 1rem;
	}

	.hp-about,
	.hp-steps,
	.hp-prereq,
	.hp-stack {
		padding-top: 4rem;
		padding-bottom: 4rem;
	}

	.hp-about .hp-section-inner {
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	.hp-about__cards {
		grid-template-columns: 1fr;
	}

	.hp-hero {
		padding: 5rem 1rem 4rem;
	}

	.hp-hero__title {
		font-size: clamp(2.4rem, 12vw, 3.5rem);
	}

	.hp-hero__sub {
		font-size: 1rem;
	}

	.hp-hero__cta {
		gap: 0.75rem;
		margin-bottom: 2.5rem;
	}

	.hp-hero__stats {
		gap: 1rem;
	}

	.hp-stat__num {
		font-size: 1.5rem;
	}

	.hp-stat__sep {
		height: 28px;
	}

	.hp-chapter__trigger {
		gap: 0.75rem;
		padding: 0.9rem 1rem;
	}

	.hp-chapter__header-info p {
		display: none;
	}

	.hp-chapter__header-actions {
		gap: 0.5rem;
	}

	.hp-chapter__count {
		font-size: 0.6rem;
	}

	.hp-module {
		gap: 0.6rem;
		padding: 0.75rem 1rem;
	}

	.hp-module__id {
		min-width: 2rem;
	}

	.hp-prereq__item {
		flex-wrap: wrap;
		gap: 0.5rem 0.75rem;
	}

	.hp-prereq__description {
		flex-basis: 100%;
		margin-left: 2.2rem;
	}

	.hp-prereq__tag {
		margin-left: auto;
	}

	.hp-cta {
		padding: 5rem 1rem;
	}
}
```

<!-- ------------------------------------ -->
# 09 - web > src > pages > homePage > Remplir la page HomePage.tsx

▷ Ouvrir le fichier web/src/pages/homePage/HomePage.tsx et coller le contenu suivant.

```tsx
import Seo from "../../components/seo/Seo";
import "./HomePage.css";

const stack = [
	{ name: "React", cat: "Web", color: "#61DAFB" },
	{ name: "React Native", cat: "Mobile", color: "#61DAFB" },
	{ name: "Expo", cat: "Mobile", color: "#1B1B1B" },
	{ name: "TypeScript", cat: "Language", color: "#3178C6" },
	{ name: "Vite", cat: "Build", color: "#646CFF" },
	{ name: "React Router 7", cat: "Routing", color: "#F44250" },
	{ name: "Express", cat: "Backend", color: "#68A063" },
	{ name: "PostgreSQL", cat: "Database", color: "#336791" },
	{ name: "JWT", cat: "Auth", color: "#D63AFF" },
	{ name: "Stripe", cat: "Payments", color: "#635BFF" },
	{ name: "Nodemailer", cat: "Email", color: "#0EA5E9" },
	{ name: "Biome", cat: "Tooling", color: "#60CFAC" },
	{ name: "Zod", cat: "Validation", color: "#F97316" },
	{ name: "Render", cat: "Deploy", color: "#46E3B7" },
];

const prereqs = [
	{
		icon: "🌐",
		label: "Google Chrome",
		note: "Navigateur principal pour le dev",
		type: "app",
	},
	{ icon: "📝", label: "VS Code", note: "Éditeur recommandé", type: "app" },
	{
		icon: "🟢",
		label: "Node.js 20+",
		note: "LTS - vérifie avec node --version",
		type: "cmd",
	},
	{ icon: "📦", label: "npm", note: "Vérifie avec npm --version", type: "cmd" },
	{ icon: "🔀", label: "Git", note: "Vérifie avec git --version", type: "cmd" },
	{
		icon: "🐳",
		label: "Docker Desktop",
		note: "Pour PostgreSQL en local",
		type: "app",
	},
	{
		icon: "🐘",
		label: "PostgreSQL 15+",
		note: "Via Docker ou installation directe",
		type: "cmd",
	},
	{
		icon: "🗄️",
		label: "TablePlus",
		note: "Client GUI pour la base de données",
		type: "app",
	},
	{
		icon: "📐",
		label: "Biome",
		note: "Extension VS Code - linting & formatting",
		type: "ext",
	},
];

function HomePage() {

	return (
		<>
			<Seo
				description="Découvrez une base de projet web et mobile organisée autour de React, TypeScript et des outils modernes."
				path="/"
				ogTitle="AppStarter - Construire un monorepo web et mobile"
				ogDescription="Une structure de monorepo pour démarrer des projets web et mobile avec une architecture cohérente."
				image="/og-image.webp"
			/>
			<main className="hp-home" id="main-content" tabIndex={-1}>
			{/* HERO SECTION */}
			<section className="hp-hero">
				<div className="hp-hero__noise" aria-hidden="true" />
				<div className="hp-hero__grid" aria-hidden="true" />
				<header className="hp-hero__inner">
					<span className="hp-badge">
						{import.meta.env.VITE_APP_NAME} · Monorepo · Web · Mobile · Full-stack
					</span>
					<h1 className="hp-hero__title">
						<span className="hp-hero__title-accent">{import.meta.env.VITE_APP_NAME}</span>
						<br />
						Le monorepo <br />
						Web & Mobile
						<br />
						dont on a besoin.
					</h1>
					<p className="hp-hero__sub">Une structure claire pour concevoir et faire évoluer des applications web et mobile avec des outils modernes.</p>
					<nav className="hp-hero__cta" aria-label="Navigation dans la page">
						<a href="#about" className="hp-btn hp-btn--primary">
							Découvrir le projet
						</a>
						<a href="#stack" className="hp-btn hp-btn--ghost">
							Découvrir la stack
						</a>
					</nav>
					<dl className="hp-hero__stats">
						<div className="hp-stat">
							<dt className="hp-stat__lbl">Web</dt>
							<dd className="hp-stat__num">React</dd>
						</div>
						<div className="hp-stat">
							<dt className="hp-stat__lbl">Mobile</dt>
							<dd className="hp-stat__num">Expo</dd>
						</div>
						<div className="hp-stat">
							<dt className="hp-stat__lbl">Codebase</dt>
							<dd className="hp-stat__num">1</dd>
						</div>
					</dl>
				</header>
			</section>

			{/* ABOUT SECTION */}
			<section className="hp-about" id="about">
				<header className="hp-section-inner">
					<p className="hp-eyebrow">C'est quoi {import.meta.env.VITE_APP_NAME} ?</p>
					<h2>Une base claire pour vos projets web et mobile.</h2>
				</header>
				<div className="hp-section-inner">
					<div className="hp-about__text">
						<p>{import.meta.env.VITE_APP_NAME} est une base de projet web et mobile qui rassemble les applications et leurs packages partagés dans une structure unique.</p>
						<p>
							L'objectif n'est pas uniquement d'écrire du code, mais de
							comprendre comment chaque couche s'articule (frontend, backend,
							base de données, infrastructure) et pourquoi elle est conçue
							ainsi.
						</p>
						<p>
							Le monorepo fournit un launcher pour démarrer en local le frontend,
							le backend et la base de données. Un vérificateur contrôle
							l'intégrité du projet et génère un rapport d'audit.
						</p>
						<p>
							Le monorepo {import.meta.env.VITE_APP_NAME} est directement réutilisable et
							s'adapte immédiatement à de futurs projets.
						</p>
					</div>
					<div className="hp-about__cards">
						{[
							{
								icon: "🏗️",
								title: "Une architecture modulaire",
								desc: "Les applications et les packages sont regroupés dans un même monorepo.",
							},
							{
								icon: "📱",
								title: "Web et mobile",
								desc: "Une base organisée pour les applications React et React Native.",
							},
							{
								icon: "⌨️",
								title: "TypeScript",
								desc: "Des types partagés pour améliorer la cohérence du code.",
							},
							{
								icon: "🛠️",
								title: "Outils modernes",
								desc: "Vite, Biome et les outils nécessaires au développement.",
							},
						].map((c) => (
							<article className="hp-feature-card" key={c.title}>
								<span className="hp-feature-card__icon" aria-hidden="true">
									{c.icon}
								</span>
								<h3>{c.title}</h3>
								<p>{c.desc}</p>
							</article>
						))}
					</div>
				</div>
			</section>

			{/* PREREQUISITES SECTION */}
			<section className="hp-prereq">
				<div className="hp-section-inner hp-section-inner--narrow">
					<header>
						<p className="hp-eyebrow">Avant de commencer</p>
						<h2>Installation requise</h2>
					</header>
					<dl className="hp-prereq__grid">
						{prereqs.map((p) => (
							<div className="hp-prereq__item" key={p.label}>
								<dt className="hp-prereq__label">
									<span className="hp-prereq__icon" aria-hidden="true">
										{p.icon}
									</span>
									<span className="hp-prereq__name">{p.label}</span>
									<span className={`hp-prereq__tag hp-prereq__tag--${p.type}`}>
										{p.type === "cmd"
											? "CLI"
											: p.type === "ext"
												? "Extension"
												: "App"}
									</span>
								</dt>
								<dd className="hp-prereq__description">{p.note}</dd>
							</div>
						))}
					</dl>
					<aside className="hp-prereq__note">
						<p>
							Le reste est fourni dans le monorepo ou accessible en ligne.
							<br /> <br />
							Ce monorepo est optimisé pour un environnement Windows.
							<br /> <br />
							Certaines fonctionnalités peuvent avoir un comportement différent
							ou ne pas être fonctionnelles sur macOS/Linux.
						</p>
					</aside>
				</div>
			</section>

			{/* TECH STACK SECTION */}
			<section className="hp-stack" id="stack">
				<div className="hp-section-inner">
					<header>
						<p className="hp-eyebrow">Stack technique</p>
						<h2>Des technos qui tiennent en production</h2>
					</header>
					<ul className="hp-stack__grid">
						{stack.map((s) => (
							<li key={s.name}>
								<span
									className="hp-stack__pill"
									style={{ "--accent": s.color } as React.CSSProperties}
								>
									<span className="hp-stack__pill-cat">{s.cat}</span>
									<span className="hp-stack__pill-name">{s.name}</span>
								</span>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* CTA FINAL SECTION */}
			<section className="hp-cta">
				<div className="hp-cta__noise" aria-hidden="true" />
				<div className="hp-section-inner hp-section-inner--narrow hp-cta__inner">
					<header>
						<h2>Démarrer un projet sur une base solide.</h2>
						<p>
							Découvrez la stack technique et choisissez les outils adaptés à
							votre projet.
						</p>
					</header>
					<nav aria-label="Découvrir la stack technique">
						<a href="#stack" className="hp-btn hp-btn--primary hp-btn--lg">
							Voir la stack technique
						</a>
					</nav>
				</div>
			</section>
			</main>
		</>
	);
}

export default HomePage;
```

<!-- ------------------------------------ -->
# 10 - web > src > pages > notFoundPage > Remplir le style NotFoundPage.css

▷ Ouvrir le fichier web/src/pages/notFoundPage/NotFoundPage.css et coller le contenu suivant.

```css
.nf {
	position: relative;
	min-height: 100vh;
	/* biome-ignore lint/suspicious/noDuplicateProperties: fallback for browsers that support svh */
	min-height: 100svh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(
		135deg,
		var(--accent) 0%,
		var(--accent-dark) 100%
	);
	overflow: hidden;
}

.nf__grid {
	position: absolute;
	inset: 0;
	background-image:
		linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
		linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
	background-size: 56px 56px;
	pointer-events: none;
	mask-image: radial-gradient(
		ellipse 90% 80% at 50% 50%,
		black 30%,
		transparent 100%
	);
}

.nf__inner {
	position: relative;
	text-align: center;
	padding: 2rem;
}

.nf__code {
	display: block;
	font-family: var(--font-mono);
	font-size: clamp(6rem, 20vw, 12rem);
	font-weight: 800;
	line-height: 1;
	letter-spacing: -0.05em;
	color: rgba(255, 255, 255, 0.12);
	margin-bottom: -1rem;
	user-select: none;
}

.nf__title {
	font-size: clamp(1.8rem, 5vw, 2.8rem);
	font-weight: 800;
	letter-spacing: -0.03em;
	color: var(--white);
	margin: 0 0 1rem;
	line-height: 1.1;
}

.nf__sub {
	font-size: 1rem;
	color: var(--white);
	margin: 0 0 2.5rem;
	line-height: 1.6;
}

.nf__btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 44px;
	gap: 0.4rem;
	padding: 0.8rem 1.8rem;
	background: var(--white);
	color: var(--accent);
	font-size: 0.95rem;
	font-weight: 700;
	font-family: var(--font-sans);
	text-decoration: none;
	border-radius: var(--radius);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
	transition:
		background-color 0.18s ease,
		box-shadow 0.18s ease,
		transform 0.18s ease;
}

.nf__btn:hover {
	background: var(--bg);
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
	transform: translateY(-2px);
}

/* =============================================================================
   MEDIA QUERIES - TABLETTE : De 768px jusqu'à 1023px
============================================================================= */
@media (min-width: 768px) and (max-width: 1023px) {
	.nf__inner {
		padding: 2.5rem;
	}

	.nf__code {
		font-size: clamp(7rem, 16vw, 10rem);
	}
}

/* =============================================================================
   MEDIA QUERIES - MOBILE : Inférieur à 767px
============================================================================= */
@media (max-width: 767px) {
	.nf__inner {
		padding: 1.5rem 1rem;
	}

	.nf__code {
		font-size: clamp(5rem, 25vw, 8rem);
		margin-bottom: -0.5rem;
	}

	.nf__title {
		font-size: clamp(1.6rem, 7vw, 2.2rem);
	}

	.nf__sub {
		font-size: 0.95rem;
		margin-bottom: 2rem;
	}

	.nf__btn {
		width: min(100%, 22rem);
	}
}
```

<!-- ------------------------------------ -->
# 11 - web > src > pages > notFoundPage > Remplir la page NotFoundPage.tsx

▷ Ouvrir le fichier web/src/pages/notFoundPage/NotFoundPage.tsx et coller le contenu suivant.

```typescript
import "./NotFoundPage.css";
import { Link, useLocation } from "react-router";
import Seo from "../../components/seo/Seo";

function NotFoundPage() {
	const { pathname } = useLocation();

	return (
		<>
			<Seo
				title="Page introuvable"
				description="La page demandée est introuvable."
				path={pathname}
				noIndex
			/>
			<main className="nf" id="main-content" tabIndex={-1}>
				<div className="nf__grid" aria-hidden="true" />
				<section className="nf__inner">
					<span className="nf__code" aria-hidden="true">
						404
					</span>
					<h1 className="nf__title">Page introuvable.</h1>
					<p className="nf__sub">Cette page n'existe pas ou a été déplacée.</p>
					<nav aria-label="Navigation de la page introuvable">
						<Link to="/" className="nf__btn">
							Retour à l'accueil
						</Link>
					</nav>
				</section>
			</main>
		</>
	);
}

export default NotFoundPage;
```
<!-- ------------------------------------ -->
# 12 - web > src > Mettre à jour App.tsx

▷ Ouvrir le fichier web/src/App.tsx et remplacer le contenu existant par le contenu suivant.

```typescript
import { HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router";
import router from "./router";

function App() {
	return (
		<HelmetProvider>
			<RouterProvider router={router} />
		</HelmetProvider>
	);
}

export default App;
```
<!-- ------------------------------------ -->
# 13 - web > src > Remplir global.css

▷ Ouvrir le fichier web/src/global.css et coller le contenu suivant.

```css
/* ──────────────────────────────────────────
   TOKENS
────────────────────────────────────────── */
:root {
	/* Colors */
	--accent: #006666;
	--accent-dark: #005959;
	--accent-mid: #009999;
	--accent-light: #e0f0f0;
	--accent-glow: rgba(0, 102, 102, 0.12);

	/* Backgrounds */
	--bg: #f7fafa;
	--bg2: #ffffff;
	--bg3: #eef5f5;

	/* Borders */
	--border: #ddeaea;

	/* Text */
	--text: #0f1f1f;
	--muted: #5a7070;
	--white: #ffffff;

	/* Layout */
	--radius: 12px;
	--spacing-sm: 1rem;
	--spacing-md: 2rem;

	/* Fonts */
	--font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	--font-mono: ui-monospace, "Cascadia Code", "Segoe UI Mono", monospace;
}

/* ──────────────────────────────────────────
   RESET
────────────────────────────────────────── */
*,
*::before,
*::after {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

html,
body,
#root {
	min-height: 100vh;
	/* biome-ignore lint/suspicious/noDuplicateProperties: fallback for browsers that support svh */
	min-height: 100svh;
	width: 100%;
}

body {
	font-family: var(--font-sans);
	color: var(--text);
	background: var(--bg);
}

/* ──────────────────────────────────────────
   LAYOUT
────────────────────────────────────────── */
.app-wrapper {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	/* biome-ignore lint/suspicious/noDuplicateProperties: fallback for browsers that support svh */
	min-height: 100svh;
}

.main-content {
	flex: 1;
	width: 100%;
	display: flex;
	flex-direction: column;
}

.skip-link {
	position: absolute;
	top: 0.5rem;
	left: 0.5rem;
	z-index: 10;
	padding: 0.75rem 1rem;
	transform: translateY(-160%);
	border-radius: var(--radius);
	background: var(--white);
	color: var(--accent-dark);
	font-weight: 700;
}

.skip-link:focus {
	transform: translateY(0);
}

:focus-visible {
	outline: 3px solid currentColor;
	outline-offset: 3px;
}

#main-content {
	scroll-margin-top: 1rem;
}

/* ──────────────────────────────────────────
   HEADER
────────────────────────────────────────── */
.header {
	background: linear-gradient(
		135deg,
		var(--accent) 0%,
		var(--accent-dark) 100%
	);
	color: var(--white);
	padding: var(--spacing-sm) var(--spacing-md);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.header-logo-img {
	height: 2rem;
	width: auto;
}

.header-logo {
	gap: 0.5rem;
	display: inline-flex;
	align-items: center;
	min-height: 44px;
	color: var(--white);
	text-decoration: none;
	font-weight: 700;
}

.header-nav {
	display: flex;
	flex-wrap: wrap;
	gap: var(--spacing-sm);
}

.header-nav-link {
	display: inline-flex;
	align-items: center;
	min-height: 44px;
	color: var(--white);
	text-decoration: none;
	border-bottom: 2px solid transparent;
}

.header-nav-link:hover {
	border-bottom: 2px solid var(--white);
}

/* ──────────────────────────────────────────
   FOOTER
────────────────────────────────────────── */
.footer {
	background: var(--accent-dark);
	color: var(--white);
	padding: var(--spacing-sm);
	text-align: center;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
	gap: var(--spacing-sm);
}

.footer-brand {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
}

.footer-logo-img {
	height: 2rem;
	width: auto;
}

.footer-link {
	color: var(--white);
	font-weight: 700;
	text-decoration: underline;
	text-decoration-color: var(--accent-mid);
	text-decoration-thickness: 2px;
	text-underline-offset: 0.2em;
	transition: text-decoration-color 0.2s ease, color 0.2s ease;
}

.footer-link:hover {
	color: var(--accent-light);
	text-decoration-color: var(--white);
}

/* =============================================================================
   MEDIA QUERIES - TABLETTE : De 768px jusqu'à 1023px
============================================================================= */
@media (min-width: 768px) and (max-width: 1023px) {
	.header {
		gap: 0.75rem 1rem;
		padding: 0.75rem 1.5rem;
	}

	.header-nav {
		gap: 0.5rem 0.75rem;
	}

	.footer {
		gap: 0.75rem;
	}
}

/* =============================================================================
   MEDIA QUERIES - MOBILE : Inférieur à 767px
============================================================================= */
@media (max-width: 767px) {
	:root {
		--spacing-sm: 0.75rem;
		--spacing-md: 1rem;
	}

	.header {
		flex-direction: column;
		align-items: stretch;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
	}

	.header-logo {
		justify-content: center;
	}

	.header-nav {
		justify-content: center;
		gap: 0.25rem 0.75rem;
	}

	.footer {
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
	}
}

@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		scroll-behavior: auto ;
		animation-duration: 0.01ms ;
		animation-iteration-count: 1;
		transition-duration: 0.01ms ;
	}
}
```

🔵 Info
Les règles html, body, #root garantissent que l'élément root occupe toute la hauteur du viewport, ce qui est essentiel pour que le layout flexbox fonctionne correctement.

<!-- ------------------------------------ -->
# 14 - web > src > Mettre à jour main.tsx
▷ Ouvrir le fichier web/src/main.tsx et remplacer le contenu existant par le contenu suivant.

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);
```
<!-- ------------------------------------ -->
# 15 - web > src > Remplir router.tsx

▷ Ouvrir le fichier web/src/router.tsx et coller le contenu suivant.

```tsx
import { useEffect, useRef } from "react";
import { createBrowserRouter, Outlet, useLocation } from "react-router";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/homePage/HomePage";
import NotFoundPage from "./pages/notFoundPage/NotFoundPage";

function Root() {
	const location = useLocation();
	const prevPathname = useRef(location.pathname);

	useEffect(() => {
		if (prevPathname.current !== location.pathname) {
			prevPathname.current = location.pathname;
			window.scrollTo(0, 0);
		}
	});

	return <Outlet />;
}

const router = createBrowserRouter([
	{
		path: "/",
		element: <Root />,
		children: [
			{
				element: <Layout />,
				errorElement: <NotFoundPage />,
				children: [{ index: true, element: <HomePage /> }],
			},
		],
	},
	{ path: "*", element: <NotFoundPage /> },
]);

export default router;
```
<!-- ------------------------------------ -->
# 16 - web > src > Créer vite-env.d.ts

Ce fichier fournit à TypeScript les types Vite, les types des variables d'environnement utilisées dans web/.env.sample et les déclarations nécessaires pour importer des images comme des URL.

▷ Créer le fichier avec touch.

```bash
touch web/src/vite-env.d.ts
```
▷ Ouvrir le fichier web/src/vite-env.d.ts et ajouter le contenu suivant.

```typescript
/// <reference types="vite/client" />
interface ImportMetaEnv {
	readonly VITE_APP_NAME: string;
	readonly VITE_APP_URL: string;
	readonly VITE_API_URL: string;
	readonly VITE_EMAILJS_SERVICE_ID: string;
	readonly VITE_EMAILJS_TEMPLATE_ID: string;
	readonly VITE_EMAILJS_PUBLIC_KEY: string;
}

declare module "*.png" {
	const value: string;
	export default value;
}
declare module "*.jpg" {
	const value: string;
	export default value;
}
declare module "*.svg" {
	const value: string;
	export default value;
}
```
<!-- ------------------------------------ -->
# 17 - web > Mettre à jour index.html

Le index.html généré par Vite contient des références au logo Vite. Le remplacer par une version propre avec les métadonnées SEO de base, alimentées par les variables de web/.env définies au module 1.

▷ Ouvrir le fichier web/index.html et remplacer le contenu existant par le contenu suivant.

```html
<!DOCTYPE html>
<html lang="fr" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/favicon_app.svg" />
    <title>%VITE_APP_NAME%</title>
  </head>
  <body>
    <noscript>
      <div style="text-align: center; padding: 20px; font-family: sans-serif;">
        Activez JavaScript dans votre navigateur pour profiter pleinement de ce site.
      </div>
    </noscript>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Vite remplace `%VITE_APP_NAME%` à la compilation. Les métadonnées propres à chaque page sont ajoutées par le composant `Seo` après le chargement de React ; le prérendu facultatif les inscrit dans le HTML généré pour les robots qui ne lancent pas JavaScript. Cela évite d'avoir des balises génériques en double dans le navigateur. `VITE_APP_URL` doit être l'URL publique du site en production ; en développement, sa valeur dans web/.env.sample peut rester `http://localhost:5173`. Ajouter `web/public/og-image.webp` ou fournir une autre image avec la propriété `image` de `Seo`.

<!-- ------------------------------------ -->
# 18 - web > Mettre à jour tsconfig.json

Le fichier tsconfig.json configure TypeScript pour le projet. Il active le mode strict, configure React, et crée un alias @/ pour importer facilement depuis le dossier src/. Il analyse uniquement les fichiers dans src sans générer de fichiers compilés.

▷ Ouvrir le fichier web/tsconfig.json et remplacer le contenu existant par le contenu suivant.

```json
{
	"compilerOptions": {
		"target": "ESNext",
		"module": "ESNext",
		"moduleResolution": "bundler",
		"jsx": "react-jsx",
		"strict": true,
		"esModuleInterop": true,
		"skipLibCheck": true,
		"noEmit": true,
		"forceConsistentCasingInFileNames": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"paths": {
			"@/*": ["./src/*"],
			"@shared": ["../shared/src/index.ts"],
			"@shared/*": ["../shared/src/*"]
		}
	},
	"include": ["src"]
}
```

<!-- ------------------------------------ -->
# 19 - web > Mettre à jour tsconfig.node.json
Le fichier tsconfig.node.json configure TypeScript pour les fichiers de configuration Node.js du projet. Il cible ES2023, active le mode strict, et inclut les types Node.js et Vite. Il analyse uniquement le fichier vite.config.ts sans générer de fichiers compilés.

▷ Ouvrir le fichier web/tsconfig.node.json et remplacer le contenu existant par le contenu suivant.

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["vite/client", "node"],
    "skipLibCheck": true,
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```
<!-- ------------------------------------ -->
# 20 - web > Mettre à jour vite.config.ts
Le vite.config.ts généré par le template est remplacé pour charger les variables WEB_PORT depuis la racine et le port PORT depuis server/.env, puis configurer le proxy vers le serveur Express et l'alias @ pour les imports. Les variables VITE_ du frontend restent chargées depuis web/.env par Vite.

▷ Ouvrir le fichier web/vite.config.ts et remplacer le contenu existant par le contenu suivant.

```typescript
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { createLogger, defineConfig, loadEnv } from "vite";

const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";
const configDir = dirname(fileURLToPath(import.meta.url));
const monorepoRoot = resolve(configDir, "..");

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, monorepoRoot, "");
	const serverEnv = loadEnv(mode, resolve(monorepoRoot, "server"), "");
	const apiPort = env.SERVER_PORT || serverEnv.PORT || "3310";
	const webPort = Number(env.WEB_PORT) || 5173;

	const logger = createLogger();
	const loggerInfo = logger.info;
	logger.info = (msg, options) => {
		if (msg.includes("Local") || msg.includes("Network") || msg.includes("ready in") || msg.includes("VITE v") || msg.includes("is in use")) return;
		loggerInfo(msg, options);
	};

	return {
		customLogger: logger,
		plugins: [
			react(),
			{
				name: "custom-logger",
				configureServer(server) {
					server.httpServer?.once("listening", () => {
						const address = server.httpServer?.address();
						const actualPort = typeof address === "object" && address ? address.port : webPort;

						console.log("\n=========================================");
						console.log("🔵 CLIENT WEB");
						console.log("=========================================");
						console.log(`🔵 NODE_ENV : ${mode}`);
						console.log(`🟢 Client démarré sur : ${BLUE}http://localhost:${actualPort}${RESET}`);
						console.log(`🟢 Proxy API vers : ${BLUE}http://localhost:${apiPort}${RESET}`);
						console.log("=========================================\n");
					});
				},
			},
		],
		server: {
			port: webPort,
			proxy: {
				"/api": {
					target: `http://localhost:${apiPort}`,
					changeOrigin: true,
				},
			},
		},
		resolve: {
			alias: {
				"@": resolve(configDir, "src"),
				"@shared": resolve(monorepoRoot, "shared/src"),
			},
		},
	};
});
```
<!-- ------------------------------------ -->
# 21 - web > Nettoyer les fichiers du template Vite

▷ Supprimer les fichiers inutiles du template Vite, ainsi que les images par défaut.

```bash
rm -rf web/src/App.css web/src/index.css
rm -rf web/src/assets/hero.png web/src/assets/react.svg web/src/assets/vite.svg web/public/vite.svg web/public/icons.svg
```
<!-- ------------------------------------ -->
# 22 - racine > Lancer le frontend

▷ Tester l'application à l'adresse http://localhost:5173/ dans le navigateur.

```bash
npm run dev:web
```
Cette commande racine compile d'abord `shared/`, puis lance Vite dans le workspace web. Le serveur Express n'est pas démarré par cette commande ; le proxy `/api` ne répondra donc que si le serveur est lancé séparément ou si l'étape de démarrage complet du module 1 est utilisée.

🔵 Sortie attendue
```text
> appStarter@1.0.0 dev:web
> npm run build:shared && npm run dev -w web

> appStarter@1.0.0 build:shared
> npm run build -w shared

... compilation de shared ...

> web@0.0.0 dev
> vite

=========================================
🔵 CLIENT WEB
=========================================
🔵 NODE_ENV : development
🟢 Client démarré sur :  http://localhost:5173
🟢 Proxy API vers :  http://localhost:3310
=========================================

  ➜  press h + enter to show help
```
<!-- ------------------------------------ -->
# 23 - web > Ajouter un prérendu HTML

Une application React classique envoie surtout une coquille HTML, puis construit son contenu dans le navigateur. Pour les pages publiques dont le référencement compte, le prérendu peut produire le HTML et les métadonnées par route avant leur livraison ; c'est préférable à une coquille vide, sans garantir l'indexation par un moteur ou un service d'IA.

Cette étape reste facultative : elle ajoute Puppeteer ainsi qu'un navigateur à l'environnement de build et peut augmenter la durée ou les contraintes du build. Elle n'appelle aucun service externe et ne modifie aucun réglage d'hébergement. Si le prérendu n'est pas activé, les métadonnées de `Seo` n'apparaissent dans le HTML qu'après l'exécution de JavaScript.

▷ Depuis la racine, installer Puppeteer dans le workspace web, puis déclarer le script postbuild et créer le fichier du prérendu.

```bash
npm install --save-dev puppeteer -w web &&
npm pkg set scripts.postbuild="node scripts/prerender.mjs" -w web &&
mkdir -p web/scripts &&
touch web/scripts/prerender.mjs
```

🟡 Attention
Dans Git Bash, `&&` arrête la suite si l'installation échoue. Ne lancez pas `npm run build -w web` tant que le script `web/scripts/prerender.mjs` n'a pas été rempli avec le code ci-dessous : un fichier vide permettrait au postbuild de réussir sans générer de HTML prérendu.

<!-- ------------------------------------ -->
# 24 - web > Remplir le script de prérendu

▷ Ouvrir web/scripts/prerender.mjs et coller le script suivant.

```javascript
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(scriptDir, "../dist");
const PORT = Number(process.env.PRERENDER_PORT) || 4174;
const MAX_ROUTES = 250;
const EXTRA_SEED_ROUTES = [];
const EXCLUDED_PREFIXES = [];
const ORIGIN = `http://127.0.0.1:${PORT}`;
let spaTemplate = Buffer.alloc(0);

const MIME_TYPES = {
	".css": "text/css",
	".html": "text/html",
	".ico": "image/x-icon",
	".jpeg": "image/jpeg",
	".jpg": "image/jpeg",
	".js": "text/javascript",
	".json": "application/json",
	".png": "image/png",
	".svg": "image/svg+xml",
	".txt": "text/plain",
	".webp": "image/webp",
	".woff2": "font/woff2",
};

function isExcluded(route) {
	return EXCLUDED_PREFIXES.some((prefix) => route === prefix || route.startsWith(`${prefix}/`));
}

function normalizeRoute(href) {
	try {
		const url = new URL(href, ORIGIN);
		if (url.origin !== ORIGIN) return null;

		const pathname = decodeURIComponent(url.pathname);
		if (pathname.includes("\\") || path.posix.extname(pathname)) return null;

		const normalized = path.posix.normalize(pathname);
		const route = normalized === "/" ? "/" : normalized.replace(/\/+$/, "");
		if (!route.startsWith("/") || route.startsWith("//") || isExcluded(route)) return null;

		return route;
	} catch {
		return null;
	}
}

function startServer() {
	const server = createServer(async (request, response) => {
		let pathname;

		try {
			pathname = decodeURIComponent(new URL(request.url ?? "/", ORIGIN).pathname);
		} catch {
			response.writeHead(400).end("Bad request");
			return;
		}

		if (pathname.includes("\\") || pathname.includes("\0")) {
			response.writeHead(400).end("Bad request");
			return;
		}

		const filePath = path.resolve(DIST_DIR, `.${pathname}`);
		const relativePath = path.relative(DIST_DIR, filePath);

		if (relativePath === ".." || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
			response.writeHead(403).end("Forbidden");
			return;
		}

		const hasExtension = path.extname(filePath) !== "";
		if (hasExtension && !existsSync(filePath)) {
			response.writeHead(404).end("Not found");
			return;
		}

		const targetPath = hasExtension ? filePath : path.join(DIST_DIR, "index.html");

		try {
			const content = hasExtension ? await readFile(targetPath) : spaTemplate;
			const contentType = MIME_TYPES[path.extname(targetPath)] ?? "application/octet-stream";
			response.writeHead(200, { "Content-Type": `${contentType}; charset=utf-8` }).end(content);
		} catch (error) {
			console.error(`Impossible de servir ${targetPath} :`, error);
			response.writeHead(500).end("Internal server error");
		}
	});

	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(PORT, "127.0.0.1", () => {
			server.off("error", reject);
			resolve(server);
		});
	});
}

async function prerenderRoute(browser, route) {
	const page = await browser.newPage();

	try {
		await page.goto(`${ORIGIN}${route}`, { waitUntil: "networkidle2", timeout: 30000 });
		await page.evaluate(() => {
			const selectors = ["title", 'meta[name="description"]', 'meta[name="robots"]', 'link[rel="canonical"]', 'meta[property="og:type"]', 'meta[property="og:url"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:image"]'];

			for (const selector of selectors) {
				const elements = document.head.querySelectorAll(selector);
				for (let index = 0; index < elements.length - 1; index++) {
					elements[index]?.remove();
				}
			}
		});
		const links = await page.$$eval("a[href]", (anchors) => anchors.map((anchor) => anchor.getAttribute("href") ?? ""));
		const html = (await page.content()).replaceAll(ORIGIN, "");
		const outputDir = path.resolve(DIST_DIR, `.${route}`);

		await mkdir(outputDir, { recursive: true });
		await writeFile(path.join(outputDir, "index.html"), html, "utf-8");
		console.log(`Prérendu : ${route}`);

		return links.map(normalizeRoute).filter(Boolean);
	} finally {
		await page.close();
	}
}

async function main() {
	if (!existsSync(path.join(DIST_DIR, "index.html"))) {
		throw new Error("dist/index.html introuvable. Lancez d'abord `npm run build -w web`.");
	}

	spaTemplate = await readFile(path.join(DIST_DIR, "index.html"));
	const server = await startServer();
	let browser;

	try {
		browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
		const visited = new Set();
		const queue = ["/", ...EXTRA_SEED_ROUTES.map(normalizeRoute).filter(Boolean)];

		while (queue.length > 0) {
			const route = queue.shift();
			if (visited.has(route)) continue;
			if (visited.size >= MAX_ROUTES) {
				throw new Error(`Limite de ${MAX_ROUTES} routes atteinte. Vérifiez les liens ou augmentez MAX_ROUTES.`);
			}

			visited.add(route);
			const discoveredRoutes = await prerenderRoute(browser, route);
			for (const discoveredRoute of discoveredRoutes) {
				if (!visited.has(discoveredRoute) && !queue.includes(discoveredRoute)) {
					queue.push(discoveredRoute);
				}
			}
		}

		console.log(`Prérendu terminé : ${visited.size} route(s).`);
	} finally {
		try {
			if (browser) await browser.close();
		} finally {
			await new Promise((resolve, reject) => {
				server.close((error) => (error ? reject(error) : resolve()));
			});
		}
	}
}

main().catch((error) => {
	console.error("Échec du prérendu :", error);
	process.exitCode = 1;
});
```

Pour inclure une route qui n'est liée depuis aucune page, l'ajouter à `EXTRA_SEED_ROUTES`. Ajouter à `EXCLUDED_PREFIXES` les routes privées ou qui ne doivent pas être générées. Le crawler ne suit que les liens internes sans extension de fichier ; les liens externes, les ressources et les paramètres d'URL ne créent pas de nouvelles pages.

<!-- ------------------------------------ -->
# 25 - web > Vérifier le prérendu

▷ Vérifier le prérendu en lançant le build web depuis la racine.

```bash
npm run build -w web
```

Vérifier que `npm ls puppeteer -w web` indique une installation dans `web`, puis que le build se termine avec `> web@... postbuild` et `Prérendu terminé`. Un avertissement Vite sur la taille d'un chunk supérieur à 500 kB n'est pas, à lui seul, un échec du build. Vérifier ensuite que `web/dist/index.html` et les fichiers tels que `web/dist/une-route/index.html` contiennent le contenu rendu et une seule balise pour chaque métadonnée fournie par `Seo`. Les routes doivent être accessibles en production avec le fichier `index.html` du dossier correspondant ; configurer l'hébergeur pour servir ces fichiers avant tout fallback SPA. Le composant React 404 n'impose pas à lui seul un statut HTTP 404 : configurer et tester le comportement 404 de l'hébergeur. Ne pas prérendre de pages privées ou de contenu personnalisé par utilisateur.

<!-- ------------------------------------ -->
# 26 - racine > Corriger les fichiers du template Vite et lancer le lint

Les fichiers générés par le template Vite, ainsi que le script de prérendu ajouté aux étapes précédentes, ne respectent pas forcément le formatage et les règles de Biome. La commande `fix` applique les corrections automatiques à tout le monorepo et signale les problèmes qui demandent une correction manuelle.

▷ Depuis la racine du monorepo, lancer `npm run fix`.

```bash
npm run fix
```

<!-- ------------------------------------ -->
# 27 - racine > Sauvegarder les modifications
▷ Ajouter les fichiers et commiter les modifications.

```bash
git add .
git commit -m "Base Monorepo 02"
```

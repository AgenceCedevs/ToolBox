# CSS : cours


## Sélecteurs simples

Cibler les éléments auxquels va s'appliquer une mise en forme.

- Toujours mettre les valeurs des éléments entre accolades
- Toujours mettre `;` après une valeur
- `p { }`, `h1 { }`, `body { }`, … pour les éléments des pages HTML

```css
h1 { color: bleu; }
```

## Sélecteurs complexes

Cibler les éléments auxquels va s'appliquer une mise en forme.

- Toujours mettre les valeurs des éléments entre accolades
- Grouper les sélecteurs : il suffit de les séparer par une virgule

```css
h1, p, div { color: bleu; }
```

### `#id { }`

Cibler un élément précis (attention au `#` devant). Un id s'applique à un objet unique : il ne peut pas y avoir deux id du même nom dans une page.

```css
#p1 { color: bleu; }
```

### `.class { }`

Cibler plusieurs éléments précis (attention au `.` devant). Une class peut caractériser plusieurs objets (identiques ou non).

```css
.p2 { color: red; }
```

### `* { }` : sélecteur universel

Appliquer le style CSS à tous les éléments des pages HTML.

```css
* { color: red; }
```

### Espace entre deux sélecteurs

Cibler des éléments imbriqués dans d'autres éléments.

```css
div p { color: bleu; } /* Tous les paragraphes du div sont bleus */
```

### `+` : sélecteurs suivis

Cibler des éléments qui suivent un autre élément du même niveau.

```css
div + p { color: bleu; } /* Le paragraphe qui suit le div est bleu */
```

### `>` : sélecteurs recherche

Rechercher des éléments imbriqués dans d'autres éléments.

```css
div > h2 { color: bleu; } /* Le titre h2 du div est bleu */
```

### Avec attributs

Cibler des éléments avec des attributs.

```css
div[class] { border: 1px solid black; }
/* Tous les div ayant une class ont une bordure solide noire de 1 pixel */
```

---

## Les propriétés

### Ordre de priorité de style

1. L'attribut `style` dans la ligne de code
2. L'élément `<style>` dans `<head>`
3. Feuille CSS séparée

> Si conflit, le style retenu sera celui du style le plus proche de l'élément mis en forme.

### Propriété de style

Modifier la mise en forme des différents éléments HTML.

---

### `background-color`

Changer la couleur de l'arrière-plan.

- `teal;` (nom de la couleur)
- `#008080;` (code Hex de la couleur)
- `rgba(0,128,128,0.2);` (code RGB de la couleur et valeur d'opacité)

### `background-image`

Définir l'image de l'arrière-plan.

- Valeur : `url("nom de l'image.jpg")`

```css
body { background-image: url("coucher-soleil-1.jpg"); }
```

Pour définir deux images en arrière-plan, il faut les séparer par une virgule, et de même pour les propriétés.

```css
body { background-image: url("coucher-soleil-1.jpg"), url("coucher-soleil-2.jpg"); }
```

### `background-size`

Définir la grandeur de l'image de l'arrière-plan.

- Absolu : `px` = pixel / `pt` = point
- Relatif : pourcentage de l'élément parent et non de l'image importée

### `background-repeat`

Définir la répétition de l'image de l'arrière-plan.

- `repeat;` (valeur par défaut : répète horizontalement et verticalement)
- `repeat-x;` (répète uniquement horizontalement)
- `repeat-y;` (répète uniquement verticalement)
- `no-repeat;` (n'applique pas la répétition)

### `background-attachment`

Fixer l'image de fond.

- `fixed;` (fixer l'image de fond)
- `scroll;` (valeur par défaut)

### `background-position`

Positionner l'image de fond.

- `top;` ou `right;` ou `bottom;` ou `left;`
- Absolu : `px` = pixel / `pt` = point

### `color`

Changer la couleur.

- `teal;` (nom de la couleur)
- `#008080;` (code Hex de la couleur)
- `rgba(0,128,128,0.2);` (code RGB de la couleur et valeur d'opacité)

### `opacity`

Modifier l'opacité de la couleur.

- `0;` = transparent et `1;` = opaque

---

## Dégradé de couleur

### `linear-gradient`

Intégrer un dégradé linéaire de couleurs.

- Départ du dégradé, noms des couleurs séparés par des virgules et entre parenthèses
- Le pourcentage de transition pour les couleurs souhaitées

```css
div { background: linear-gradient (bottom left, red 10%, orange, blue); }
```

Les départs de dégradé peuvent s'exprimer également en degrés, ex : `90deg`.

### `radial-gradient`

Intégrer un dégradé radial de couleurs.

- Départ du dégradé, noms des couleurs séparés par des virgules et entre parenthèses

```css
div { background: radial-gradient (circle, red, orange 20%, blue); }
```

### Ellipse non centrée

Intégrer un dégradé ellipse de couleurs.

- Position du départ du dégradé, noms des couleurs séparés par des virgules et entre parenthèses

```css
div { background: radial-gradient (closet-side at 20% 40%, red, orange 20%, blue); }
```

---

## `display`

### Display inline / block

Convertir des éléments block en inline et inversement.

- `inline;` : permet de mettre des éléments block en éléments inline
- `block;` : permet de mettre des éléments inline en éléments block
- `inline-block;` : permet de mettre des éléments block en éléments inline mais en conservant les propriétés du bloc
- `none;` : permet de cacher des éléments HTML

```css
p { display: inline; } /* L'élément block "p" est basculé en inline */
p { display: block; }  /* L'élément inline "span" est basculé en block */
```

**Rappel :**

- Les éléments **block** les plus communs sont `<p>`, `<h>`, `<ol>`, `<ul>`, `<div>`, `<form>`
- Les éléments **inline** les plus communs sont `<strong>`, `<em>`, `<a>`, `<img>`, `<span>`

### `display: flex`

Par défaut, le conteneur flexible est réglé sur `row` (ligne). Cette ligne a deux axes :

- **L'axe principal** (main axis) : horizontal
- **L'axe transversal** (cross axis) : vertical

#### Aligner sur l'axe principal : `justify-content`

- `flex-start;` : alignera les éléments au début du conteneur
- `flex-end;` : alignera les éléments à la fin du conteneur
- `center;` : alignera les éléments au centre du conteneur
- `space-between;` : répartira les éléments du conteneur (sur l'axe principal)
- `space-around;` : répartira les éléments du conteneur et ajoutera un espace avant le premier et après le dernier élément
- `space-evenly;` : répartira les éléments de manière à ce que l'espace entre deux éléments (et l'espace par rapport aux bords) soit égal

```css
div {
  display: flex;
  justify-content: center;
}
```

#### Aligner sur l'axe transversal (vertical) : `align-items`

- `stretch;` : étirera les éléments le long de l'axe transversal
- `flex-start;` : alignera les éléments au départ
- `flex-end;` : alignera les éléments à la fin
- `center;` : alignera les éléments au centre
- `baseline;` : s'alignera sur la ligne de base du conteneur

```css
div {
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
```

#### Changer la direction du conteneur : `flex-direction`

Lorsqu'on change la direction du flex, les axes changent. En mode `column`, l'axe principal est alors vertical et l'axe transversal devient horizontal. Cela signifie que pour centrer horizontalement, il faut maintenant utiliser `align-items`.

```css
div {
  display: flex;
  flex-direction: column;
}
```

#### Changer le sens des éléments : `flex-direction`

- `row-reverse;` : les éléments s'afficheront de droite à gauche
- `column-reverse;` : les éléments s'afficheront de bas en haut

```css
div {
  display: flex;
  flex-direction: column-reverse;
}
```

#### Retour à la ligne : `flex-wrap`

- `nowrap;` : si les éléments n'ont pas assez de place, ils prendront la place disponible qu'ils peuvent
- `wrap;` : les éléments passeront à la ligne s'ils n'ont plus assez de place
- `wrap-reverse;` : les éléments passeront à la ligne dans le sens inverse s'ils n'ont plus assez de place

---

## Texte et police

### `font-family`

Mettre en forme les textes avec les polices.

- 3 types de police minimum sont à mettre dans le `body` du fichier CSS
- Les polices en plusieurs mots sont à mettre entre guillemets

```css
body { font-family: "Century gothic", verdana, sans serif; }
```

### `font-size`

Modifier la taille du texte.

- Pour une bonne cohérence, mettre des multiples de 8
- Taille du texte standard d'un site : 16px, voire 18px ou même 20px
- Absolu : `px` = pixel / `pt` = point
- Relatif : `%`
- `inherit;` (hérite du style parent)

### `font-style`

Modifier le style du texte.

- `normal;` (n'applique aucune modification)
- `italic;` ou `oblique;` (si non supporté)
- `inherit;` (hérite du style parent)

### `font-weight`

Modifier le poids du texte.

- `lighter;` (fin, peu supporté)
- `normal;` (400)
- `bold;` (700, gras)
- `bolder;` (très gras)

### `gap`

Définir les espaces (les gouttières) entre les lignes et entre les colonnes d'une grille.

### `letter-spacing`

Modifier la grandeur de l'espace entre les lettres.

- Absolu : `px` = pixel / `pt` = point
- Les valeurs négatives sont possibles

### `line-height`

Écarter deux lignes de texte.

- Absolu : `px` = pixel / `pt` = point
- Relatif : `%`
- Couramment utilisé : 1.5 fois la hauteur du texte

### Préfixe vendeur

Rendre compatibles les rendus CSS avec les différents navigateurs.

- `-o-` pour Opera
- `-moz-` pour Gecko (Mozilla)
- `-webkit-` pour Webkit (Chrome, Safari, Android…)
- `-ms-` pour Microsoft (Internet Explorer, Edge)
- `-khtml-` pour KHTML (Konqueror)

### `text-align`

Aligner du texte.

- `left;` (gauche)
- `right;` (droite)
- `center;` (centrer)
- `justify;` (justifier)
- `inherit;` (hérite du style parent)

### `text-decoration`

Décorer le texte.

- `underline;` (texte souligné)
- `line-through;` (texte barré)
- `overline;` (ligne au-dessus du texte)
- `inherit;` (héritage du style parent)
- `initial;` (valeur par défaut)
- `none;` (aucune transformation)

### `text-indent`

L'indentation d'un texte (décaler vers la droite).

- Absolu : `px` = pixel / `pt` = point
- Relatif : `%`
- Les valeurs négatives sont possibles

### `text-transform`

Transformer un texte (casse).

- `lowercase;` (tout le texte en minuscules)
- `uppercase;` (tout le texte en majuscules)
- `capitalize;` (première lettre de chaque mot en majuscule)
- `inherit;` (héritage du style parent)
- `none;` (aucune transformation)

### `text-shadow`

Ombrer le texte.

Indiquer 3 valeurs en pixels et une couleur dans un ordre précis : la projection horizontale, la projection verticale, le rayon de l'ombre (radius) et la couleur.

```css
p1 { text-shadow: 1px -1px 4px #040404; } /* ombre à droite et en bas */
p2 { text-shadow: 0px 0px 4px #040404; }  /* ombre centrée */
```

- En horizontal, les valeurs positives projettent l'ombre vers la droite et les valeurs négatives vers la gauche
- En vertical, les valeurs positives projettent l'ombre vers le bas et les valeurs négatives vers le haut

### `word-spacing`

Modifier la grandeur de l'espace entre les mots.

- Absolu : `px` = pixel / `pt` = point
- Les valeurs négatives sont possibles

---

## Les pseudo-classes

Modifier le style d'un élément HTML selon son état (dynamique : au survol, au clic).

- Commence toujours par `:`
- Bien respecter l'ordre si plusieurs pseudo-classes sont utilisées (`:link`, `:visited`, `:hover` et `:active`)

### `:active`

Styliser un lien lors du clic.

### `:first-child`

Styliser le premier élément précis enfant d'un élément parent.

```css
p:first-child { color: purple; }
```

### `:hover`

Changer l'aspect au survol.

```css
h1:hover { color: orange; }
```

### `:last-child`

Styliser le dernier élément précis enfant d'un élément parent.

### `:link`

Styliser un lien non visité.

```css
p:link { color: blue; }
```

### `:nth-child()`

Styliser certains éléments enfants d'un élément parent.

Mettre un critère entre les parenthèses (`even` = pair ou `odd` = impair) pour sélectionner les éléments enfants pairs ou impairs.

```css
p:nth-child(even) { color: purple; } /* tous les éléments pairs sont en violet */
```

**Mettre en forme dans un tableau :**

```css
tr:nth-child(even) { background-color: orange; }
```

**Styliser un élément précis :** mettre un nombre entre les parenthèses (3) pour sélectionner le troisième élément enfant.

```css
p:nth-child(3) { color: purple; }
```

### `:visited`

Styliser un lien visité.

```css
a:visited { color: blue; }
```

---

## Les pseudo-éléments

Modifier le style d'une partie d'un ou plusieurs éléments HTML, ou ajouter du contenu au début ou à la fin d'un certain élément HTML.

- Commence toujours par `::`
- Bien respecter l'ordre si plusieurs pseudo-éléments sont utilisés (`::first-letter`, `::first-line`, `::selection`, `::before`, `::after`)

### `::after`

Insérer un contenu à la fin d'un élément HTML.

```css
div::after { content: url("coucher-soleil-1.jpg"); }
```

### `::before`

Insérer un contenu au début d'un élément HTML.

```css
div::before { content: "texte ajouté au début du div"; }
```

### `::first-letter`

Styliser la première lettre d'un texte contenu dans un élément.

```css
p::first-letter { font-size: 30px; color: purple; }
```

### `::first-line`

Styliser la première ligne d'un texte contenu dans un élément.

```css
p::first-line { font-size: 30px; color: purple; }
```

### `::selection`

Styliser une partie d'un texte sélectionné par l'utilisateur.

```css
p::selection { color: orange; }
```

---

## Les sprites d'images

Rendre une image multi-cliquable. Une sprite est une collection d'images rassemblées en une seule image.

**Avantage :** réduire le nombre de requêtes serveur.

En HTML, créer les différents liens avec des id :

```html
<body>
  <a href="https://facebook.com" id="fb"></a>
  <a href="https://twitter.com" id="tw"></a>
  <a href="https://linkedin.com" id="lk"></a>
</body>
```

```css
#fb, #tw, #lk {
  width: 50px;
  height: 50px;
  display: block;
  position: absolute;
}

#fb {
  background-image: url("logos-sociaux;png");
  background-position: 0px 0px;
}

#tw {
  background-image: url("logos-sociaux;png");
  background-position: -50px 0px; /* la valeur est négative pour être au bord du logo */
  left: 100px;
}

#lk {
  background-image: url("logos-sociaux;png");
  background-position: -100px -50px; /* les valeurs sont négatives pour être au bord du logo */
  left: 200px;
}
```

---

## Les transitions

Modifier la valeur d'une propriété CSS de façon fluide.

La syntaxe d'une transition ressemble à ceci :

- `transition:` la propriété CSS, la durée en secondes, la courbe
- `transition-delay: 0s;` délai avant animation si besoin

```css
element {
  transition: width 1s ease-in;
  transition-delay: 3s;
}
```

### La courbe de vitesse de l'animation

- `ease;` : départ lent, milieu rapide, fin lente
- `ease-in;` : départ lent
- `ease-in-out;` : départ lent, fin lente
- `ease-out;` : fin lente

---

## Les transformations

Manipuler un élément en l'inclinant, en le faisant tourner, en le déplaçant ou en le mettant à l'échelle.

```css
article {
  background-color: blue;
  margin: 10px;
  transform: rotate(10deg);
}
```

- `rotate(10deg);` : tourner
- `scale(1.5);` : mise à l'échelle
- `skew(30deg, 20deg);` : incliner
- `translate(120px, 50%);` : déplacer

---

## Les animations

Changer le style CSS d'un élément HTML sans changement d'état et autant de fois que voulu.

### Variante 1 : simple (changement de couleur)

En bas de page :

```css
@keyframes chgt-couleur {
  from { background-color: teal; }   /* état au départ */
  to   { background-color: orange; } /* état à la fin */
}
```

Dans le sélecteur :

```css
.my-div {
  animation-name: chgt-couleur;
  animation-duration: 1s;
  animation-iteration-count: infinite; /* ou un nombre */
}
```

### Variante 2 : changement de couleur avec des % de durée

En bas de page :

```css
@keyframes chgt-couleur {
  0%   { background-color: green; }
  25%  { background-color: yellow; }
  50%  { background-color: red; top; }
  75%  { background-color: blue; }
  100% { background-color: green; }
}
```

Dans le sélecteur :

```css
.my-div {
  animation-name: chgt-couleur;
  animation-duration: 1s;
  animation-iteration-count: infinite; /* ou un nombre */
}
```

---

## Les bordures

### `border`

Définir les bordures de la boîte. 3 valeurs sont demandées : l'épaisseur, le style et la couleur.

```css
div1 { border: 5px solid black; }
```

### `border-radius`

Arrondir les coins des bordures.

- Absolu : `px` = pixel / `pt` = point

### `border-width`

Définir la largeur de la bordure.

- Absolu : `px` = pixel / `pt` = point

### `border-style`

Modifier le style de la bordure.

- `solid;` = trait continu
- `dotted;` = trait pointillé
- `dashed;` = trait en tirets
- `double;` = double trait continu
- `groove;` = 3D (attention, tous les navigateurs ne le supportent pas)
- `ridge;` = 3D (idem)
- `inset;` = 3D (idem)
- `outset;` = 3D (idem)

### `border-collapse`

Coller les lignes entre elles dans un tableau (sur l'élément `table`, non sur `tr` ou `td`).

- `collapse;`
- `separate;`

```css
table { border-collapse: collapse; }
```

```css
table { border-collapse: separate; }
```

### `border-color`

Modifier la couleur de la bordure.

- `teal;` (nom de la couleur)
- `#008080;` (code Hex de la couleur)
- `rgba(0,128,128,0.2);` (code RGB de la couleur et valeur d'opacité)

### Assemblage des propriétés des bordures

```css
div {
  border-top-left-radius: 10px;     /* bordure arrondie 10px dans le coin haut gauche */
  border-bottom-right-radius: 30px; /* bordure arrondie 30px dans le coin bas droit */
}
```

### `box-shadow`

Ombrer les boîtes.

Indiquer 3 valeurs en pixels et une couleur dans un ordre précis : la projection horizontale, la projection verticale, le rayon de l'ombre (radius) et la couleur. Utiliser la valeur `inset` pour les ombres intérieures.

```css
div1 { box-shadow: 5px -5px 10px #040404; }    /* ombre à droite et en bas */
div2 { box-shadow: 0px 0px 4px #040404; }      /* ombre centrée */
div3 { box-shadow: 0px 0px 4px #040404 inset; } /* ombre projetée intérieure */
```

- En horizontal, les valeurs positives projettent l'ombre vers la droite et les valeurs négatives vers la gauche
- En vertical, les valeurs positives projettent l'ombre vers le bas et les valeurs négatives vers le haut

---

## Les autres

### `clear`

Arrêter de faire flotter des éléments.

```css
h1 { float; left; }
p1 { float; right; }
p2 { clear; right; }
```

- `right;`
- `left;`
- `both;` (right et left)
- `none;`

### `float` : flotter

Indiquer qu'un élément doit être retiré du flux normal et doit être placé sur le côté droit ou sur le côté gauche de son conteneur. Le texte et les autres éléments en ligne (inline) entoureront alors l'élément flottant. L'élément est retiré du flux normal de la page mais s'inscrit toujours dans le flux.

- `right;`
- `left;`
- `inline-start;`
- `inline-end;`
- `none;`

```css
h1 { float; left; }
p  { float; right; }
/* Les deux éléments sont sur la même ligne, le h1 à gauche et le p à droite */
```

---

## `grid` : grille

La grille s'applique à l'élément parent du contenu.

Une grille est constituée :

- **de lignes** (Grid lines) : elles peuvent être horizontales ou verticales et sont numérotées en commençant à l'index 1. Elles sont représentées en pointillés sur le schéma
- **de pistes** (Grid tracks) : elles désignent les espaces entre les lignes
- **de cellules** (Cells) : elles sont délimitées par les intersections entre les lignes horizontales et verticales
- **d'aires** (Grid area) : une ou plusieurs cellules adjacentes formant un rectangle

Propriétés :

- `grid-template-rows` pour contrôler la façon dont les lignes s'affichent
- `grid-template-columns` pour contrôler la façon dont les colonnes s'affichent

### Grille régulière

Colonnes et lignes identiques.

```css
.bloc-container {
  display: grid;
  grid-template-columns: 200px 200px 200px;
  grid-template-rows: 200px 200px;
}
```

Ou avec la fonction `repeat` :

```css
.bloc-container {
  display: grid;
  grid-template-columns: repeat(3, 200px);
  grid-template-rows: repeat(2, 200px);
}
```

### Grille irrégulière

Colonnes différentes et lignes identiques.

```css
.bloc-container {
  display: grid;
  grid-template-columns: 200px 100px 300px;
  grid-template-rows: 100px 300px;
}
```

### Les fractions

On peut utiliser le format « fractions » avec l'unité `fr`.

```css
display: grid;
grid-template-columns: 1fr 2fr 1fr 1fr;
grid-template-rows: 1fr 1fr;
height: 400px;
border: 1px solid black;
gap: 10px;
```

### Définir la position

Définir la disposition des éléments d'une grille, c'est donner la position de départ et d'arrivée de chaque élément par rapport aux lignes.

```css
.element-1 {
  grid-column-start: 1;
  grid-column-end: 4;
}
```

La première ligne désigne le bord gauche de la grille, donc c'est bien la ligne 4 qui désigne le bord de droite sur une grille de 3 colonnes.

### Renvoi à la ligne

On peut utiliser `auto-fill` dans la fonction `repeat` pour renvoyer à la ligne automatiquement.

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 100px);
  grid-gap: 20px;
}
```

### Minimum et maximum

Définir la taille minimale et maximale.

```css
.bloc-container {
  display: grid;
  grid-template-rows: minmax(100px, auto);
  grid-template-columns: repeat(3, 1fr);
  text-align: center;
}
```

---

## Dimensions et espacement

### `height` : hauteur

- `height` : définir la hauteur
- `max-height` : définir la hauteur maximale
- Absolu : `px` = pixel / `pt` = point
- Relatif : `%`
- `auto;`

### `margin`

Modifier les marges extérieures de la boîte.

- Absolu : `px` = pixel / `pt` = point
- Relatif : `%`
- `auto;` pour centrer
- Si 4 valeurs dans la même ligne = `top` `right` `bottom` `left`
- Si 2 valeurs dans la même ligne = (`top` et `bottom`) (`right` et `left`)

### `object-fit`

Définir la façon dont le contenu doit s'adapter à son conteneur en utilisant sa largeur et sa hauteur (garde le ratio).

- `contain;`
- `hidden;`

### `overflow`

Gérer le débordement des éléments. Ex : si un texte dépasse son élément parent.

- `visible;` (élément visible)
- `hidden;` (ce qui dépasse sera coupé)
- `scroll;` (cache ce qui dépasse mais ajoute une barre de défilement à tout le contenu)
- `auto;` (le navigateur décide du meilleur choix)
- `initial;` (valeur par défaut)
- `inherit;` (hérite du style parent)

### `padding`

Modifier la marge intérieure de la boîte.

- Absolu : `px` = pixel / `pt` = point
- Relatif : `%`
- `auto;` pour centrer
- Si 4 valeurs dans la même ligne = `top` `right` `bottom` `left`
- Si 2 valeurs dans la même ligne = (`top` et `bottom`) (`right` et `left`)

### `position`

Positionner précisément des éléments dans la page par rapport à leur origine.

- `static;` (position par défaut)
- `relative;` (déplace l'élément par rapport à la position statique)
- `fixed;` (fixe des éléments sur la page, sort du flux de la page)
- `absolute;` (positionner un élément à un endroit précis par rapport à son élément parent)

```css
p1 { position: relative; left: 50px; }
```

### `width` et `max-width`

- `width` : définir la largeur
- `max-width` : définir la largeur maximale
- Absolu : `px` = pixel / `pt` = point
- Relatif : `%`
- `auto;`

### `z-index`

Mettre un élément en avant ou en arrière.

- Absolu : sans unité
- Plus la valeur est forte, plus l'élément sera en avant, et inversement

```css
h1 { z-index: 1000; }
h2 { z-index: 800; }
```

---

## Intégrer les polices Google Fonts

1. Choisir la police souhaitée sur <https://fonts.google.com/>
2. Cliquer sur le bouton « Get font »
3. Cliquer sur le bouton « `<>` Get embed code »
4. Sélectionner le style de la police si besoin avec « One value »
5. Copier le premier bloc de code et le coller dans `<head>` du fichier HTML

```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400..800&display=swap" rel="stylesheet">
</head>
```

6. Copier le second bloc à partir de `font-family:` et le coller dans `body` du fichier CSS

```css
body {
  font-family: "Baloo 2", sans-serif;
  font-optical-sizing: auto;
  font-weight: <weight>;
  font-style: normal;
}
```

---

## Notation « long-hand » et « short-hand »

Convertir l'écriture courante en écriture sténographique (attention à bien respecter l'ordre des valeurs).

**Long-hand :**

```css
p1 {
  font-style: italic;
  font-weight: normal;
  font-size: 16px;
  line-height: 24px;
  font-family: Verdana, sans serif;
  padding-top: 20px;
  padding-bottom: 15px;
  padding-right: 0px;
  padding-left: 50px;
  border-width: 5px;
  border-style: solid;
  border-color: blue;
  margin-top: 20px;
  margin-bottom: 15px;
  margin-right: 10px;
  margin-left: 5px;
  background-color: #FFF;
  background-image: url("coucher-soleil-1.jpg");
  background-repeat: no-repeat;
  background-attachment: scroll;
  background-position: top left;
}
```

**Short-hand :**

```css
p2 {
  font: italic normal 16px/24px verdana, sans-serif;
  padding: 20px 15px 0px 50px;
  border: 5px solid blue;
  margin: 20px 15px 10px 5px;
  background: #FFF url("coucher-soleil-1.jpg") no-repeat scroll top left;
}
```

---

## Les media queries

Afficher ou organiser les différentes pages internet en fonction des écrans des utilisateurs.

Mettre de préférence les règles media queries en bas de page CSS.

La syntaxe d'une media query ressemble à ceci :

```css
@media media_type and (media_features)
```

### `<media_type>`

Décrit la catégorie d'appareil.

- `all` : appliquer la règle à tous les types d'appareils
- `print` : utilisé pour un document destiné à être imprimé (papier)
- `screen` : utilisé pour tous les types d'écran (le plus utilisé)
- `speech` : pour les synthétiseurs de parole

### `<media_features>`

Décrit des règles pour lesquelles la media query sera appliquée.

- `min-width` : largeur minimale
- `max-width` : largeur maximale
- `resolution` : la densité de pixels pour l'appareil d'affichage
- `orientation` : l'orientation de la zone d'affichage

### Exemples

```css
@media screen and (max-width: 680px) {
  body { background-color: orange; } /* L'arrière-plan est orange pour les écrans inférieurs à 680px */
}

@media screen and (min-width: 681px) and (max-width: 1280px) {
  body { background-color: blue; } /* L'arrière-plan est bleu pour les écrans entre 681px et 1280px */
}

@media screen and (max-width: 780px) {
  body {
    border-right: none;
    border-left: none;
    margin-right: 0px;
    margin-left: 0px;
  }
  /* Si l'écran de l'utilisateur est inférieur à 780px, les bordures et les marges de droite et gauche ne sont plus visibles */
}

@media screen and (orientation: landscape)
/* pour l'orientation de l'écran : landscape = paysage, portrait = portrait */
```

### Points de rupture

En responsive design, un point de rupture (ou *breakpoint*) est un point auquel la media query se déclenche (et la mise en page s'adapte).

Les tailles d'écran les plus utilisées :

| Appareil | Largeur | Précision |
|---|---|---|
| Mobile en portrait | 320px à 414px | Appareils avec des écrans de 4" à 6,9" |
| Mobile en paysage | 568px à 812px | Idem, mais en paysage |
| Tablette en portrait | 768px à 834px | Appareils de 7" à 10" |
| Tablette en paysage | 1024px à 1112px | Idem, mais aussi tablettes 12" en portrait |
| Ordinateurs portables et de bureau | > 1200px | Varie beaucoup, mais généralement 1200px et plus |

---

## Les variables

Créer des entités contenant des valeurs spécifiques utilisables à travers le document. Les déclarations se font en haut de la page.

En haut de page :

```css
root {
  –primary-color: #bleu;
  –secondary-color: #purple;
}
```

Dans la page :

```css
nabvar: var(–primary-color);
div: var(--primary-color);
```

On peut également utiliser les variables dans beaucoup de situations, quelques exemples :

- les couleurs
- les polices (principale, titre…)
- les tailles de police (principale, titre de niveau 1, titre de niveau 2…)
- les espacements (afin d'avoir un système d'espacement cohérent, une base de multiples de 8px est souvent utilisée en graphisme web)
- la taille des principaux éléments (largeur du conteneur principal, hauteur de la navbar…)
- les valeurs pour les transitions et animations, etc.

---

## Le CSS imbriqué

L'imbrication CSS (ou *nesting*) est la possibilité de définir les règles de style d'un élément à l'intérieur d'un autre. Au lieu de répéter plusieurs fois le même sélecteur pour styliser des éléments enfants spécifiques ou des pseudo-sélecteurs, on peut les imbriquer sous un seul sélecteur.

L'imbrication permet de regrouper les styles associés et d'écrire le CSS sous une hiérarchie imbriquée, rendant le code plus organisé et lisible.

Le CSS imbriqué est disponible nativement depuis 2023, avec l'introduction de cette fonctionnalité dans les spécifications CSS officielles.

**CSS non imbriqué :**

```css
header {
  width: 80%;
  color: #22232e;
}

header:hover {
  color: #636363;
}

header h1 {
  font-size: 2rem;
}

header p {
  font-size: 1rem;
  margin: 25px 0px 25px;
}

header p a {
  color: #00c2cb;
}

header p a:hover {
  color: #008a92;
}
```

**CSS imbriqué :**

```css
header {
  width: 80%;
  color: #22232e;

  &:hover {
    color: #636363;
  }

  h1 {
    font-size: 2rem;
  }

  p {
    font-size: 1rem;
    margin: 25px 0px 25px;

    a {
      color: #00c2cb;

      &:hover {
        color: #008a92;
      }
    }
  }
}
```

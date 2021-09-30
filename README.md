# ipxact-elec
V3 of IPXact Tool. Build with electronJS using electron-forge typescript-webpack template and ReactJS.

### Technologies utilisées

-	`Framework Front-End` : ReactJS, TailwindCSS (avec PostCSS)
-	`Packager` : ElectronJS – avec Electron Forge (Webpack + TypeScript)
-	`Package Manager` : yarn (ne pas utiliser NPM !!)
-	`Gestion du state` : Redux (react-redux)
-	`Design-Patterns` : Reducers + Flux (via Redux), passement de props (max 3 niveaux)
-	`Langages` : TypeScript (TS)
-	Communication Front-End (React) et Back-End (Electron) via IPC 
-	Communication IHM / Environnement Python Compilé via child_process (NodeJS)
-	Communication IHM / Environnement Python en développement (.py) via PythonShell (NodeJS)
-	`Linter et outils syntaxiques` : StyleLint,  ESLint, Prettier, Babel
-	`Philosophie adoptée` : 
    * Le code respecte les standards ES6
    * Le code doit utiliser les hooks et la nouvelle syntaxe de React (components fonctionnels, pas de class)
    * Le code est strictement linter pour eviter la confusion (2 indents… voir ESlint)
    * La nomenclature employée est elle aussi stricte : mon-component.tsx (fichier) donne const MonComponent (component)
    * Les modals ne s’exportent pas par défaut 
    * Respecter un maximum de 3 passement de props, au delas utilisation de redux


La partie python est aujourd’hui dans un environnement propre (dans `/src/python`) :
-	Librairies utilisées : CxFreeze, openPyxl, IPYXact


### Installation :

* avoir NodeJS et yarn
* yarn install (pour installer tous les packages)
* yarn start (pour lancer l'IHM en dev)
* yarn package --plateform win32 (pour compiler juste l'IHM)

* l'`engine python` se trouve dans `src/python`
* pour compiler l'engine (chaque exporter + parser) copier la sortie de build de cxfreeze dans :
    * `.webpack/renderer/static/decoder/win32` pour le parser
    * `.webpack/renderer/static/exporters/win32` pour les exports
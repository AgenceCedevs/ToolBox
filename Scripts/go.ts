// npm run go

import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const racine: string = join(dirname(fileURLToPath(import.meta.url)), "..");
const dossierDocs: string = join(racine, "DOCS");
const fichierSommaire: string = join(dossierDocs, "Sommaire.md");

const git = (...args: string[]): string =>
	execFileSync("git", args, { cwd: racine, encoding: "utf8" }).trim();

const listerMarkdown = (dossier: string): string[] =>
	readdirSync(dossier, { withFileTypes: true }).flatMap((entree) => {
		const chemin: string = join(dossier, entree.name);
		if (entree.isDirectory()) return listerMarkdown(chemin);
		return entree.name.endsWith(".md") && chemin !== fichierSommaire
			? [chemin]
			: [];
	});

const genererSommaire = (): string => {
	const fichiers: string[] = listerMarkdown(dossierDocs)
		.map((chemin) => relative(dossierDocs, chemin).split(sep).join("/"))
		.sort((a, b) => a.localeCompare(b, "fr"));

	const groupes = new Map<string, string[]>();
	for (const fichier of fichiers) {
		const dossier: string = fichier.includes("/")
			? fichier.slice(0, fichier.lastIndexOf("/"))
			: "";
		groupes.set(dossier, [...(groupes.get(dossier) ?? []), fichier]);
	}

	const lignes: string[] = ["# Sommaire", ""];
	for (const [dossier, liste] of groupes) {
		if (dossier !== "") lignes.push(`## ${dossier.replaceAll("/", " / ")}`, "");
		for (const fichier of liste) {
			const nom: string = (fichier.split("/").pop() ?? fichier)
				.replace(/\.md$/, "")
				.replace(/^#+/, "")
				.replaceAll("_", " ");
			const lien: string = encodeURI(fichier).replaceAll("#", "%23");
			lignes.push(`- [${nom}](${lien})`);
		}
		lignes.push("");
	}
	return `${lignes.join("\n")}`;
};

const prochainNumero = (): number => {
	try {
		const dernier: string = git("log", "-1", "--format=%s");
		return /^\d+$/.test(dernier) ? Number(dernier) + 1 : 1;
	} catch {
		return 1;
	}
};

writeFileSync(fichierSommaire, genererSommaire(), "utf8");
console.log("Sommaire mis à jour");

git("add", "-A");
if (git("status", "--porcelain") === "") {
	console.log("Rien à commiter.");
} else {
	const numero: string = String(prochainNumero());
	git("commit", "-m", numero);
	console.log(`Commit ${numero}`);
	git("push");
	console.log("Push effectué");
}

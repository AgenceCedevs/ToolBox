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

	const lignes: string[] = ["# Sommaire", ""];

	const ecrireListe = (prefixe: string, profondeur: number): void => {
		const indentation: string = "  ".repeat(profondeur);
		const enfants: string[] = fichiers
			.filter((f) => f.startsWith(prefixe))
			.map((f) => f.slice(prefixe.length));

		const fichiersDirects: string[] = enfants.filter((f) => !f.includes("/"));
		const sousDossiers: string[] = [
			...new Set(
				enfants
					.filter((f) => f.includes("/"))
					.map((f) => f.split("/")[0] ?? ""),
			),
		];

		for (const nomFichier of fichiersDirects) {
			const nom: string = nomFichier
				.slice(0, -3)
				.replaceAll("#", "")
				.replaceAll("_", " ");
			const lien: string = encodeURI(prefixe + nomFichier).replaceAll(
				"#",
				"%23",
			);
			lignes.push(`${indentation}- [${nom}](${lien})`);
		}

		for (const dossier of sousDossiers) {
			lignes.push("", `${indentation}- **${dossier}**`);
			ecrireListe(`${prefixe}${dossier}/`, profondeur + 1);
		}
	};

	const dossiersRacine: string[] = [
		...new Set(
			fichiers.filter((f) => f.includes("/")).map((f) => f.split("/")[0] ?? ""),
		),
	];

	for (const dossier of dossiersRacine) {
		lignes.push(`## ${dossier}`, "");
		ecrireListe(`${dossier}/`, 0);
		lignes.push("");
	}

	return lignes.join(String.fromCharCode(10));
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

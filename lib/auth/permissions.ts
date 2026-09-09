import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

/* Access control for the two OROS roles (§3 du cahier des charges).
   Pasteur = accès total. Assistante = tout sauf la suppression définitive
   (voir CLAUDE.md > Règles métier clés — pas de workflow d'approbation,
   juste un refus au niveau du rôle). "membre" ici couvre aussi
   serviteurs/départements : ce sont tous des mutations sur la même fiche. */
const statement = {
  ...defaultStatements,
  membre: ["create", "update", "delete", "export"],
} as const;

export const ac = createAccessControl(statement);

export const pasteur = ac.newRole({
  membre: ["create", "update", "delete", "export"],
  ...adminAc.statements,
});

export const assistante = ac.newRole({
  membre: ["create", "update", "export"],
});

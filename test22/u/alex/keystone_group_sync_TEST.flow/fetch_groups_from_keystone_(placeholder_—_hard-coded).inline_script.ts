/**
 * STEP 1 — Source of truth.
 *
 * This is the placeholder step. Replace the body of `main` with a real call to
 * Keystone (or whichever system owns your group membership). Everything
 * downstream only depends on the SHAPE of the return value, so as long as you
 * return the same structure, step 2 needs no changes.
 */

export type SourceGroup = {
  /** Group name as it exists in the source system. Spaces and case are fine — step 2 normalizes. */
  name: string
  /** Optional human-readable description, surfaced in the Windmill groups UI. */
  summary?: string
  /** Full membership list. This is authoritative: anyone absent is removed from the group in Windmill. */
  emails: string[]
  /**
   * Optional instance-level role granted to every member.
   * Only "superadmin" and "devops" are accepted; null/undefined means no instance role.
   * This is NOT the per-workspace role (admin/developer/operator) — that is configured
   * per workspace under Workspace settings → User management.
   */
  instance_role?: "superadmin" | "devops" | null
}

export async function main(): Promise<SourceGroup[]> {
  // ---------------------------------------------------------------------------
  // REPLACE EVERYTHING BELOW WITH YOUR KEYSTONE CALL.
  //
  // Sketch of what that looks like:
  //
  //   import * as wmill from "windmill-client"
  //
  //   const apiKey = await wmill.getVariable("u/admin/keystone_api_key")
  //   const res = await fetch("https://keystone.internal/api/v1/groups?app=windmill", {
  //     headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
  //   })
  //   if (!res.ok) {
  //     throw new Error(`Keystone returned ${res.status}: ${await res.text()}`)
  //   }
  //   const payload = await res.json()
  //   return payload.groups.map((g) => ({
  //     name: g.display_name,
  //     summary: g.description,
  //     emails: g.members.map((m) => m.email),
  //     instance_role: null,
  //   }))
  //
  // Two things to preserve when you swap this out:
  //   1. Throw on a failed fetch. Returning [] on error would look to step 2 like
  //      "every group was deleted upstream". Step 2 has a guard for this
  //      (max_deletions), but failing loudly here is the real protection.
  //   2. Return the COMPLETE membership of each group, not a delta. Step 2
  //      reconciles against full state.
  // ---------------------------------------------------------------------------

  return [
    {
      name: "Parks Platform Admins",
      summary: "Platform team — full admin",
      emails: ["ada.lovelace@example.com", "grace.hopper@example.com"],
      instance_role: null,
    },
    {
      name: "Parks Platform Developers",
      summary: "Platform team — developers",
      emails: [
        "ada.lovelace@example.com",
        "alan.turing@example.com",
        "katherine.johnson@example.com",
      ],
      instance_role: null,
    },
    {
      name: "Attractions Ops",
      summary: "Attractions team — operators",
      emails: ["margaret.hamilton@example.com", "annie.easley@example.com"],
      instance_role: null,
    },
  ]
}

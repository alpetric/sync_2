/**
 * STEP 2 — Full reconciliation of Windmill instance groups against a source of truth.
 *
 * Takes the complete desired state from step 1 and makes Windmill match it:
 * creates missing groups, deletes managed groups that disappeared upstream, and
 * adds/removes members so each group's membership is exactly what step 1 returned.
 *
 * This is the same end state SCIM 2.0 would produce, driven over the public API instead.
 */

import * as wmill from "windmill-client"

type SourceGroup = {
  name: string
  summary?: string
  emails: string[]
  instance_role?: "superadmin" | "devops" | null
}

type InstanceGroup = {
  name: string
  summary?: string
  emails?: string[]
  instance_role?: string | null
}

type Operation = {
  op:
    | "create_group"
    | "delete_group"
    | "update_summary_or_role"
    | "add_member"
    | "remove_member"
  group: string
  email?: string
  detail?: string
}

/**
 * Windmill normalizes group names on create (backend `convert_name`): spaces become
 * underscores and the name is lowercased. The other endpoints take the name verbatim
 * in the URL path and do NOT normalize, so a name that round-trips through create
 * unchanged is the only name the member/update/delete calls will resolve.
 */
function normalizeGroupName(name: string): string {
  return name.replace(/ /g, "_").toLowerCase()
}

/** Windmill lowercases emails on user creation; match that so membership rows line up. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function main(
  /** Output of step 1 — the complete desired state. */
  desired_groups: SourceGroup[],

  /**
   * Only instance groups whose name starts with this prefix are considered "managed"
   * by this flow. Groups outside it are never modified or deleted, so instance groups
   * you create by hand in the UI are safe. Set to "" to manage every instance group.
   */
  managed_prefix = "keystone_",

  /** When true (the default) nothing is written — the flow returns the plan it would apply. */
  dry_run = true,

  /** When false, managed groups missing from step 1 are left in place instead of deleted. */
  delete_removed_groups = true,

  /**
   * Abort before writing anything if the plan would delete more than this many groups.
   * Guards against an upstream outage that returns a short or empty list.
   */
  max_deletions = 3,

  /**
   * Path to a Windmill secret variable holding a token for a SUPERADMIN user.
   * Every /api/groups/* endpoint used here is superadmin-gated; a workspace-admin
   * token returns 401.
   */
  token_variable = "u/admin/windmill_superadmin_token",

  /** Defaults to this instance's own base URL. */
  base_url = "",
) {
  const token = await wmill.getVariable(token_variable)
  const base = (base_url || process.env["WM_BASE_URL"] || "").replace(/\/$/, "")
  if (!base) {
    throw new Error(
      "base_url is empty and WM_BASE_URL is unset — pass base_url explicitly (e.g. https://windmill.internal)",
    )
  }

  async function api(method: string, path: string, body?: unknown): Promise<string> {
    const res = await fetch(`${base}/api${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
    const text = await res.text()
    if (!res.ok) {
      throw new Error(`${method} ${path} → ${res.status}: ${text}`)
    }
    return text
  }

  // ---- Desired state -------------------------------------------------------

  const desired = new Map<string, { summary: string; role: string | null; emails: Set<string> }>()
  for (const g of desired_groups) {
    if (!g?.name) throw new Error(`Source group is missing a name: ${JSON.stringify(g)}`)
    const name = managed_prefix + normalizeGroupName(g.name)
    if (desired.has(name)) {
      throw new Error(
        `Two source groups normalize to the same Windmill name "${name}" — rename one upstream`,
      )
    }
    desired.set(name, {
      summary: g.summary ?? "",
      role: g.instance_role ?? null,
      emails: new Set((g.emails ?? []).map(normalizeEmail).filter(Boolean)),
    })
  }

  // ---- Current state -------------------------------------------------------

  const current: InstanceGroup[] = JSON.parse(await api("GET", "/groups/list"))
  const managed = new Map<string, { summary: string; role: string | null; emails: Set<string> }>()
  for (const g of current) {
    if (!g.name.startsWith(managed_prefix)) continue
    managed.set(g.name, {
      summary: g.summary ?? "",
      role: g.instance_role ?? null,
      emails: new Set((g.emails ?? []).map(normalizeEmail)),
    })
  }

  // ---- Diff ----------------------------------------------------------------

  const plan: Operation[] = []

  for (const [name, want] of desired) {
    const have = managed.get(name)
    if (!have) {
      plan.push({ op: "create_group", group: name, detail: want.summary })
      for (const email of want.emails) plan.push({ op: "add_member", group: name, email })
      if (want.role) {
        plan.push({ op: "update_summary_or_role", group: name, detail: `role=${want.role}` })
      }
      continue
    }
    if (have.summary !== want.summary || have.role !== want.role) {
      plan.push({
        op: "update_summary_or_role",
        group: name,
        detail: `summary="${want.summary}" role=${want.role ?? "none"}`,
      })
    }
    for (const email of want.emails) {
      if (!have.emails.has(email)) plan.push({ op: "add_member", group: name, email })
    }
    for (const email of have.emails) {
      if (!want.emails.has(email)) plan.push({ op: "remove_member", group: name, email })
    }
  }

  const removed = [...managed.keys()].filter((name) => !desired.has(name))
  if (delete_removed_groups) {
    for (const name of removed) plan.push({ op: "delete_group", group: name })
  }

  const deletions = plan.filter((p) => p.op === "delete_group").length
  if (deletions > max_deletions) {
    throw new Error(
      `Refusing to apply: plan would delete ${deletions} groups (max_deletions=${max_deletions}). ` +
        `Groups: ${removed.join(", ")}. This usually means the source system returned a partial list. ` +
        `Raise max_deletions only once you have confirmed the deletions are intended.`,
    )
  }

  const summary = {
    dry_run,
    managed_prefix,
    source_groups: desired.size,
    managed_groups_in_windmill: managed.size,
    to_create: plan.filter((p) => p.op === "create_group").length,
    to_delete: deletions,
    to_update: plan.filter((p) => p.op === "update_summary_or_role").length,
    members_to_add: plan.filter((p) => p.op === "add_member").length,
    members_to_remove: plan.filter((p) => p.op === "remove_member").length,
    groups_left_untouched: current.length - managed.size,
  }

  if (dry_run) {
    return { ...summary, plan, applied: [], errors: [] }
  }

  // ---- Apply ---------------------------------------------------------------
  //
  // Ordered so a rename upstream (delete + create of a different name) cannot drop
  // a member that the new group still needs: creates and member adds run before
  // any deletion.

  const order: Record<Operation["op"], number> = {
    create_group: 0,
    update_summary_or_role: 1,
    add_member: 2,
    remove_member: 3,
    delete_group: 4,
  }
  plan.sort((a, b) => order[a.op] - order[b.op])

  const applied: Operation[] = []
  const errors: (Operation & { error: string })[] = []

  for (const step of plan) {
    try {
      switch (step.op) {
        case "create_group":
          // Idempotent server-side (ON CONFLICT DO NOTHING).
          await api("POST", "/groups/create", { name: step.group, summary: step.detail ?? "" })
          break
        case "update_summary_or_role": {
          // new_summary is required by this endpoint even when only the role changes.
          const want = desired.get(step.group)!
          await api("POST", `/groups/update/${encodeURIComponent(step.group)}`, {
            new_summary: want.summary,
            instance_role: want.role ?? "",
          })
          break
        }
        case "add_member":
          await api("POST", `/groups/adduser/${encodeURIComponent(step.group)}`, {
            email: step.email,
          })
          break
        case "remove_member":
          await api("POST", `/groups/removeuser/${encodeURIComponent(step.group)}`, {
            email: step.email,
          })
          break
        case "delete_group":
          await api("DELETE", `/groups/delete/${encodeURIComponent(step.group)}`)
          break
      }
      applied.push(step)
    } catch (e) {
      errors.push({ ...step, error: e instanceof Error ? e.message : String(e) })
    }
  }

  const result = { ...summary, applied, errors }

  if (errors.length > 0) {
    // Surface as a job failure so the schedule's error handler fires, but only after
    // every independent operation has been attempted.
    throw new Error(
      `Reconciliation completed with ${errors.length} failed operation(s): ` +
        JSON.stringify(result, null, 2),
    )
  }

  return result
}

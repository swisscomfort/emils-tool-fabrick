"use server";

import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getProjects(userId: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProject(userId: string, project: {
  name: string;
  repo_url?: string;
  owner?: string;
  status?: string;
}) {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      ...project,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(projectId: string, updates: Partial<{
  name: string;
  repo_url: string;
  owner: string;
  status: string;
}>) {
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function logAction(projectId: string, action: {
  type: string;
  payload?: Record<string, unknown>;
  result?: Record<string, unknown>;
  status?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("actions")
    .insert({
      project_id: projectId,
      ...action,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createBuild(projectId: string, build: {
  platform: string;
  status?: string;
  output_url?: string;
  logs?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("builds")
    .insert({
      project_id: projectId,
      ...build,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBuild(buildId: string, updates: Partial<{
  platform: string;
  status: string;
  output_url: string;
  logs: string;
}>) {
  const { data, error } = await supabaseAdmin
    .from("builds")
    .update(updates)
    .eq("id", buildId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

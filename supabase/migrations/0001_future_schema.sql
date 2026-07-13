-- Future-state schema scaffold for BBE Brand Doctor.
-- Not required for the JSON-first prototype.

create table brands (
  brand_id text primary key,
  brand_name text not null,
  parent_company text,
  default_portfolio_role text
);

create table category_lenses (
  category_lens_id text primary key,
  name text not null,
  source_system text,
  valid_for jsonb not null default '[]',
  not_valid_for jsonb not null default '[]',
  known_blind_spots jsonb not null default '[]'
);

create table source_periods (
  source_period_id text primary key,
  source_system text not null,
  period_label text not null,
  start_date date,
  end_date date,
  caveat text
);

create table brand_metric_facts (
  fact_id text primary key,
  brand_id text references brands(brand_id),
  category_lens_id text references category_lenses(category_lens_id),
  source_period_id text references source_periods(source_period_id),
  metric_name text not null,
  value_numeric numeric,
  value_text text,
  ahead_status text,
  momentum_status text,
  category_band text,
  source_file text
);

create table diagnosis_definitions (
  diagnosis_id text primary key,
  name text not null,
  plain_english_definition text,
  trigger_logic jsonb,
  treatment_families jsonb
);

create table treatment_definitions (
  treatment_id text primary key,
  name text not null,
  tier text,
  family text,
  description text,
  best_for jsonb,
  not_for jsonb,
  time_to_impact text,
  cost text,
  difficulty text,
  likelihood text,
  owners jsonb,
  dependencies jsonb,
  expected_metric_movement jsonb,
  follow_up_signals jsonb
);

create table diagnosis_treatment_links (
  diagnosis_id text references diagnosis_definitions(diagnosis_id),
  treatment_id text references treatment_definitions(treatment_id),
  priority int,
  why_this_fits text,
  primary key (diagnosis_id, treatment_id)
);

create table evidence_items (
  evidence_id text primary key,
  brand_id text references brands(brand_id),
  source_type text,
  source_ref text,
  claim text,
  role text,
  caveat text
);

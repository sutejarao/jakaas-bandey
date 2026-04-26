-- Players table
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text default 'player',
  avatar_initial text,
  created_at timestamptz default now()
);

-- Nominations table
create table nominations (
  id uuid primary key default gen_random_uuid(),
  from_player_id uuid references players(id),
  to_player_id uuid references players(id),
  category text not null,
  coins integer not null check (coins between 1 and 10),
  note text,
  month_year text not null,
  created_at timestamptz default now()
);

-- Monthly results table
create table monthly_results (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id),
  month_year text not null,
  total_coins integer,
  rank integer,
  archived_at timestamptz default now()
);

-- Categories table
create table categories (
  id uuid primary key default gen_random_uuid(),
  emoji text,
  label text not null
);

insert into categories (emoji, label) values
  ('🏅', 'Best catch'),
  ('⭐', 'Top scorer'),
  ('😂', 'Best banter'),
  ('💪', 'Most effort'),
  ('🎯', 'Match winner'),
  ('🤝', 'Team player');

-- Enable Row Level Security
alter table players enable row level security;
alter table nominations enable row level security;
alter table monthly_results enable row level security;
alter table categories enable row level security;

-- Players: anyone authenticated can read, insert own row
create policy "Players readable by all" on players for select using (true);
create policy "Players insertable by authenticated" on players for insert with check (true);
create policy "Players updatable by admin" on players for update using (true);

-- Nominations: authenticated can read all, insert own
create policy "Nominations readable by all" on nominations for select using (true);
create policy "Nominations insertable by authenticated" on nominations for insert with check (true);
create policy "Nominations deletable by admin" on nominations for delete using (true);

-- Monthly results: readable by all
create policy "Results readable by all" on monthly_results for select using (true);
create policy "Results insertable by admin" on monthly_results for insert with check (true);
create policy "Results upsertable by admin" on monthly_results for update using (true);

-- Categories: readable by all
create policy "Categories readable by all" on categories for select using (true);

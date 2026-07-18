CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  icon_url TEXT
);

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  page_slug TEXT
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  played_on TEXT,
  game_id INTEGER REFERENCES games(id),
  notes TEXT,
  source_row INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS match_players (
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id),
  PRIMARY KEY (match_id, player_id)
);

CREATE TABLE IF NOT EXISTS match_winners (
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id),
  PRIMARY KEY (match_id, player_id)
);

CREATE TABLE IF NOT EXISTS prizes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL REFERENCES players(id),
  awarded_on TEXT NOT NULL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS betrayal_chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chapter TEXT,
  played_on TEXT,
  haunt TEXT,
  source_row INTEGER
);

CREATE TABLE IF NOT EXISTS betrayal_family_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  family TEXT NOT NULL,
  name TEXT,
  age TEXT,
  traitor INTEGER NOT NULL DEFAULT 0,
  died INTEGER NOT NULL DEFAULT 0,
  fate TEXT,
  chapter INTEGER,
  source_row INTEGER
);

CREATE INDEX IF NOT EXISTS idx_matches_game_id ON matches(game_id);
CREATE INDEX IF NOT EXISTS idx_match_players_player_id ON match_players(player_id);
CREATE INDEX IF NOT EXISTS idx_match_winners_player_id ON match_winners(player_id);
CREATE INDEX IF NOT EXISTS idx_prizes_player_id ON prizes(player_id);
CREATE INDEX IF NOT EXISTS idx_betrayal_family ON betrayal_family_members(family);

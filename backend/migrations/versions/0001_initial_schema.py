"""Create normalized V4YT schema, enable RLS and protect point ledger.

Revision ID: 0001_initial
"""
from alembic import op
from app.models.base import Base
import app.models.entities  # noqa: F401

revision="0001_initial"
down_revision=None
branch_labels=None
depends_on=None

def upgrade():
    bind=op.get_bind()
    Base.metadata.create_all(bind=bind)
    op.execute("INSERT INTO roles (id,name,description,created_at,updated_at) VALUES (gen_random_uuid(),'player','Community player',now(),now()),(gen_random_uuid(),'moderator','Community moderator',now(),now()),(gen_random_uuid(),'admin','Platform administrator',now(),now()) ON CONFLICT (name) DO NOTHING")
    names=sorted(Base.metadata.tables.keys())
    for name in names:
        op.execute(f'ALTER TABLE "{name}" ENABLE ROW LEVEL SECURITY')
    op.execute("""
        CREATE OR REPLACE FUNCTION reject_point_ledger_mutation() RETURNS trigger AS $$
        BEGIN RAISE EXCEPTION 'point_transactions is append-only; add a compensating transaction'; END;
        $$ LANGUAGE plpgsql
    """)
    op.execute("CREATE TRIGGER point_transactions_immutable BEFORE UPDATE OR DELETE ON point_transactions FOR EACH ROW EXECUTE FUNCTION reject_point_ledger_mutation()")
    op.execute("""
        CREATE OR REPLACE FUNCTION enforce_active_team_captain() RETURNS trigger AS $$
        DECLARE target_team uuid;
        BEGIN
          target_team := COALESCE(NEW.team_id, OLD.team_id);
          IF EXISTS (SELECT 1 FROM teams WHERE id=target_team AND disbanded_at IS NULL)
             AND (SELECT COUNT(*) FROM team_memberships WHERE team_id=target_team AND status='active' AND role='captain') <> 1 THEN
            RAISE EXCEPTION 'active teams must have exactly one active captain';
          END IF;
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql
    """)
    op.execute("CREATE CONSTRAINT TRIGGER team_membership_requires_captain AFTER INSERT OR UPDATE OR DELETE ON team_memberships DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION enforce_active_team_captain()")
    op.execute("""
        CREATE OR REPLACE VIEW leaderboard_all_time AS
        WITH point_totals AS (
          SELECT user_id, SUM(amount) AS points, MIN(created_at) AS first_point
          FROM point_transactions GROUP BY user_id
        ), win_totals AS (
          SELECT tr.user_id, COUNT(*) AS wins FROM tournament_results tr
          JOIN tournaments t ON t.id=tr.tournament_id
          WHERE tr.placement=1 AND t.status <> 'cancelled' GROUP BY tr.user_id
        )
        SELECT u.id AS user_id, p.gamer_tag, COALESCE(pt.points,0) AS points, COALESCE(w.wins,0) AS wins,
          RANK() OVER (ORDER BY COALESCE(pt.points,0) DESC, COALESCE(w.wins,0) DESC, pt.first_point ASC NULLS LAST, u.id ASC) AS rank
        FROM users u JOIN player_profiles p ON p.user_id=u.id
        LEFT JOIN point_totals pt ON pt.user_id=u.id LEFT JOIN win_totals w ON w.user_id=u.id
        WHERE u.status='active'
    """)
    op.execute("""
        CREATE OR REPLACE VIEW leaderboard_monthly AS
        WITH point_totals AS (
          SELECT user_id,SUM(amount) AS points,MIN(created_at) AS first_point FROM point_transactions
          WHERE created_at >= date_trunc('month',now()) GROUP BY user_id
        ), win_totals AS (
          SELECT tr.user_id,COUNT(*) AS wins FROM tournament_results tr
          JOIN tournaments t ON t.id=tr.tournament_id WHERE tr.placement=1 AND t.status <> 'cancelled'
          AND t.starts_at >= date_trunc('month',now()) GROUP BY tr.user_id
        )
        SELECT u.id AS user_id,p.gamer_tag,COALESCE(pt.points,0) AS points,COALESCE(w.wins,0) AS wins,
          RANK() OVER (ORDER BY COALESCE(pt.points,0) DESC,COALESCE(w.wins,0) DESC,pt.first_point ASC NULLS LAST,u.id ASC) AS rank
        FROM users u JOIN player_profiles p ON p.user_id=u.id LEFT JOIN point_totals pt ON pt.user_id=u.id
        LEFT JOIN win_totals w ON w.user_id=u.id WHERE u.status='active'
    """)
    op.execute("""
        CREATE OR REPLACE VIEW leaderboard_per_game AS
        WITH points AS (
          SELECT pt.user_id,t.game_id,SUM(pt.amount) AS points,MIN(pt.created_at) AS first_point
          FROM point_transactions pt JOIN tournaments t ON t.id=pt.reference_id
          WHERE pt.source='tournament' GROUP BY pt.user_id,t.game_id
        ), wins AS (
          SELECT tr.user_id,t.game_id,COUNT(*) AS wins FROM tournament_results tr
          JOIN tournaments t ON t.id=tr.tournament_id WHERE tr.placement=1 AND t.status <> 'cancelled'
          GROUP BY tr.user_id,t.game_id
        )
        SELECT u.id AS user_id,p.gamer_tag,g.id AS game_id,g.name AS game_name,COALESCE(pt.points,0) AS points,COALESCE(w.wins,0) AS wins,
          RANK() OVER (PARTITION BY g.id ORDER BY COALESCE(pt.points,0) DESC,COALESCE(w.wins,0) DESC,pt.first_point ASC NULLS LAST,u.id ASC) AS rank
        FROM users u JOIN player_profiles p ON p.user_id=u.id CROSS JOIN games g
        LEFT JOIN points pt ON pt.user_id=u.id AND pt.game_id=g.id LEFT JOIN wins w ON w.user_id=u.id AND w.game_id=g.id
        WHERE u.status='active' AND g.active=true
    """)
    op.execute("""
        CREATE OR REPLACE VIEW leaderboard_teams AS
        WITH team_totals AS (
          SELECT tm.team_id,SUM(COALESCE(pts.points,0)) AS points,SUM(COALESCE(w.wins,0)) AS wins,
            MIN(pts.first_point) AS first_point
          FROM team_memberships tm JOIN teams te ON te.id=tm.team_id AND te.disbanded_at IS NULL
          LEFT JOIN (SELECT user_id,SUM(amount) AS points,MIN(created_at) AS first_point FROM point_transactions GROUP BY user_id) pts ON pts.user_id=tm.user_id
          LEFT JOIN (SELECT tr.user_id,COUNT(*) AS wins FROM tournament_results tr JOIN tournaments t ON t.id=tr.tournament_id
            WHERE tr.placement=1 AND t.status <> 'cancelled' GROUP BY tr.user_id) w ON w.user_id=tm.user_id
          WHERE tm.status='active' GROUP BY tm.team_id
        )
        SELECT te.id AS team_id,te.name,COALESCE(tt.points,0) AS points,COALESCE(tt.wins,0) AS wins,
          RANK() OVER (ORDER BY COALESCE(tt.points,0) DESC,COALESCE(tt.wins,0) DESC,tt.first_point ASC NULLS LAST,te.id ASC) AS rank
        FROM teams te LEFT JOIN team_totals tt ON tt.team_id=te.id WHERE te.disbanded_at IS NULL
    """)

def downgrade():
    op.execute("DROP VIEW IF EXISTS leaderboard_teams")
    op.execute("DROP VIEW IF EXISTS leaderboard_per_game")
    op.execute("DROP VIEW IF EXISTS leaderboard_monthly")
    op.execute("DROP VIEW IF EXISTS leaderboard_all_time")
    op.execute("DROP TRIGGER IF EXISTS point_transactions_immutable ON point_transactions")
    op.execute("DROP FUNCTION IF EXISTS reject_point_ledger_mutation()")
    op.execute("DROP TRIGGER IF EXISTS team_membership_requires_captain ON team_memberships")
    op.execute("DROP FUNCTION IF EXISTS enforce_active_team_captain()")
    Base.metadata.drop_all(bind=op.get_bind())

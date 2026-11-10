"""Persist single-elimination team matchups.

Revision ID: 0002_team_bracket
Revises: 0001_initial
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0002_team_bracket"
down_revision = "0001_initial"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "tournament_bracket_matches",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("round_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tournament_rounds.id", ondelete="CASCADE"), nullable=False),
        sa.Column("match_number", sa.Integer(), nullable=False),
        sa.Column("team1_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("teams.id", ondelete="SET NULL"), nullable=True),
        sa.Column("team2_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("teams.id", ondelete="SET NULL"), nullable=True),
        sa.Column("winner_team_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("teams.id", ondelete="SET NULL"), nullable=True),
        sa.Column("score1", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("score2", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(length=16), nullable=False, server_default="scheduled"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("round_id", "match_number", name="uq_bracket_round_match"),
        sa.CheckConstraint("match_number > 0", name="ck_bracket_match_number"),
        sa.CheckConstraint("score1 >= 0 AND score2 >= 0", name="ck_bracket_scores_nonnegative"),
        sa.CheckConstraint("status IN ('scheduled','completed','bye')", name="ck_bracket_status"),
    )
    for column in ("round_id", "team1_id", "team2_id", "winner_team_id", "status"):
        op.create_index(f"ix_tournament_bracket_matches_{column}", "tournament_bracket_matches", [column])
    op.execute("ALTER TABLE tournament_bracket_matches ENABLE ROW LEVEL SECURITY")

def downgrade():
    op.drop_table("tournament_bracket_matches")

import { FAMILY_PLAYERS } from "../config";
import { FAMILY_CLASS_NAMES } from "../constants";
import { ErrorState, LoadingState } from "../components/StatusCards";
import { useBetrayalData } from "../hooks/useBetrayalData";
import { truthy } from "../utils/truthy";
import { formatDateForDisplay } from "../utils/dates";

export function BetrayalPage({ onBack }) {
  const state = useBetrayalData();

  return (
    <main className="betrayal-page">
      <section className="betrayal-title-card">
        <div>
          <h1>Betrayal Legacy</h1>
          <p>Family Records</p>
        </div>
        <button type="button" className="back-button" onClick={onBack}>
          Back to leaderboard
        </button>
      </section>

      {state.loading ? <LoadingState label="Opening the archive" /> : null}
      {state.error ? <ErrorState message={state.error} /> : null}

      {!state.loading && !state.error && state.data ? (
        <>
          <ChapterLog chapters={state.data.chapters} />
          <section className="betrayal-family-stack">
            {state.data.familyOrder.map((family) => (
              <FamilyCard key={family} family={family} members={state.data.familiesByName[family]} />
            ))}
          </section>
        </>
      ) : null}
    </main>
  );
}

function ChapterLog({ chapters }) {
  return (
    <section className="betrayal-record-card">
      <div className="betrayal-section-header">
        <h2>Chapter</h2>
      </div>
      <div className="table-wrap betrayal-table-wrap">
        <table className="betrayal-table chapter-table">
          <colgroup>
            <col className="chapter-col" />
            <col className="date-col" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Chapter</th>
              <th>Date</th>
              <th>Haunt</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((chapter) => (
              <tr key={`${chapter.chapter}-${chapter.rowIndex}`}>
                <td>
                  <strong>{chapter.chapter || "-"}</strong>
                </td>
                <td>
                  <strong>{formatDateForDisplay(chapter.date) || "-"}</strong>
                </td>
                <td>
                  <strong>{chapter.haunt || "-"}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FamilyCard({ family, members }) {
  const familyClass = FAMILY_CLASS_NAMES[family] ?? "family-default";

  return (
    <section className={`betrayal-record-card betrayal-family-card ${familyClass}`}>
      <div className="betrayal-section-header">
        <h2>{family} Family</h2>
      </div>
      <div className="table-wrap betrayal-table-wrap">
        <table className="betrayal-table betrayal-family-table">
          <colgroup>
            <col className="family-name-col" />
            <col className="family-age-col" />
            <col className="family-flag-col" />
            <col className="family-flag-col" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Traitor?</th>
              <th>Died?</th>
              <th>Fate / Notes</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={`${member.name}-${member.rowIndex}`}>
                <td>{member.name || "-"}</td>
                <td>{member.age || "-"}</td>
                <td>{truthy(member.traitor) ? "Yes" : ""}</td>
                <td>{truthy(member.died) ? "Yes" : ""}</td>
                <td>{member.fate || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="betrayal-family-footer">Played by {FAMILY_PLAYERS[family] ?? "Unknown"}</footer>
    </section>
  );
}




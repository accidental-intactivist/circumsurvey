import { useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { C, FONT, PATH_COLORS } from "../styles/tokens";
import ExhibitHero from "../components/ExhibitHero";
import InlineBreadcrumb from "../components/InlineBreadcrumb";
import { useLiveCounts } from "../lib/useLiveCounts";

export default function MethodologyPage({ navigate, setExhibitContext }) {
  const { total, byPathway, loading } = useLiveCounts();

  useEffect(() => {
    if (setExhibitContext) {
      setExhibitContext({
        exhibitName: "Methodology & Demographics",
        exhibitDescription: "Methodology of the study, data collection methods, and general demographic overview."
      });
    }
  }, [setExhibitContext]);
  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: FONT.body,
      padding: "1.5rem 1.1rem 5rem",
    }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <InlineBreadcrumb currentRoute="methodology" navigate={navigate} />

        {/* Editorial introduction block */}
        <ExhibitHero
          title="Methodology & Dataset Context"
          color={C.goldBright}
          gradientColor={C.gold}
          BackgroundIcon={FileText}
          description="Understanding the bounds, biases, and composition of our dataset is critical to interpreting the results. The circumsurvey instrument is designed to address a systemic gap in official health statistics by capturing the lived, physical reality of respondents directly."
        />

        {/* Demographic summary card */}
        <div style={{
          background: C.bgSoft,
          border: `1px solid ${C.ghost}`,
          borderRadius: 8,
          padding: "1.5rem 2rem",
          marginBottom: "2.5rem",
        }}>
          <h3 style={{
            fontFamily: FONT.condensed,
            fontSize: "0.85rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: C.goldBright,
            marginBottom: "1rem",
            borderBottom: `1px solid ${C.ghost}`,
            paddingBottom: "0.5rem"
          }}>
            Survey Sample Demographics (n={loading ? "..." : total})
          </h3>
          {loading ? (
             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: C.muted }}>
               <Loader2 size={16} className="lucide-spin" />
               <span style={{ fontFamily: FONT.condensed, fontSize: "0.85rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Loading dataset totals...</span>
             </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1.5rem",
            }}>
              <div>
                <div style={{ fontSize: "1.8rem", fontFamily: FONT.display, fontWeight: 800, color: PATH_COLORS.circumcised }}>{byPathway.circumcised || 0}</div>
                <div style={{ fontSize: "0.78rem", fontFamily: FONT.condensed, textTransform: "uppercase", color: C.muted, letterSpacing: "0.05em" }}>Circumcised Cohort</div>
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontFamily: FONT.display, fontWeight: 800, color: PATH_COLORS.intact }}>{byPathway.intact || 0}</div>
                <div style={{ fontSize: "0.78rem", fontFamily: FONT.condensed, textTransform: "uppercase", color: C.muted, letterSpacing: "0.05em" }}>Intact Cohort</div>
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontFamily: FONT.display, fontWeight: 800, color: PATH_COLORS.restoring }}>{byPathway.restoring || 0}</div>
                <div style={{ fontSize: "0.78rem", fontFamily: FONT.condensed, textTransform: "uppercase", color: C.muted, letterSpacing: "0.05em" }}>Restoring Cohort</div>
              </div>
              <div>
                <div style={{ fontSize: "1.8rem", fontFamily: FONT.display, fontWeight: 800, color: PATH_COLORS.observer }}>{byPathway.observer || 0}</div>
                <div style={{ fontSize: "0.78rem", fontFamily: FONT.condensed, textTransform: "uppercase", color: C.muted, letterSpacing: "0.05em" }}>Observers (Partners/Parents/Meds)</div>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "2.5rem",
          fontSize: "1.05rem",
          lineHeight: 1.6,
          color: C.text
        }}>
          <section>
            <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.4rem", color: C.textBright, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              1. Sample Design & Selection Bias
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              The Accidental Intactivist survey is an open, web-based, opt-in questionnaire distributed primarily through online communities, advocacy networks, and social media platforms. Because respondents self-selected to participate, the resulting dataset is inherently subject to <strong>selection bias</strong>. 
            </p>
            <p>
              Professional sociological and demographic studies traditionally rely on random sampling to ensure that the sample accurately mirrors the broader population. By contrast, an opt-in survey organically attracts individuals who possess a pre-existing interest in, or strong emotional connection to, the subject matter. Consequently, the demographic distributions within this dataset—such as the ratio of intact to circumcised men—do not necessarily reflect the true global or national baselines. Researchers utilizing this tool should interpret the raw totals as a reflection of <em>these specific, engaged respondents</em> rather than the general public.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.4rem", color: C.textBright, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              2. Data Confidence & The "Official" Baseline Flaw
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              When analyzing geographic and demographic data, it is crucial to recognize the systemic limitations of "official" medical datasets. For example, the Centers for Disease Control (CDC) and the Healthcare Cost and Utilization Project (HCUP) frequently report on United States neonatal circumcision rates. While recent reports from institutions like the Johns Hopkins Medical Journal note that the national hospital discharge rate for routine infant circumcision (RIC) has dropped below 49%—making it a minority procedure for the first time in decades—widespread skepticism exists regarding these figures.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              These institutional datasets rely almost exclusively on <strong>hospital billing codes</strong> and discharge records. If a child is born in a hospital but undergoes the procedure days later at an outpatient clinic, a pediatrician’s private practice, or via a religious officiant, those events are routinely omitted from national discharge tracking. Thus, official rates often represent an absolute lower-bound rather than the comprehensive reality.
            </p>
            <p>
              <strong>The Missing Link:</strong> Because official institutional data is evasive and strictly tied to clinical billing mechanisms, this survey is positioned as an attempt to capture the <em>lived, physical reality</em> of adult men. By bypassing institutional records and asking respondents directly about their bodily status and history, this dataset provides a critical counter-narrative and a qualitative check against systemic underreporting.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.4rem", color: C.textBright, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              3. Data Weighting & Future Enhancements
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              Currently, the data presented in the Explore tool represents raw, unweighted responses. To elevate the academic rigor of this tool, future iterations will integrate global statistical baselines (such as the comprehensive estimations provided by Morris et al., 2016, and demographic data from the World Health Organization).
            </p>
            <p>
              By cross-referencing our raw sample against these global benchmarks, we will calculate an <strong>Over-representation Index</strong>. This mathematical weighting will allow the tool to dynamically highlight which specific demographics (e.g., geographic regions, generations) are statistically over-indexed in the advocacy space compared to their actual real-world population sizes, offering profound insights into cultural movement and "drift."
            </p>
          </section>

          <section style={{
            background: C.bgSoft,
            border: `1px solid ${C.ghost}`,
            borderRadius: 8,
            padding: "2rem",
            marginTop: "1rem",
            textAlign: "center"
          }}>
            <h2 style={{ fontFamily: FONT.condensed, fontSize: "1.2rem", color: C.textBright, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Raw Data Access & Reproducibility
            </h2>
            <p style={{ color: C.muted, fontSize: "0.95rem", marginBottom: "1.5rem" }}>
              Academic rigor demands radical transparency. Researchers and journalists are welcome to request the complete, fully anonymized dataset to conduct independent statistical analysis.
            </p>
            <a 
              href="mailto:tone@circumsurvey.online?subject=Circumsurvey Anonymized Dataset Request"
              style={{
                display: "inline-block",
                background: C.bgCard,
                border: `1px solid ${C.gold}`,
                color: C.goldBright,
                fontFamily: FONT.condensed,
                fontWeight: 700,
                fontSize: "0.8rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0.8rem 1.5rem",
                borderRadius: 6,
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = C.gold;
                e.target.style.color = C.bg;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = C.bgCard;
                e.target.style.color = C.goldBright;
              }}
            >
              Request Anonymized Dataset
            </a>
          </section>

        </div>
      </div>
    </div>
  );
}

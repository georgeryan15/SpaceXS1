export const FILING_META = {
  registrant: "Space Exploration Technologies Corp.",
  ticker: "SPX",
  exchange: "NYSE",
  form: "S-1",
  filedOn: "2026-05-12",
  fileNumber: "333-281544",
  fiscalYearEnd: "Dec 31",
  state: "Delaware",
  cik: "0001181412",
  agent: "Bret Johnsen",
  underwriters: ["Goldman Sachs", "Morgan Stanley", "J.P. Morgan", "Bank of America"],
};

export function S1FilingHTML() {
  return (
    <article className="prose-s1">
      <p className="stamp">
        FORM S-1 &nbsp;//&nbsp; REGISTRATION STATEMENT &nbsp;//&nbsp; UNDER THE
        SECURITIES ACT OF 1933
      </p>

      <h1>Space Exploration Technologies Corp.</h1>
      <p className="lede">
        (Exact name of registrant as specified in its charter)
      </p>

      <dl className="meta-grid">
        <dt>State of Incorporation</dt>
        <dd>Delaware</dd>
        <dt>I.R.S. Employer ID</dt>
        <dd>20-1149784</dd>
        <dt>Primary SIC Code</dt>
        <dd>3760 — Guided Missiles &amp; Space Vehicles</dd>
        <dt>Address</dt>
        <dd>1 Rocket Road, Hawthorne, CA 90250</dd>
        <dt>Telephone</dt>
        <dd>(310) 363-6000</dd>
        <dt>Filing Date</dt>
        <dd>{FILING_META.filedOn}</dd>
      </dl>

      <div className="callout">
        Approximate date of commencement of proposed sale to the public: As soon
        as practicable after the effective date of this Registration Statement.
      </div>

      <h2>Prospectus Summary</h2>
      <p>
        Space Exploration Technologies Corp. (&quot;SpaceX&quot;, the
        &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
        designs, manufactures, and operates advanced rockets, spacecraft, and a
        global satellite-based communications network. Our long-term mission is
        to make humanity a multiplanetary species. The proceeds of this offering
        will be used to accelerate development of the Starship transportation
        system, expand our Starlink constellation, and continue investment in
        manufacturing capacity at our Starbase, Hawthorne, and Roberts Road
        facilities.
      </p>

      <h3>Our Operating Segments</h3>
      <ul>
        <li>
          <strong>Launch Services.</strong> Falcon 9, Falcon Heavy, and Starship
          provide low-Earth-orbit, geostationary, lunar, and interplanetary
          transport for commercial, civil, and national security customers.
        </li>
        <li>
          <strong>Starlink.</strong> A vertically integrated broadband network
          comprising more than 7,200 active satellites and over 4.6 million
          subscribers across 102 markets as of March 31, 2026.
        </li>
        <li>
          <strong>Human Spaceflight.</strong> Crew Dragon and Starship crewed
          variants serve NASA, private astronaut missions, and lunar surface
          delivery under the Artemis program.
        </li>
      </ul>

      <h3>Selected Operating Metrics</h3>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th className="num">FY2023</th>
            <th className="num">FY2024</th>
            <th className="num">FY2025</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Successful orbital launches</td>
            <td className="num">98</td>
            <td className="num">134</td>
            <td className="num">187</td>
          </tr>
          <tr>
            <td>Starlink subscribers (millions)</td>
            <td className="num">2.3</td>
            <td className="num">3.6</td>
            <td className="num">4.6</td>
          </tr>
          <tr>
            <td>Total revenue ($B)</td>
            <td className="num">8.7</td>
            <td className="num">14.2</td>
            <td className="num">21.8</td>
          </tr>
          <tr>
            <td>Net income ($B)</td>
            <td className="num">(0.4)</td>
            <td className="num">1.1</td>
            <td className="num">2.9</td>
          </tr>
        </tbody>
      </table>

      <h2>The Offering</h2>
      <dl className="meta-grid">
        <dt>Common stock offered</dt>
        <dd>150,000,000 shares</dd>
        <dt>Greenshoe option</dt>
        <dd>22,500,000 shares</dd>
        <dt>Proposed listing</dt>
        <dd>NYSE: SPX</dd>
        <dt>Use of proceeds</dt>
        <dd>Starship R&amp;D, Starlink capex, working capital</dd>
        <dt>Lock-up period</dt>
        <dd>180 days</dd>
        <dt>Dual-class structure</dt>
        <dd>Class A (1 vote) / Class B (10 votes)</dd>
      </dl>

      <h2>Risk Factors</h2>
      <p className="lede">
        Investing in our Class A common stock involves a high degree of risk.
        You should carefully consider the following factors before making an
        investment decision.
      </p>

      <h3>Risks Related to Our Business</h3>
      <ul>
        <li>
          We operate in an industry that is, by its nature, prone to
          catastrophic failure. A single anomaly affecting a Starship vehicle,
          Falcon booster, or Crew Dragon capsule could result in loss of life,
          significant damage, indefinite grounding of our fleet, and material
          adverse effects on our financial condition.
        </li>
        <li>
          Our results depend on a limited number of customers. The U.S.
          Government accounted for 38%, 34%, and 31% of revenue in FY2023,
          FY2024, and FY2025, respectively. The loss or material reduction of
          any large customer relationship could have a disproportionate effect.
        </li>
        <li>
          The Starlink business depends on continued access to spectrum,
          regulatory approvals across more than 100 jurisdictions, and the
          continued performance of our laser-linked satellite constellation.
        </li>
        <li>
          We have a history of net losses prior to FY2024 and may not sustain
          profitability. Our capital requirements remain substantial,
          particularly for Starship vehicle production and orbital refueling
          infrastructure.
        </li>
      </ul>

      <h3>Risks Related to Regulation</h3>
      <ul>
        <li>
          Our operations are subject to extensive licensing and oversight by the
          Federal Aviation Administration, the Federal Communications
          Commission, the Department of Defense, the Department of State (ITAR /
          EAR), and corresponding international bodies. Delays, denials, or
          revocations of any required license could materially harm our
          business.
        </li>
        <li>
          Environmental reviews under NEPA for our Boca Chica, Vandenberg, and
          Cape Canaveral sites can extend cadence-relevant timelines.
        </li>
      </ul>

      <h3>Risks Related to the Offering</h3>
      <ul>
        <li>
          Our dual-class structure concentrates voting power with our founder
          and certain pre-IPO holders, who together will hold approximately 78%
          of the combined voting power of our outstanding common stock
          immediately after this offering.
        </li>
        <li>
          The trading price of our Class A common stock may be highly volatile
          and may decline regardless of our operating performance.
        </li>
      </ul>

      <h2>Use of Proceeds</h2>
      <p>
        We estimate that the net proceeds from this offering will be
        approximately <strong>$13.4 billion</strong>, assuming an initial public
        offering price of $94.00 per share (the midpoint of the price range set
        forth on the cover page of this prospectus), after deducting estimated
        underwriting discounts and commissions and estimated offering expenses
        payable by us. We intend to use the net proceeds as follows:
      </p>

      <table>
        <thead>
          <tr>
            <th>Allocation</th>
            <th className="num">$B</th>
            <th className="num">%</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Starship vehicle &amp; engine production</td>
            <td className="num">5.2</td>
            <td className="num">38.8%</td>
          </tr>
          <tr>
            <td>Starlink constellation expansion (V3 satellites)</td>
            <td className="num">3.6</td>
            <td className="num">26.9%</td>
          </tr>
          <tr>
            <td>Launch &amp; ground infrastructure</td>
            <td className="num">2.1</td>
            <td className="num">15.7%</td>
          </tr>
          <tr>
            <td>Working capital and general corporate purposes</td>
            <td className="num">1.8</td>
            <td className="num">13.4%</td>
          </tr>
          <tr>
            <td>Repayment of senior secured notes (2027)</td>
            <td className="num">0.7</td>
            <td className="num">5.2%</td>
          </tr>
        </tbody>
      </table>

      <h2>Management&apos;s Discussion and Analysis</h2>
      <p>
        Revenue grew 54% year over year in FY2025, driven primarily by
        accelerated launch cadence and continued growth in Starlink direct-to-
        consumer subscriptions. Adjusted gross margin expanded 720 basis points
        to 36.4%, reflecting maturation of Starship production economics and
        better utilization of our Hawthorne and Roberts Road facilities. We
        achieved positive operating cash flow in each of the trailing four
        quarters.
      </p>
      <p>
        Capital expenditures in FY2025 totaled $7.9 billion, of which
        approximately 61% related to Starship and 28% to Starlink. We expect
        capital intensity to remain elevated as we ramp Starship production
        toward an annualized cadence of 24 vehicles by FY2027.
      </p>

      <hr />

      <p className="stamp">
        End of excerpt &middot; § continues in Part II of the registration
        statement
      </p>
    </article>
  );
}

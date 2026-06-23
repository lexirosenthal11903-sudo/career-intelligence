/**
 * Map a person's sector/role signal to an Adzuna GB category tag.
 *
 * Why: the jobs search was a loose full-text match on AI-guessed buzzwords
 * ("media", "production"), which pulled in noise. Constraining the search to an
 * Adzuna category (their own occupation taxonomy) is the single biggest tightener
 * — it's how we stop a design grad seeing a media lawyer. We pick the category
 * from data the analysis already produces, so it works for existing users too.
 *
 * Tags are Adzuna GB's documented category `tag` values (the `category` search
 * param). Returns null when nothing matches confidently — better an unconstrained
 * search than the wrong category.
 */

// Each category tag → signal words that imply it. First match wins, so order
// matters: more specific sectors are listed before generic ones.
const CATEGORY_SIGNALS: [tag: string, signals: string[]][] = [
  ['creative-design-jobs', ['design', 'graphic', 'ux', 'ui', 'creative', 'art', 'illustrat', 'brand', 'visual', 'fashion', 'photograph', 'film', 'video', 'animation', 'gallery', 'curat', 'museum']],
  ['pr-advertising-marketing-jobs', ['marketing', 'advertis', 'pr ', 'public relations', 'communications', 'social media', 'content', 'copywrit', 'media', 'brand manager', 'digital marketing', 'seo']],
  ['it-jobs', ['software', 'developer', 'engineer', 'data', 'analyst', 'machine learning', 'devops', 'cyber', 'cloud', 'programmer', 'it support', 'qa', 'product manager', 'data scientist', 'python']],
  ['accounting-finance-jobs', ['finance', 'account', 'audit', 'tax', 'investment', 'banking', 'wealth', 'private equity', 'actuar', 'financial', 'fund', 'trading', 'family office']],
  ['legal-jobs', ['legal', 'solicitor', 'lawyer', 'paralegal', 'barrister', 'compliance', 'law ']],
  ['engineering-jobs', ['mechanical', 'electrical', 'civil engineer', 'aerospace', 'structural', 'manufacturing engineer', 'cad']],
  ['scientific-qa-jobs', ['research scientist', 'laborator', 'chemist', 'biolog', 'clinical', 'pharma', 'r&d', 'scientific']],
  ['healthcare-nursing-jobs', ['nurse', 'healthcare', 'medical', 'clinical', 'care assistant', 'therapist', 'physio', 'mental health']],
  ['teaching-jobs', ['teacher', 'teaching', 'lecturer', 'tutor', 'education', 'academic', 'school', 'curriculum']],
  ['social-work-jobs', ['social work', 'social care', 'youth work', 'safeguarding', 'support worker']],
  ['charity-voluntary-jobs', ['charity', 'ngo', 'non-profit', 'nonprofit', 'fundraising', 'voluntary', 'third sector', 'impact', 'advocacy']],
  ['hospitality-catering-jobs', ['hospitality', 'catering', 'chef', 'restaurant', 'hotel', 'events', 'tourism', 'leisure']],
  ['consultancy-jobs', ['consultant', 'consulting', 'strategy', 'advisory', 'management consult']],
  ['hr-jobs', ['human resources', 'recruit', 'talent', 'people team', 'hr ', 'l&d']],
  ['sales-jobs', ['sales', 'business development', 'account executive', 'account manager', 'commercial']],
  ['property-jobs', ['property', 'real estate', 'estate agent', 'surveyor', 'lettings', 'planning']],
  ['logistics-warehouse-jobs', ['logistics', 'supply chain', 'warehouse', 'procurement', 'operations coordinator']],
  ['energy-oil-gas-jobs', ['energy', 'oil', 'gas', 'renewable', 'sustainability', 'environmental', 'climate', 'carbon', 'esg']],
  ['retail-jobs', ['retail', 'merchandis', 'buyer', 'store', 'e-commerce', 'ecommerce']],
  ['admin-jobs', ['administrat', 'office manager', 'coordinator', 'assistant', 'pa ', 'executive assistant', 'operations']],
];

/**
 * Pick the best Adzuna category for this profile.
 * @param sectors  extractedSectors from the analysis (strongest signal)
 * @param titles   topRoleTitles from the analysis
 * @param keywords searchKeywords (weakest signal, used last)
 */
export function mapAdzunaCategory(
  sectors: string[] = [],
  titles: string[] = [],
  keywords: string[] = []
): string | null {
  // Sectors first (most reliable), then titles, then keywords.
  const haystacks = [sectors, titles, keywords].map((arr) =>
    arr.join(' ').toLowerCase()
  );

  for (const haystack of haystacks) {
    if (!haystack.trim()) continue;
    for (const [tag, signals] of CATEGORY_SIGNALS) {
      if (signals.some((sig) => haystack.includes(sig))) return tag;
    }
  }
  return null;
}

import Law from 'classes/Law';
import useAction from 'hooks/useAction';
import useJurisdiction from 'hooks/useJurisdiction';

/**
 * Hook for work with laws.
 *
 * @typedef {import('../classes/JurisdictionRule').JurisdictionRule} Rule
 */
export default function useLaw() {
  const { getAction } = useAction();
  const { getJusirsdictionRules } = useJurisdiction();

  /**
   * Get laws by specified rules.
   *
   * @param {Array.<Rule>} rules Rules.
   * @returns {Promise.<Map.<string,Law>>} A map with laws.
   */
  let getLawsByRules = async function (rules) {
    let laws = new Map();
    for (const rule of rules) {
      try {
        // Find or create law by action (about)
        let law = laws.get(rule.rule.about);
        if (!law) {
          const action = await getAction(rule.rule.about);
          law = new Law(action);
        }
        // Add rule to law
        law.addRule(rule);
        // Update laws
        laws.set(rule.rule.about, law);
      } catch (error) {
        continue;
      }
    }
    return laws;
  };

  /**
   * Get laws by specified jurisdiction.
   *
   * @param {string} jurisdiction Jurisdiction id (address).
   * @returns {Promise.<Map.<string,Law>>} A map with laws.
   */
  // eslint-disable-next-line no-unused-vars
  let getLawsByJurisdiction = async function (jurisdiction) {
    const rules = await getJusirsdictionRules(null, jurisdiction, null);
    const laws = await getLawsByRules(rules);
    return laws;
  };

  return {
    getLawsByRules,
    getLawsByJurisdiction,
  };
}

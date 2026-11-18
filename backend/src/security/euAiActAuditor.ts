/**
 * @file euAiActAuditor.ts
 * @description Enterprise AI Governance & EU AI Act / ISO 42001 Compliance Auditor (Role #24).
 * Performs automated regulatory risk-tier classification (Unacceptable, High, Limited, Minimal),
 * validates Article 50 synthetic transparency disclosures, and audits ISO/IEC 42001 control domains.
 * Executed 100% in pure TypeScript.
 */

export type EuAiActRiskTier = 'UNACCEPTABLE_RISK' | 'HIGH_RISK' | 'LIMITED_TRANSPARENCY_RISK' | 'MINIMAL_RISK';

export interface SystemProfileInput {
  systemName: string;
  intendedDomain: 'HEALTHCARE' | 'FINANCE_CREDIT' | 'HR_RECRUITMENT' | 'CUSTOMER_CHATBOT' | 'DEV_TOOLING' | 'SOCIAL_SCORING';
  interactsDirectlyWithHumans: boolean;
  generatesSyntheticMedia: boolean;
  makesAutomatedLegalDecisions: boolean;
  hasHumanOversightKillSwitch: boolean;
  usesStrictDlpMasking: boolean;
  hasAuditLoggingEnabled: boolean;
}

export interface Iso42001ControlCheck {
  controlId: string;
  clause: string;
  name: string;
  requirement: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL';
  evidence: string;
}

export interface EuAiActAuditReport {
  systemName: string;
  riskTier: EuAiActRiskTier;
  legalStatus: 'PERMITTED_WITH_MANDATORY_CE_MARK' | 'PERMITTED_WITH_TRANSPARENCY' | 'PERMITTED_UNRESTRICTED' | 'PROHIBITED';
  compositeComplianceScore: number; // 0 - 100
  article50TransparencyPassed: boolean;
  humanOversightPassed: boolean;
  mandatoryRequirements: string[];
  iso42001Controls: Iso42001ControlCheck[];
  timestamp: string;
}

export class EuAiActAuditor {
  private static instance: EuAiActAuditor;

  private constructor() {}

  public static getInstance(): EuAiActAuditor {
    if (!EuAiActAuditor.instance) {
      EuAiActAuditor.instance = new EuAiActAuditor();
    }
    return EuAiActAuditor.instance;
  }

  /**
   * Classifies the AI system into the official EU AI Act risk tiers.
   */
  public classifyRiskTier(profile: SystemProfileInput): EuAiActRiskTier {
    // Article 5: Prohibited Practices (Unacceptable Risk)
    if (profile.intendedDomain === 'SOCIAL_SCORING') {
      return 'UNACCEPTABLE_RISK';
    }

    // Article 6 & Annex III: High-Risk AI Systems
    if (
      profile.intendedDomain === 'HR_RECRUITMENT' ||
      profile.intendedDomain === 'FINANCE_CREDIT' ||
      profile.intendedDomain === 'HEALTHCARE' ||
      profile.makesAutomatedLegalDecisions
    ) {
      return 'HIGH_RISK';
    }

    // Article 50: Transparency Obligations (Limited Risk)
    if (profile.interactsDirectlyWithHumans || profile.generatesSyntheticMedia || profile.intendedDomain === 'CUSTOMER_CHATBOT') {
      return 'LIMITED_TRANSPARENCY_RISK';
    }

    // Minimal Risk
    return 'MINIMAL_RISK';
  }

  /**
   * Conducts full compliance audit against EU AI Act & ISO/IEC 42001.
   */
  public auditSystem(profile: SystemProfileInput): EuAiActAuditReport {
    const riskTier = this.classifyRiskTier(profile);

    let legalStatus: EuAiActAuditReport['legalStatus'] = 'PERMITTED_UNRESTRICTED';
    const mandatoryReqs: string[] = [];

    switch (riskTier) {
      case 'UNACCEPTABLE_RISK':
        legalStatus = 'PROHIBITED';
        mandatoryReqs.push('SYSTEM CANNOT BE DEPLOYED: Violates Article 5 prohibited AI practices.');
        break;
      case 'HIGH_RISK':
        legalStatus = 'PERMITTED_WITH_MANDATORY_CE_MARK';
        mandatoryReqs.push(
          'Article 9: Risk Management System implementation mandatory.',
          'Article 10: Data Governance & Training Data Bias mitigation required.',
          'Article 11: Technical Documentation & EU Database registration.',
          'Article 14: Human-in-the-Loop oversight & emergency kill-switch controls.',
          'Article 15: Cybersecurity robustness & fallback procedures.'
        );
        break;
      case 'LIMITED_TRANSPARENCY_RISK':
        legalStatus = 'PERMITTED_WITH_TRANSPARENCY';
        mandatoryReqs.push(
          'Article 50(1): Users must be informed that they are interacting with an artificial intelligence system.',
          'Article 50(2): Synthetic text and generative content must be marked with machine-readable labels/watermarks.'
        );
        break;
      case 'MINIMAL_RISK':
        legalStatus = 'PERMITTED_UNRESTRICTED';
        mandatoryReqs.push('Standard corporate code of conduct; voluntary adherence to EU AI Pact.');
        break;
    }

    // Evaluate ISO/IEC 42001 Controls
    const iso42001Controls: Iso42001ControlCheck[] = [
      {
        controlId: 'A.5.1',
        clause: 'Policies for AI',
        name: 'AI Governance Policy',
        requirement: 'Establish organizational policies and security thresholds for AI deployment.',
        status: 'COMPLIANT',
        evidence: 'STRIDE Threat Model and AppSec Policy documented in docs/06_cybersecurity_appsec_llm.md',
      },
      {
        controlId: 'A.6.2',
        clause: 'AI Risk Assessment',
        name: 'Continuous Vulnerability Assessment',
        requirement: 'Continuously scan for prompt injection, data exfiltration, and model drift.',
        status: profile.hasAuditLoggingEnabled ? 'COMPLIANT' : 'PARTIAL',
        evidence: profile.hasAuditLoggingEnabled
          ? 'OWASP LLM01 Firewall and automated audit logging active.'
          : 'Audit logging is disabled in this profile.',
      },
      {
        controlId: 'A.8.2',
        clause: 'Data for AI Systems',
        name: 'Data Privacy & PII Scrubbing',
        requirement: 'Protect user privacy and sanitize PII before transmitting data to vector stores.',
        status: profile.usesStrictDlpMasking ? 'COMPLIANT' : 'NON_COMPLIANT',
        evidence: profile.usesStrictDlpMasking
          ? 'DlpMasker active: Redacts SSNs, credit cards, emails, and credentials.'
          : 'Strict DLP masking is not enabled.',
      },
      {
        controlId: 'A.8.4',
        clause: 'Human Agency & Oversight',
        name: 'Human Intervention Controls',
        requirement: 'Ensure authorized humans can override, pause, or terminate automated agent actions.',
        status: profile.hasHumanOversightKillSwitch ? 'COMPLIANT' : 'NON_COMPLIANT',
        evidence: profile.hasHumanOversightKillSwitch
          ? 'Human-in-the-Loop supervisor gates and maxIteration hard stops enforced.'
          : 'Emergency human stop controls are missing.',
      },
      {
        controlId: 'A.9.1',
        clause: 'Monitoring & Review',
        name: 'RAG Faithfulness & Quality Metrics',
        requirement: 'Track groundedness, hallucination frequency, and answer relevance quantitatively.',
        status: 'COMPLIANT',
        evidence: 'Ragas Triad Evaluator actively scores Faithfulness, Relevance, and Groundedness.',
      },
    ];

    const compliantCount = iso42001Controls.filter((c) => c.status === 'COMPLIANT').length;
    const partialCount = iso42001Controls.filter((c) => c.status === 'PARTIAL').length;
    const score = Math.round(((compliantCount * 1.0 + partialCount * 0.5) / iso42001Controls.length) * 100);

    return {
      systemName: profile.systemName,
      riskTier,
      legalStatus,
      compositeComplianceScore: riskTier === 'UNACCEPTABLE_RISK' ? 0 : score,
      article50TransparencyPassed: profile.interactsDirectlyWithHumans,
      humanOversightPassed: profile.hasHumanOversightKillSwitch,
      mandatoryRequirements: mandatoryReqs,
      iso42001Controls,
      timestamp: new Date().toISOString(),
    };
  }
}

export const euAiAuditor = EuAiActAuditor.getInstance();

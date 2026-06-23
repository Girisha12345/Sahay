import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Ban, CheckCircle2, Cookie, Cookie as CookieIcon, Database, FileText, Globe, LockKeyhole, MessageSquareText, RefreshCcw, Scale, Search, Shield, ShieldAlert, ShieldCheck, Sparkles, TimerReset, TriangleAlert, UserRoundCheck, Wallet } from "lucide-react";

export type PolicySection = {
  id: string;
  title: string;
  icon: LucideIcon;
  paragraphs: string[];
  bullets?: string[];
};

export type PolicyPageData = {
  slug: string;
  title: string;
  subtitle: string;
  heroDescription: string;
  updatedOn: string;
  heroIcon: LucideIcon;
  quickFacts: { label: string; value: string }[];
  sections: PolicySection[];
};

export const policyPages: Record<string, PolicyPageData> = {
  privacy: {
    slug: "/privacy-policy",
    title: "Privacy Policy",
    subtitle: "How Sahāy collects, uses, stores, and protects customer and provider information.",
    heroDescription:
      "This Privacy Policy explains how Sahāy handles personal data across our marketplace, mobile and web experiences, support channels, and partner integrations. It is written to be transparent, practical, and aligned with the expectations of a modern local services platform.",
    updatedOn: "June 2026",
    heroIcon: ShieldCheck,
    quickFacts: [
      { label: "Scope", value: "Marketplace users, providers, visitors, and support interactions" },
      { label: "Focus", value: "Transparency, consent, and secure handling" },
      { label: "Data Types", value: "Profile, booking, payment, device, and communication data" },
    ],
    sections: [
      {
        id: "information-we-collect",
        title: "Information We Collect",
        icon: FileText,
        paragraphs: [
          "Sahāy collects information that helps us create accounts, connect customers with verified service providers, process bookings, and deliver support. Some details are provided directly by you, such as your name, mobile number, email address, address, service preferences, and the content you submit through forms or chat. When providers join the platform, we may also collect business details, service categories, identity documents, certifications, availability, and location data required to operate a trusted marketplace.",
          "We also gather technical and usage information when you interact with our website or app. This may include device identifiers, browser type, IP address, timestamps, pages viewed, search terms, app events, and approximate location derived from your device or network. In addition, we may record communications you send to us through support channels, dispute forms, or in-app chat to improve service quality and resolve issues fairly."
        ],
      },
      {
        id: "how-we-use-information",
        title: "How We Use Information",
        icon: Search,
        paragraphs: [
          "We use information to create and manage accounts, match customers with suitable providers, confirm bookings, calculate charges, send notifications, and enable in-app communication. Data also helps us personalize the experience, improve search relevance, and recommend categories that are more likely to fit a user’s needs. For providers, this includes showing service areas, availability windows, and profile information that help customers make informed choices.",
          "Sahāy may also use information for safety, analytics, fraud detection, payment reconciliation, dispute handling, and customer service. We may send transactional updates such as booking confirmations, reminders, support replies, and policy notices. Where permitted by law and where you have provided consent, we may send promotional messages about offers or new services, but you can opt out of marketing communications at any time."
        ],
      },
      {
        id: "data-storage",
        title: "Data Storage",
        icon: Database,
        paragraphs: [
          "We store data on secure infrastructure and retain it only for as long as necessary to fulfill the purposes described in this Policy. Retention periods vary depending on the category of information, legal obligations, accounting requirements, customer support history, and the need to investigate disputes or suspicious activity. Some records may be retained after account closure to comply with tax, audit, or regulatory rules.",
          "Where data is no longer required, we delete it, anonymize it, or archive it in a form that cannot reasonably identify you. Backups may exist for a limited period as part of disaster recovery processes, but those backups are also protected and eventually overwritten according to our retention cycles."
        ],
      },
      {
        id: "data-protection",
        title: "Data Protection",
        icon: LockKeyhole,
        paragraphs: [
          "Sahāy uses reasonable administrative, technical, and organizational safeguards to protect personal information against unauthorized access, loss, disclosure, or misuse. These measures include access controls, password policies, role-based permissions, encrypted transmission where applicable, review of privileged access, and monitoring for suspicious behavior. We train internal teams on privacy practices so that user information is handled with care.",
          "No internet-based service can guarantee absolute security, but we continuously assess risk and improve our controls. If we identify a potential security incident, we investigate promptly, limit further exposure, and notify affected users or authorities when required by law. We also expect users to protect their own credentials and avoid sharing login access with others."
        ],
      },
      {
        id: "third-party-services",
        title: "Third-Party Services",
        icon: Globe,
        paragraphs: [
          "We may rely on third-party providers for payment processing, messaging, analytics, cloud hosting, customer support tools, and communications infrastructure. These service providers process information only on our behalf and under contractual obligations designed to protect user data. Where feasible, we try to share the minimum information needed for the service to function.",
          "If you choose to interact with third-party links, embedded tools, or external services, their privacy practices will govern the data they collect from you. Sahāy is not responsible for the practices of third-party websites that are outside our control, so we encourage you to review their policies before sharing information."
        ],
      },
      {
        id: "user-rights",
        title: "User Rights",
        icon: UserRoundCheck,
        paragraphs: [
          "Depending on applicable law, you may have the right to access, correct, update, or delete certain personal information associated with your account. You may also be able to restrict certain uses of data, withdraw consent, or request a copy of your information in a portable format. We will review and process valid requests in a reasonable timeframe, subject to identity verification and legal exceptions.",
          "To protect user privacy, some requests may be limited where the data is required for fraud prevention, dispute resolution, compliance, or the legitimate operation of the marketplace. If we cannot honor a request in full, we will explain the reason clearly and provide the closest available option."
        ],
      },
      {
        id: "contact-information",
        title: "Contact Information",
        icon: MessageSquareText,
        paragraphs: [
          "If you have questions about this Privacy Policy or how we handle personal information, you can contact our legal and support teams using the details below. We take privacy concerns seriously and aim to respond with practical guidance, not generic replies. For unresolved concerns, we may ask for additional information to verify identity and understand the issue.",
          "Email: legal@sahay.app and support@sahay.app. Sahāy may update this Privacy Policy from time to time to reflect legal, operational, or product changes. When we make material updates, we will revise the last updated date and, where appropriate, provide notice through the platform."
        ],
      },
    ],
  },
  terms: {
    slug: "/terms-conditions",
    title: "Terms & Conditions",
    subtitle: "The rules that govern use of the Sahāy marketplace by customers, service providers, and visitors.",
    heroDescription:
      "These Terms & Conditions define the relationship between Sahāy and its users. They cover account creation, booking rules, service delivery, payments, limitations of liability, and the standards expected from everyone using the marketplace.",
    updatedOn: "June 2026",
    heroIcon: Scale,
    quickFacts: [
      { label: "Who it applies to", value: "Customers, providers, and guests" },
      { label: "Purpose", value: "Marketplace rules and user expectations" },
      { label: "Key Themes", value: "Eligibility, bookings, payments, and conduct" },
    ],
    sections: [
      {
        id: "user-eligibility",
        title: "User Eligibility",
        icon: BadgeCheck,
        paragraphs: [
          "Sahāy is intended for users who can lawfully enter into contracts under applicable law. If you are using the platform on behalf of a business, organization, or family member, you confirm that you have permission to bind that party to these Terms. Providers may be subject to additional verification requirements before they can list services or receive bookings.",
          "We reserve the right to refuse access, restrict features, or request further verification if we believe an account is being used in a way that is inconsistent with our marketplace standards. Eligibility also includes compliance with local regulations, tax rules, and any profession-specific requirements that apply to the services offered."
        ],
      },
      {
        id: "account-registration",
        title: "Account Registration",
        icon: BadgeCheck,
        paragraphs: [
          "To use core features, users may need to create an account and provide accurate information. You are responsible for maintaining the confidentiality of your login credentials and for all activity carried out from your account. If you believe your account has been compromised, you should notify us immediately so we can help secure it.",
          "You agree to keep your profile information current, including contact details and address information where relevant. False, misleading, or incomplete information may affect bookings, support, and dispute resolution. Sahāy may suspend accounts that repeatedly submit inaccurate details or attempt to manipulate the platform."
        ],
      },
      {
        id: "booking-rules",
        title: "Booking Rules",
        icon: Wallet,
        paragraphs: [
          "Bookings are requests for services and become confirmed only when accepted according to platform rules. Service descriptions, estimated prices, timing, and availability may change based on provider confirmation, location, or technical issues. Users should review service details carefully before completing a booking request.",
          "Sahāy may allow rescheduling, booking modifications, or chat-based clarifications where the provider agrees. However, any special arrangements that are not documented in the platform may not be recognized for support or refund decisions. We recommend using the platform tools for all material booking changes."
        ],
      },
      {
        id: "provider-responsibilities",
        title: "Service Provider Responsibilities",
        icon: ShieldCheck,
        paragraphs: [
          "Providers are responsible for accurately describing their services, responding to bookings in a timely manner, arriving prepared, and maintaining professional behavior on-site and in chat. They must comply with relevant laws, licensing requirements, and safety practices. Providers should not misrepresent qualifications, charge hidden fees, or use the platform to solicit off-platform payments.",
          "A provider’s conduct reflects on the Sahāy marketplace. Repeated cancellations, poor service quality, rude behavior, or policy breaches may result in reduced visibility, penalties, temporary suspension, or permanent account termination. We expect providers to maintain a service standard that a customer can reasonably trust."
        ],
      },
      {
        id: "customer-responsibilities",
        title: "Customer Responsibilities",
        icon: UserRoundCheck,
        paragraphs: [
          "Customers must provide accurate address details, clear service requirements, safe access to the service location, and timely communication. If a provider arrives and cannot complete the job because the required access or information was not provided, that may still be treated as a completed visit or a customer-side issue, depending on the facts.",
          "Customers are also responsible for respectful conduct, safeguarding personal belongings, and reviewing service outcomes promptly. Attempts to abuse providers, manipulate booking outcomes, or use the platform for false complaints may lead to restrictions on future use of Sahāy."
        ],
      },
      {
        id: "payments-and-refunds",
        title: "Payments and Refunds",
        icon: RefreshCcw,
        paragraphs: [
          "Payments may be collected through the platform or through approved payment mechanisms. Pricing may include service fees, taxes, convenience charges, or partner-specific adjustments. Users should review the checkout page carefully before confirming payment. If a charge is disputed, we may request booking records, chat logs, and other supporting information.",
          "Refunds are governed by the applicable policy for each booking. In some cases, partial refunds may be issued based on the work completed, the cancellation stage, or the provider’s inability to perform the service. Refund decisions are designed to be practical, fair, and consistent with marketplace operations."
        ],
      },
      {
        id: "suspension-termination",
        title: "Suspension & Termination",
        icon: TriangleAlert,
        paragraphs: [
          "Sahāy may suspend or terminate access to the platform if a user violates these Terms, engages in fraud, abuses support systems, threatens safety, or repeatedly disrupts the booking experience. We may also limit specific features while investigating complaints or suspicious behavior. Wherever possible, we will provide a reason and allow the user to respond.",
          "Termination does not remove obligations already incurred, such as payment obligations, dispute resolution duties, or privacy and intellectual property commitments. Certain sections of these Terms survive termination to the extent required to protect Sahāy, its users, and its service partners."
        ],
      },
      {
        id: "liability",
        title: "Limitation of Liability",
        icon: Shield,
        paragraphs: [
          "Sahāy provides a marketplace platform that helps users discover, compare, and book services. We are not responsible for every action taken by a third-party service provider, especially where the provider acts outside our instructions or violates applicable law. While we take reasonable steps to maintain quality and safety, the platform is provided on an as-available basis.",
          "To the extent permitted by law, Sahāy’s liability for indirect, incidental, or consequential losses is limited. Nothing in these Terms is intended to exclude liability that cannot legally be limited. Users are encouraged to read service details carefully, retain receipts, and contact support quickly if something appears inconsistent or unsafe."
        ],
      },
    ],
  },
  cancellation: {
    slug: "/cancellation-policy",
    title: "Cancellation Policy",
    subtitle: "Rules that explain how cancellations work for customers and providers on Sahāy.",
    heroDescription:
      "This Cancellation Policy is designed to balance customer flexibility with provider fairness. It covers when cancellations are allowed, how refunds are evaluated, and how no-shows or emergency situations are handled in a real-world services marketplace.",
    updatedOn: "June 2026",
    heroIcon: RefreshCcw,
    quickFacts: [
      { label: "Customer side", value: "Flexibility before work starts, fairness after dispatch" },
      { label: "Provider side", value: "Reasonable notice and accountability" },
      { label: "Refund focus", value: "Based on timing, work status, and special cases" },
    ],
    sections: [
      {
        id: "customer-cancellation-rules",
        title: "Customer Cancellation Rules",
        icon: Ban,
        paragraphs: [
          "Customers may cancel a booking before the provider begins dispatch or before materials are purchased, subject to the specific booking stage shown in the app. If a cancellation occurs very close to the appointment time or after the provider has already traveled to the site, a cancellation fee or reduced refund may apply. This protects provider time and travel costs while still giving customers flexibility.",
          "When possible, customers should use the in-app cancellation flow rather than informal messages. That creates a clean record of the timing and helps support teams assess whether a fee or refund adjustment is appropriate. If the service has already started, cancellation may be treated as a partial completion rather than a full cancellation."
        ],
      },
      {
        id: "provider-cancellation-rules",
        title: "Provider Cancellation Rules",
        icon: TriangleAlert,
        paragraphs: [
          "Providers are expected to honor accepted bookings. If a provider must cancel, they should do so as early as possible and provide a clear reason through the platform. Late cancellations can disrupt the customer’s schedule and may affect visibility or performance metrics on the marketplace.",
          "Repeated cancellation without genuine cause may result in penalties, restricted lead access, or account review. We recognize that emergencies happen, so the policy allows room for legitimate issues, but the expectation is professional reliability."
        ],
      },
      {
        id: "refund-conditions",
        title: "Refund Conditions",
        icon: Wallet,
        paragraphs: [
          "Refund eligibility depends on the timing of the cancellation, whether the provider has already invested time or materials, and whether the service was partially or fully completed. In some situations, a booking fee, payment gateway charge, or dispatch cost may be non-refundable. The platform will show relevant charges where applicable so the customer can understand the final amount.",
          "If a provider cancels after acceptance and before service start, customers will generally receive a higher refund than if cancellation occurs after work has begun. Each case is reviewed on its facts, and customer support may request evidence such as chat history, timestamps, or photos before deciding a refund outcome."
        ],
      },
      {
        id: "emergency-cancellations",
        title: "Emergency Cancellations",
        icon: ShieldAlert,
        paragraphs: [
          "We understand that genuine emergencies can make a scheduled service impossible. Emergency cancellations may be considered more leniently where there is a serious health issue, transport disruption, safety incident, or another unexpected event outside a user’s control. Users should communicate the situation promptly and provide reasonable details when asked.",
          "Even in emergencies, Sahāy may need documentation to prevent misuse of the policy. Our goal is not to create unnecessary hurdles but to ensure that special treatment is reserved for real exceptional cases rather than routine convenience."
        ],
      },
      {
        id: "no-show-policy",
        title: "No-show Policy",
        icon: TimerReset,
        paragraphs: [
          "A no-show occurs when one party fails to attend the booking without adequate notice. If the customer is unavailable when the provider arrives, the provider may be entitled to a no-show fee or part of the booking amount. If the provider does not arrive or fails to make reasonable contact, the customer may be eligible for a stronger refund or an alternate service option.",
          "No-show handling is based on timestamps, communication history, and the circumstances of the booking. We encourage both sides to use the in-app chat or call functions to confirm arrival, share delays, and avoid unnecessary disputes."
        ],
      },
    ],
  },
  security: {
    slug: "/security-policy",
    title: "Security Policy",
    subtitle: "How Sahāy protects users, payments, and conversations across the marketplace.",
    heroDescription:
      "This Security Policy explains the controls Sahāy uses to support secure payments, account integrity, fraud prevention, user safety, and incident response. It is written for a marketplace environment where trust is a product feature, not an afterthought.",
    updatedOn: "June 2026",
    heroIcon: Shield,
    quickFacts: [
      { label: "Security model", value: "Layered controls with monitoring and review" },
      { label: "User focus", value: "Payments, identity, chat, and safety" },
      { label: "Response", value: "Detect, contain, investigate, and notify" },
    ],
    sections: [
      {
        id: "secure-payments",
        title: "Secure Payments",
        icon: Wallet,
        paragraphs: [
          "Sahāy works with trusted payment partners and follows secure transaction practices to reduce the risk of unauthorized charges or exposure of sensitive payment information. We avoid collecting more payment data than necessary and rely on payment processors for many card and wallet functions. Users should still verify payment details before completing a transaction and keep a copy of their receipt.",
          "When a payment event looks unusual, we may place a temporary hold, request verification, or route the transaction for manual review. These checks are intended to protect both customers and providers from fraudulent activity and chargeback abuse."
        ],
      },
      {
        id: "data-encryption",
        title: "Data Encryption",
        icon: LockKeyhole,
        paragraphs: [
          "Sensitive data is protected in transit and, where applicable, at rest through modern encryption standards and controlled access processes. Encryption helps reduce the chance that intercepted data can be understood or misused. We also limit who can access sensitive records internally and track access to important systems.",
          "Security is not only about cryptography; it is also about discipline. That is why we pair encryption with permission checks, device hardening, logs, and operational reviews. Together, these measures help protect information while keeping the platform usable and fast."
        ],
      },
      {
        id: "authentication",
        title: "Authentication",
        icon: Fingerprint,
        paragraphs: [
          "Sahāy uses authentication methods to make sure that the right person is accessing the right account. This may include one-time codes, password controls, session timeouts, and other verification steps where needed. Users should choose strong passwords, avoid password reuse, and sign out from shared devices.",
          "If we detect repeated login failures, suspicious location patterns, or unusual device behavior, we may ask for additional verification. These steps are designed to prevent account takeover rather than inconvenience legitimate users."
        ],
      },
      {
        id: "fraud-prevention",
        title: "Fraud Prevention",
        icon: BadgeCheck,
        paragraphs: [
          "Marketplace fraud can include fake bookings, stolen cards, identity misuse, chargeback abuse, or attempts to move transactions off-platform. Sahāy uses rule-based and human review methods to identify suspicious behavior. We may temporarily freeze accounts, withhold payouts, or request supporting documents if activity appears inconsistent.",
          "No system can prevent every fraud attempt, but we continuously update our detection logic as new threats emerge. We also encourage users to report suspicious offers, strange payment requests, and profiles that appear to impersonate legitimate providers."
        ],
      },
      {
        id: "chat-monitoring",
        title: "Chat Monitoring",
        icon: MessageSquareText,
        paragraphs: [
          "In-app chat helps customers and providers clarify service details without exposing personal contact information too early. We may monitor chat metadata and, where required for safety or policy enforcement, review message content related to disputes, abuse, fraud, or harassment. This helps keep the platform usable and respectful.",
          "We encourage users to keep all important booking details inside the platform because it creates a traceable record. Off-platform messaging can make it harder to resolve disputes and protect both sides."
        ],
      },
      {
        id: "user-safety",
        title: "User Safety",
        icon: ShieldCheck,
        paragraphs: [
          "Safety covers more than cyber protection. Sahāy expects providers to behave professionally, customers to maintain respectful conduct, and all users to report any unsafe experience promptly. We may use profile reviews, booking history, and support reports to identify accounts that need closer attention.",
          "If a safety issue is reported, we may temporarily restrict contact, advise users to move away from the location, or escalate the matter to internal review. Serious incidents may also be referred to appropriate authorities."
        ],
      },
      {
        id: "incident-response",
        title: "Incident Response",
        icon: TriangleAlert,
        paragraphs: [
          "When a security incident is suspected, our goal is to act quickly: detect the issue, contain it, investigate the cause, and restore service safely. We may reset credentials, invalidate sessions, restrict affected features, or contact users for additional verification. We also keep logs and operational records that help us understand the event and prevent recurrence.",
          "If a breach or material risk affects user information, Sahāy will follow applicable legal notification obligations. Our incident process is designed to be calm, documented, and accountable rather than reactive or vague."
        ],
      },
    ],
  },
  cookies: {
    slug: "/cookie-policy",
    title: "Cookie Policy",
    subtitle: "How Sahāy uses cookies and similar technologies to operate and improve the marketplace.",
    heroDescription:
      "This Cookie Policy explains the types of cookies and related technologies Sahāy uses on its website and app, why we use them, and how users can manage preferences in a practical way.",
    updatedOn: "June 2026",
    heroIcon: Cookie,
    quickFacts: [
      { label: "Purpose", value: "Platform functionality, analytics, and preference handling" },
      { label: "Control", value: "You can manage non-essential preferences" },
      { label: "Approach", value: "Minimal data, useful signals, clear choices" },
    ],
    sections: [
      {
        id: "what-are-cookies",
        title: "What Are Cookies",
        icon: CookieIcon,
        paragraphs: [
          "Cookies are small text files stored on your browser or device that help websites remember information about your visit. Similar technologies may include local storage, pixels, tags, or SDK-based identifiers. At Sahāy, these tools help us remember preferences, keep users signed in where appropriate, and understand how the platform is being used.",
          "Cookies do not directly read personal files on your device. Their main role is to support basic site operation, improve convenience, and provide usage insights. In a service marketplace, that means helping users move efficiently from search to booking without having to repeat the same settings on every visit."
        ],
      },
      {
        id: "types-of-cookies-used",
        title: "Types of Cookies Used",
        icon: Globe,
        paragraphs: [
          "Sahāy may use session cookies, persistent cookies, first-party cookies, and limited third-party cookies. Session cookies help the site function while you are actively using it, while persistent cookies remember preferences after the session ends. First-party cookies are set by Sahāy, and third-party cookies may be set by integrated service providers such as analytics or payment partners.",
          "We categorize cookies so users can understand which ones are essential and which are optional. This approach gives the platform enough information to work well while respecting the principle of data minimization."
        ],
      },
      {
        id: "essential-cookies",
        title: "Essential Cookies",
        icon: CheckCircle2,
        paragraphs: [
          "Essential cookies are required for core functions such as sign-in, security checks, navigation, cart or booking continuity, and remembering consent choices. Without these cookies, some parts of the site may not function properly. Because they are necessary for the service you request, they typically cannot be disabled through the platform without breaking important features.",
          "These cookies support authentication, session integrity, and important marketplace actions. They are limited to what is needed to operate the service and do not exist to profile users for advertising purposes."
        ],
      },
      {
        id: "analytics-cookies",
        title: "Analytics Cookies",
        icon: Search,
        paragraphs: [
          "Analytics cookies help us understand how users move through the site, which pages are visited most often, and where users may face friction. For example, if a large number of visitors leave a page before completing a booking or a form, that may indicate a design issue that we should improve. We use these signals to make the experience clearer and faster.",
          "Where analytics tools are used, we aim to limit unnecessary collection and configure them in a privacy-conscious way. Our goal is not to track users endlessly; it is to learn enough to make the marketplace better for real users."
        ],
      },
      {
        id: "marketing-cookies",
        title: "Marketing Cookies",
        icon: Sparkles,
        paragraphs: [
          "Marketing cookies may be used to measure the effectiveness of campaigns, understand how visitors found Sahāy, or show relevant reminders about services and promotions. We keep these signals limited and apply them only where allowed and appropriate. If you prefer not to receive personalized marketing signals, you can manage your preferences through the available controls.",
          "Any marketing-related cookie use should feel helpful rather than intrusive. Sahāy is a local service marketplace, so relevance matters more than volume, and we design our cookie usage with that principle in mind."
        ],
      },
      {
        id: "managing-cookie-preferences",
        title: "Managing Cookie Preferences",
        icon: UserRoundCheck,
        paragraphs: [
          "You can usually manage cookies through your browser settings, device controls, or any preference banner we provide. Blocking some cookies may affect sign-in, checkout, or other important functions. Where a cookie choice is optional, we try to provide a clear, easy way to accept or reject it.",
          "If you clear browser data, your settings may reset and you may need to update your preferences again. We recommend reviewing both browser-level controls and any on-site preference options if you want precise control over your experience."
        ],
      },
    ],
  },
};